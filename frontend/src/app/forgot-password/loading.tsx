export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="animate-pulse space-y-6">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
} 