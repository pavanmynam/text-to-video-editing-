import React, { useState, useRef } from 'react'

export default function App() {
  const [prompt, setPrompt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const videoRef = useRef(null)

  const generate = async () => {
    if(!prompt) return
    setLoading(true)
    setPreview(false)
    const cleanPrompt = encodeURIComponent(prompt.trim().replace(/\s+/g,' '))
    const url = `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&nologo=true&enhance=true`
    setVideoUrl(url)
    setTimeout(() => {
      setPreview(true)
      setLoading(false)
      videoRef.current?.load()
    }, 300)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">AI Video Generator - Pavan Tool</h1>
      <div className="flex gap-2 w-full max-w-2xl">
        <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Enter your prompt - e.g. a dog dancing" className="flex-1 p-3 rounded bg-gray-800" />
        <button onClick={generate} className="bg-purple-600 px-6 py-3 rounded font-bold">{loading?'Generating...':'Generate'}</button>
      </div>
      {preview && videoUrl && (
        <div className="mt-6">
          <img ref={videoRef} src={videoUrl} alt="generated" className="w- rounded-lg" />
          <a href={videoUrl} download className="mt-3 inline-block bg-green-600 px-4 py-2 rounded">Download</a>
        </div>
      )}
    </div>
  )
}
