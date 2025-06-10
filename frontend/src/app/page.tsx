export default function HomePage() {
  return (
    
    <main className="min-h-screen bg-custom-lightblue flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-blue-600">SmartSender</span>
        </h1>

        <p className="text-gray-600 text-lg mb-8">
          SmartSender: Effortless, personalized mass emails—powered by AI.
        </p>

        <div className="flex justify-center gap-4">
          <a
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition"
          >
            Go to Dashboard
          </a>
          <a
            href="/login"
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-md transition"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  )
}