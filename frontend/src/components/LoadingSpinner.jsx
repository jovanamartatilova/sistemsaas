// Consistent Loading Spinner for all Candidate pages
export function LoadingSpinner({ fullScreen = true, message = "Loading..." }) {
  const content = (
    <div className="flex items-center justify-center gap-3">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-indigo-600" />
      <span className="text-slate-600 font-medium">{message}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12 flex items-center justify-center">
      {content}
    </div>
  );
}
