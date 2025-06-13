
export default function HomePage() {
  return (
    <main className="min-h-screen bg-custom-lightblue flex flex-col items-center justify-center px-4 text-center">
      <section className="h-screen py-48">
        <div className="max-w-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">SmartSender</span>
          </h1>

          <p className="text-gray-600 text-lg mb-8">
            SmartSender: Effortless, personalized mass emails—powered by AI.
          </p>

          <div className="flex justify-center gap-4">
            <a
              href="/login"
              className="border bg-blue-600 border-blue-600 text-white hover:bg-blue-50  hover:text-blue-600 px-6 py-2 rounded-md transition"
            >
              Get Started
            </a>
          </div>
        </div>
      </section>
      <section className="p-40 -mt-88">
        <div className="relative w-fit mx-auto">
          {/* Otter image positioned above and to the right */}
          <img
            src="./otterpeaking.png"
            alt="Otter peeking"
            className="absolute -top-40 right-0 h-54"
          />

          {/* Main tab image */}
          <img
            src="./smartSender.png"
            alt="Image of a Tab"
            className="h-auto rounded-2xl"
          />
        </div>
      </section>

      <section className="py-10 px-40 max-h-screen">
        <div className="rounded-2xl">
          <img
            src="./smartSenderUser.png"
            alt="Image of a Tab"
            className="h-auto px-20 rounded-2xl"
          />
        </div>
      </section>
      <footer className="w-full text-gray-600 mt-24">
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-4 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">

          <div className="text-gray-800 text-xl font-semibold tracking-tight">
            SmartSender
            <p className="text-gray-500 text-sm">
              Made by Vivek Shaurya.
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SmartSender. All rights reserved.
          </div>

        </div>
      </footer>
    </main>

  )
}