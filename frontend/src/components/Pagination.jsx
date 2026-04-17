export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</button>
      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={idx} style={{ padding: '0 4px', color: 'var(--outline)' }}>…</span>
        ) : (
          <button key={idx} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</button>
    </div>
  );
}
