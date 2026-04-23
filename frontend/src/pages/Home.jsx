import { useState } from 'react'
import axios from 'axios'

import { generateImage } from '../services/api'

const STYLE_OPTIONS = ['realistic', 'anime', 'digital art']
const SIZE_OPTIONS = ['256x256', '512x512', '1024x1024']

function Home() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState(STYLE_OPTIONS[0])
  const [size, setSize] = useState(SIZE_OPTIONS[1])
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState('')

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    setImageUrl('')

    if (!prompt.trim()) {
      setError('Please enter a prompt before generating.')
      return
    }

    setLoading(true)
    try {
      const data = await generateImage({
        prompt: prompt.trim(),
        style,
        size,
      })
      setImageUrl(data.image_url)
    } catch (apiError) {
      if (axios.isAxiosError(apiError)) {
        setError(apiError.response?.data?.detail || 'Image generation failed. Try again.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12 text-slate-900">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-lg ring-1 ring-slate-200 sm:p-8">
        <h1 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">AI Image Generator</h1>
        <p className="mt-3 text-center text-sm text-slate-600 sm:text-base">
          Enter your prompt, choose a style and size, then generate an image.
        </p>

        <form className="mt-8 space-y-5" onSubmit={handleGenerate}>
          <div className="space-y-2">
            <label htmlFor="prompt" className="block text-sm font-medium text-slate-700">
              Prompt
            </label>
            <textarea
              id="prompt"
              rows={4}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="A modern city skyline at sunset"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-base"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="style" className="block text-sm font-medium text-slate-700">
                Style
              </label>
              <select
                id="style"
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-base"
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="size" className="block text-sm font-medium text-slate-700">
                Size
              </label>
              <select
                id="size"
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-base"
              >
                {SIZE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-indigo-300 sm:text-base"
          >
            {loading && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </form>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <section className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Generated Image</h2>
          <div className="mt-3 flex min-h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-4">
            {imageUrl ? (
              <img src={imageUrl} alt={prompt || 'Generated image'} className="max-h-96 w-full rounded-lg object-contain" />
            ) : (
              <p className="text-center text-sm text-slate-500">
                Your generated image will appear here after you click Generate.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

export default Home
