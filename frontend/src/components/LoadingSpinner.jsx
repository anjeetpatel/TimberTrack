export default function LoadingSpinner({ size = 'default' }) {
  return (
    <div className={size === 'page' ? 'page-loading' : ''}>
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
    </div>
  );
}
