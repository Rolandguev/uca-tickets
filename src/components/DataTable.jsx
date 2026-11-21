import './DataTable.css';

// Tabla reutilizable.
export default function DataTable({ caption, columns, rows, rowKey, emptyText = 'No hay datos para mostrar.' }) {
  return (
    <div className="data-table">
      <table>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col" className={col.align === 'right' ? 'is-right' : undefined}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">{emptyText}</td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={rowKey(row)}>
                {columns.map((col) => (
                  <td key={col.key} data-label={col.label} className={col.align === 'right' ? 'is-right' : undefined}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}