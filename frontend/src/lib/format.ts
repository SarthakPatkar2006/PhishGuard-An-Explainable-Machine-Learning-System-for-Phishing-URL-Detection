function buildCsvPreviewColumns(columns: string[]) {
  const predictionColumns = columns.filter((column) => column === "predicted_column");
  const labelColumns = columns.filter((column) => column === "Result");
  const specialColumns = new Set<string>(["Result", "predicted_column"]);
  const featureColumns = columns.filter((column) => !specialColumns.has(column)).slice(0, 6);

  return [...featureColumns, ...labelColumns, ...predictionColumns];
}

function formatScanTime(value?: string) {
  if (!value) {
    return "Saved recently";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Saved recently";
  }

  return date.toLocaleString([], {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
}

export { buildCsvPreviewColumns, formatScanTime };
