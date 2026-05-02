export function LoadingSpinner({ fullScreen = true, message = "Loading..." }) {
  const content = (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "4px solid #e2e8f0",
        borderTopColor: "#6366f1",
        animation: "spin 0.7s linear infinite",
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 14, fontWeight: 500, color: "#64748b" }}>{message}</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {content}
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {content}
    </div>
  );
}