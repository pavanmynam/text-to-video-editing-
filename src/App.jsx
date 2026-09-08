import React, { useState } from 'react'

function App() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [error, setError] = useState('')

  const generateVideo = async () => {
    if (!prompt.trim()) {
      setError('Prompt rayyi bro!')
      return
    }
    setLoading(true)
    setError('')
    setVideoUrl('')

    try {
      // DEMO MODE - Vercel lo build avvadaniki
      // Real API connect cheyali ante ikkada fal.ai / Replicate key pettu
      await new Promise(r => setTimeout(r, 2000))
      
      // Sample video - ne prompt vachaka idi replace avthadi real API tho
      setVideoUrl('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4')
      
    } catch (err) {
      setError('Video generate avvale bro, malli try chey')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>
          🎬 Text to Video Generator
        </h1>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: '30px' }}>
          Prompt ivvu, video ready!
        </p>

        <div style={{ background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: A cinematic shot of Hyderabad city at night with rain..."
            style={{
              width: '100%',
              height: '100px',
              background: '#000',
              color: '#fff',
              border: '1px solid #333',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />

          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <button
            onClick={generateVideo}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '15px',
              padding: '14px',
              background: loading ? '#555' : '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Generating... ⏳' : 'Generate Video 🚀'}
          </button>
        </div>

        {videoUrl && (
          <div style={{ marginTop: '30px', background: '#111', padding: '20px', borderRadius: '12px', border: '1px solid #333' }}>
            <h3>Your Video Ready Bro 👇</h3>
            <video
              src={videoUrl}
              controls
              autoPlay
              loop
              style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }}
            />
            <p style={{ color: '#888', fontSize: '14px', marginTop: '10px' }}>
              Prompt: {prompt}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
