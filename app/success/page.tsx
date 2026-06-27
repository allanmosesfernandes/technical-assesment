export default function SuccessPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center">
        <div className="text-4xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment received</h1>
        <p className="text-sm text-gray-500">
          Your job listing will go live within the hour. Check your email for
          a confirmation from iPlace Global.
        </p>
      </div>
    </main>
  );
}
