import { Children, cloneElement, createContext, isValidElement, useContext, useEffect, useState } from "react";

// Paginated table that stacks into cards on narrow screens.

const STACKED_TABLE_QUERY = "(max-width: 767.98px)";

function useStackedTable() {
  const [stacked, setStacked] = useState(() => window.matchMedia(STACKED_TABLE_QUERY).matches);

  useEffect(() => {
    const query = window.matchMedia(STACKED_TABLE_QUERY);
    const handleChange = (e) => setStacked(e.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return stacked;
}

// Column headers, shared with Tr so each cell can label itself on mobile.
const TableHeadersContext = createContext([]);

// Table — responsive table that stacks into cards on mobile and paginates itself.

export function Table({ headers, children, pageSize = 20, mobilePageSize = 5, itemLabel = "records", hover = true }) {
  const rows = Children.toArray(children);
  const stacked = useStackedTable();
  const [page, setPage] = useState(1);

  const perPage = stacked ? mobilePageSize : pageSize;
  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  if (page > totalPages) setPage(totalPages);

  const paginated = rows.length > perPage;
  const start = (page - 1) * perPage;
  const visible = paginated ? rows.slice(start, start + perPage) : rows;

  return (
    <TableHeadersContext.Provider value={headers}>
      <div className="table-responsive">
        <table className={`table ${hover ? "table-hover" : ""} table-stack mb-0 align-middle`}>
          <thead className="table-head">
            <tr>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className={`text-uppercase text-muted small fw-semibold text-nowrap ${h.props?.className || ""}`}
                  style={{ fontSize: "var(--app-fs-1)", letterSpacing: 0.5 }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{visible}</tbody>
        </table>
      </div>
      {paginated && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          label={`Showing ${start + 1} to ${Math.min(start + perPage, rows.length)} of ${rows.length} ${itemLabel}`}
        />
      )}
    </TableHeadersContext.Provider>
  );
}

// Tr — table row; passes each column header down to its cells.

export function Tr({ children }) {
  const headers = useContext(TableHeadersContext);

  return (
    <tr>
      {Children.map(children, (child, i) =>
        isValidElement(child) ? cloneElement(child, { label: typeof headers[i] === "string" ? headers[i] : undefined }) : child,
      )}
    </tr>
  );
}

// Td — table cell.

export function Td({ children, bold, className = "", label }) {
  return (
    <td className={`${bold ? "fw-semibold" : ""} py-md-2 ${className}`} data-label={label}>
      {children}
    </td>
  );
}

// Pagination — table footer pager, rendered by Table when the rows overflow one page.
function Pagination({ page, totalPages, onChange, label }) {
  const windowSize = 5;
  let first = Math.max(1, page - Math.floor(windowSize / 2));
  const last = Math.min(totalPages, first + windowSize - 1);
  first = Math.max(1, last - windowSize + 1);
  const pages = Array.from({ length: last - first + 1 }, (_, i) => first + i);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between flex-wrap gap-2 px-3 py-2 border-top small">
      <span className="small text-muted">{label}</span>
      <nav aria-label="Pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onChange(Math.max(1, page - 1))}>
              &lsaquo;
            </button>
          </li>
          {pages.map((n) => (
            <li className={`page-item ${n === page ? "active" : ""}`} key={n}>
              <button className="page-link" onClick={() => onChange(n)}>
                {n}
              </button>
            </li>
          ))}
          <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onChange(Math.min(totalPages, page + 1))}>
              &rsaquo;
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

// FilterSelect — labeled select dropdown for filters.
