import heroVerdictImg from "../../assets/hero-verdict.png";

function HeroPreview() {
  return (
    <div className="relative group mx-auto w-full max-w-2xl">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500/30 to-blue-600/30 blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#040914]/80 shadow-[0_0_35px_rgba(6,182,212,0.25)] backdrop-blur-md">
        <img
          src={heroVerdictImg}
          alt="Live Model Verdict Preview"
          className="w-full h-auto object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}

export { HeroPreview };
