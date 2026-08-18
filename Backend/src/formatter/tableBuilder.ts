/**
 * Professional Fixed-Width WhatsApp Table Builder
 *
 * Rules:
 *  - Every cell is EXACTLY colWidth characters — no multi-line wrapping.
 *  - Long values are truncated with "…" to keep every row a single line.
 *  - Column widths are computed dynamically from data, then proportionally scaled.
 *  - Works perfectly in WhatsApp monospace code blocks on both mobile and desktop.
 */

/** Truncate text to maxLen, appending … if cut */
function trunc(text: string, maxLen: number): string {
  const s = String(text ?? "N/A").trim();
  if (s.length <= maxLen) return s;
  return s.slice(0, maxLen - 1) + "…";
}

/** Pad (or truncate) string to exactly `width` characters */
function cell(text: string, width: number): string {
  const s = trunc(text, width);
  return s + " ".repeat(Math.max(0, width - s.length));
}

export interface TableColumn {
  header: string;
  maxWidth?: number;   // hard cap on column width
  minWidth?: number;   // minimum column width
}

export interface TableRow {
  cells: string[];     // cells[0] = label, cells[1..n] = values
}

/**
 * Build a professional, fixed-width WhatsApp table.
 * Every row is exactly ONE line. Values are truncated, never wrapped.
 *
 * @param columns      Column definitions
 * @param rows         Data rows
 * @param tableMaxWidth  Total max characters per line (default 52)
 */
export function buildTable(
  columns: TableColumn[],
  rows: TableRow[],
  tableMaxWidth = 52
): string {

  const numCols = columns.length;

  // ── Step 1: Measure natural widths (max of header vs all cell values)
  const naturalWidths: number[] = columns.map((col, ci) => {
    const cap = col.maxWidth ?? 999;
    const minW = col.minWidth ?? 3;
    const headerLen = col.header.length;
    const maxCellLen = rows.reduce((m, row) => {
      const v = String(row.cells[ci] ?? "N/A").trim().length;
      return Math.max(m, v);
    }, 0);
    return Math.max(minW, Math.min(cap, Math.max(headerLen, maxCellLen)));
  });

  // ── Step 2: Compute available content space
  // Layout: │ cell │ cell │ ... │  → borders = numCols+1, padding = numCols*2
  const usedByBorders = (numCols + 1) + (numCols * 2);
  const available = tableMaxWidth - usedByBorders;

  // ── Step 3: Scale column widths proportionally to fit `available` chars
  const naturalTotal = naturalWidths.reduce((s, w) => s + w, 0);
  let colWidths: number[];

  if (naturalTotal <= available) {
    colWidths = naturalWidths;
  } else {
    const minW = columns.map(c => c.minWidth ?? 3);
    const minTotal = minW.reduce((s, w) => s + w, 0);
    const surplus = Math.max(0, available - minTotal);
    const naturalSurplus = Math.max(1, naturalTotal - minTotal);

    colWidths = naturalWidths.map((w, i) => {
      const extra = Math.floor(((w - (minW[i])) / naturalSurplus) * surplus);
      return minW[i] + extra;
    });

    // Distribute any rounding remainder to widest column
    let used = colWidths.reduce((s, w) => s + w, 0);
    let diff = available - used;
    for (let i = 0; i < colWidths.length && diff > 0; i++) {
      const cap = columns[i].maxWidth ?? 999;
      if (colWidths[i] < cap) {
        colWidths[i]++;
        diff--;
      }
    }
  }

  // ── Step 4: Render lines

  const makeLine = (left: string, mid: string, right: string, fill: string) =>
    left + colWidths.map(w => fill.repeat(w + 2)).join(mid) + right;

  const topLine    = makeLine("┌", "┬", "┐", "─");
  const headerSep  = makeLine("├", "┼", "┤", "─");
  const rowSep     = makeLine("├", "┼", "┤", "─");
  const bottomLine = makeLine("└", "┴", "┘", "─");

  const renderRow = (cells: string[]): string =>
    "│" + cells.map((c, i) => " " + cell(c, colWidths[i]) + " ").join("│") + "│";

  const lines: string[] = [];
  lines.push(topLine);
  lines.push(renderRow(columns.map(c => c.header)));
  lines.push(headerSep);

  rows.forEach((row, ri) => {
    lines.push(renderRow(row.cells));
    if (ri < rows.length - 1) {
      lines.push(rowSep);
    }
  });

  lines.push(bottomLine);

  return lines.join("\n");
}
