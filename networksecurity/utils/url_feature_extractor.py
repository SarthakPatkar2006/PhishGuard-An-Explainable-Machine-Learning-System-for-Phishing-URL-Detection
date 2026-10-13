import ipaddress
import re
import socket
from html.parser import HTMLParser
from typing import Dict, Iterable, List, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

import pandas as pd


FEATURE_COLUMNS = [
    "having_IP_Address",
    "URL_Length",
    "Shortining_Service",
    "having_At_Symbol",
    "double_slash_redirecting",
    "Prefix_Suffix",
    "having_Sub_Domain",
    "SSLfinal_State",
    "Domain_registeration_length",
    "Favicon",
    "port",
    "HTTPS_token",
    "Request_URL",
    "URL_of_Anchor",
    "Links_in_tags",
    "SFH",
    "Submitting_to_email",
    "Abnormal_URL",
    "Redirect",
    "on_mouseover",
    "RightClick",
    "popUpWidnow",
    "Iframe",
    "age_of_domain",
    "DNSRecord",
    "web_traffic",
    "Page_Rank",
    "Google_Index",
    "Links_pointing_to_page",
    "Statistical_report",
]


SHORTENING_DOMAINS = {
    "bit.ly",
    "cutt.ly",
    "goo.gl",
    "is.gd",
    "ow.ly",
    "rebrand.ly",
    "s.id",
    "t.co",
    "tiny.cc",
    "tinyurl.com",
    "t.ly",
    "urlz.fr",
    "v.gd",
}


class UrlHtmlSignals(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.anchors: List[str] = []
        self.resources: List[str] = []
        self.tag_links: List[str] = []
        self.form_actions: List[str] = []
        self.favicons: List[str] = []
        self.has_iframe = False

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, Optional[str]]]) -> None:
        attr_map = {name.lower(): value or "" for name, value in attrs}
        tag = tag.lower()

        if tag == "a" and attr_map.get("href"):
            self.anchors.append(attr_map["href"])

        if tag in {"img", "script", "audio", "video", "source", "iframe"}:
            src = attr_map.get("src")
            if src:
                self.resources.append(src)

        if tag in {"link", "script", "meta"}:
            href = attr_map.get("href") or attr_map.get("src") or attr_map.get("content")
            if href:
                self.tag_links.append(href)

        if tag == "link" and "icon" in attr_map.get("rel", "").lower():
            href = attr_map.get("href")
            if href:
                self.favicons.append(href)

        if tag == "form":
            self.form_actions.append(attr_map.get("action", ""))

        if tag in {"iframe", "frame"}:
            self.has_iframe = True


def normalize_url(raw_url: str) -> Tuple[str, object]:
    url = raw_url.strip()
    if not url:
        raise ValueError("Please enter a URL.")
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        url = "http://" + url
    parsed = urlparse(url)
    if not parsed.hostname:
        raise ValueError("Please enter a valid URL with a hostname.")
    return url, parsed


def is_ip_address(hostname: str) -> bool:
    try:
        ipaddress.ip_address(hostname.strip("[]"))
        return True
    except ValueError:
        return False


def registrable_domain(hostname: str) -> str:
    parts = [part for part in hostname.lower().split(".") if part and part != "www"]
    if len(parts) <= 2:
        return ".".join(parts)
    return ".".join(parts[-2:])


def is_same_site(candidate: str, base_url: str, base_host: str) -> bool:
    if not candidate or candidate.startswith(("#", "javascript:", "mailto:", "tel:")):
        return True
    target = urlparse(urljoin(base_url, candidate))
    if not target.hostname:
        return True
    return registrable_domain(target.hostname) == registrable_domain(base_host)


def ratio_score(items: Iterable[str], base_url: str, base_host: str, safe: float, warn: float) -> int:
    item_list = [item for item in items if item]
    if not item_list:
        return 1
    external = sum(1 for item in item_list if not is_same_site(item, base_url, base_host))
    ratio = external / len(item_list)
    if ratio < safe:
        return 1
    if ratio <= warn:
        return 0
    return -1


def fetch_html(url: str) -> Tuple[str, str]:
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (compatible; NetworkSecurityURLChecker/1.0)"
        },
    )
    try:
        with urlopen(request, timeout=6) as response:
            content_type = response.headers.get("content-type", "")
            charset = response.headers.get_content_charset() or "utf-8"
            if "text/html" not in content_type and "application/xhtml" not in content_type:
                return response.geturl(), ""
            body = response.read(700_000).decode(charset, errors="ignore")
            return response.geturl(), body
    except (HTTPError, URLError, TimeoutError, ValueError):
        return url, ""


def dns_record_status(hostname: str) -> int:
    try:
        socket.gethostbyname(hostname)
        return 1
    except OSError:
        return -1


def has_non_standard_port(parsed: object) -> bool:
    try:
        port = parsed.port
    except ValueError:
        return True
    return port is not None and port not in {80, 443}


def extract_url_features(raw_url: str) -> Tuple[pd.DataFrame, Dict[str, int], Dict[str, str]]:
    url, parsed = normalize_url(raw_url)
    hostname = parsed.hostname or ""
    host_lower = hostname.lower()
    final_url, html = fetch_html(url)
    final_host = urlparse(final_url).hostname or hostname

    parser = UrlHtmlSignals()
    if html:
        parser.feed(html)

    dot_count = host_lower.replace("www.", "", 1).count(".")
    dns_status = dns_record_status(hostname)
    redirect_count = 1 if final_url.rstrip("/") != url.rstrip("/") else 0
    path_after_scheme = url.split("://", 1)[-1]
    extra_double_slash = "//" in path_after_scheme

    features: Dict[str, int] = {
        "having_IP_Address": -1 if is_ip_address(hostname) else 1,
        "URL_Length": 1 if len(url) < 54 else 0 if len(url) <= 75 else -1,
        "Shortining_Service": -1 if registrable_domain(host_lower) in SHORTENING_DOMAINS else 1,
        "having_At_Symbol": -1 if "@" in url else 1,
        "double_slash_redirecting": -1 if extra_double_slash else 1,
        "Prefix_Suffix": -1 if "-" in host_lower else 1,
        "having_Sub_Domain": 1 if dot_count <= 1 else 0 if dot_count == 2 else -1,
        "SSLfinal_State": 1 if parsed.scheme == "https" else -1,
        "Domain_registeration_length": 1 if dns_status == 1 else -1,
        "Favicon": ratio_score(parser.favicons, url, hostname, 0.01, 0.99),
        "port": -1 if has_non_standard_port(parsed) else 1,
        "HTTPS_token": -1 if "https" in host_lower.replace("https", "", 1) else 1,
        "Request_URL": ratio_score(parser.resources, url, hostname, 0.22, 0.61),
        "URL_of_Anchor": ratio_score(parser.anchors, url, hostname, 0.31, 0.67),
        "Links_in_tags": ratio_score(parser.tag_links, url, hostname, 0.17, 0.81),
        "SFH": 1,
        "Submitting_to_email": -1 if re.search(r"mailto:|mail\(", html, re.IGNORECASE) else 1,
        "Abnormal_URL": -1 if registrable_domain(final_host) != registrable_domain(hostname) else 1,
        "Redirect": redirect_count,
        "on_mouseover": -1 if re.search(r"onmouseover|window\\.status", html, re.IGNORECASE) else 1,
        "RightClick": -1 if re.search(r"contextmenu|event\\.button\\s*==\\s*2", html, re.IGNORECASE) else 1,
        "popUpWidnow": -1 if re.search(r"window\\.open|popup", html, re.IGNORECASE) else 1,
        "Iframe": -1 if parser.has_iframe else 1,
        "age_of_domain": 1 if dns_status == 1 else -1,
        "DNSRecord": dns_status,
        "web_traffic": 0,
        "Page_Rank": -1,
        "Google_Index": 1,
        "Links_pointing_to_page": 0,
        "Statistical_report": -1 if is_ip_address(hostname) or registrable_domain(host_lower) in SHORTENING_DOMAINS else 1,
    }

    for action in parser.form_actions:
        if not action or action.lower() in {"about:blank", "#"}:
            features["SFH"] = -1
            break
        if not is_same_site(action, url, hostname):
            features["SFH"] = 0

    metadata = {
        "normalized_url": url,
        "final_url": final_url,
        "hostname": hostname,
        "html_status": "Fetched" if html else "Not fetched",
        "dns_status": "Resolved" if dns_status == 1 else "Not resolved",
    }

    dataframe = pd.DataFrame([[features[column] for column in FEATURE_COLUMNS]], columns=FEATURE_COLUMNS)
    return dataframe, features, metadata
