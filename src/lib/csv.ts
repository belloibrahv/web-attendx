function normalizeLineBreaks(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

export function parseCsv(text: string) {
  const rows: string[][] = [];
  const input = normalizeLineBreaks(text);
  let currentCell = "";
  let currentRow: string[] = [];
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const nextCharacter = input[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        currentCell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === "," && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    if (character === "\n" && !insideQuotes) {
      currentRow.push(currentCell.trim());
      rows.push(currentRow);
      currentCell = "";
      currentRow = [];
      continue;
    }

    currentCell += character;
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return { headers: [], records: [] as Array<Record<string, string>> };
  }

  const headers = rows[0].map((header) => header.trim());
  const records = rows
    .slice(1)
    .filter((row) => row.some((cell) => cell.length > 0))
    .map((row) =>
      headers.reduce<Record<string, string>>((record, header, columnIndex) => {
        record[header] = row[columnIndex]?.trim() ?? "";
        return record;
      }, {})
    );

  return { headers, records };
}
