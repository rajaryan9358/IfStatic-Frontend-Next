export default function ServiceDetailLoading() {
  return (
    <div className="service-detail-loading-screen" aria-live="polite" aria-busy="true">
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-text">Loading</p>
    </div>
  );
}