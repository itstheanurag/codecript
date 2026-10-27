import { formatCell, type SqlResultSet } from "../lib/playground/engine";

interface SqlResultTableProps {
  result: SqlResultSet;
  maxRows?: number;
  compact?: boolean;
}

const ROW_LIMIT = 200;

const SqlResultTable = ({
  result,
  maxRows = ROW_LIMIT,
  compact = false,
}: SqlResultTableProps) => {
  const visibleRows = result.rows.slice(0, maxRows);
  const hiddenRows = result.rows.length - visibleRows.length;

  if (result.columns.length === 0) {
    return (
      <div className="rounded-md border border-paper-300 bg-paper-200/60 px-3 py-2 font-mono text-xs text-ink-muted">
        {result.command} · {result.affectedRows} row
        {result.affectedRows === 1 ? "" : "s"} affected
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-paper-300">
      <div className="max-h-[420px] overflow-auto">
        <table className="w-full border-collapse text-left font-mono text-[12px]">
          <thead className="sticky top-0 z-10 bg-paper-200">
            <tr>
              {result.columns.map((column) => (
                <th
                  key={column}
                  className="whitespace-nowrap border-b border-paper-300 px-3 py-1.5 font-semibold text-ink"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-paper-50" : "bg-paper-100"}
              >
                {result.columns.map((column) => {
                  const value = row[column];
                  const isNull = value === null || value === undefined;
                  return (
                    <td
                      key={column}
                      className={`whitespace-pre-wrap break-words border-b border-paper-300/60 px-3 ${
                        compact ? "py-1" : "py-1.5"
                      } ${isNull ? "italic text-ink-muted/70" : "text-ink-secondary"}`}
                    >
                      {formatCell(value)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-paper-300 bg-paper-200/70 px-3 py-1.5 text-[11px] font-sans text-ink-muted">
        <span>
          {result.rows.length.toLocaleString()} row
          {result.rows.length === 1 ? "" : "s"}
          {hiddenRows > 0 ? ` · showing first ${maxRows}` : ""}
        </span>
        <span className="font-mono uppercase tracking-wide">
          {result.command}
        </span>
      </div>
    </div>
  );
};

export default SqlResultTable;
