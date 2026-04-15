function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 text-slate-900">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          AI Image Generator
        </h1>
        <p className="mt-3 text-center text-sm text-slate-600 sm:text-base">
          Enter a prompt and generate your image idea.
        </p>

        <form className="mt-8 space-y-4">
          <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
            Prompt
          </label>
          <input
            id="prompt"
            type="text"
            placeholder="e.g. Futuristic city skyline at sunset"
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-base"
          />
          <button
            type="button"
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:text-base"
          >
            Generate
          </button>
        </form>
      </div>
    </main>
  )
}

export default Home
