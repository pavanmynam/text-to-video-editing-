import { useState } from "react"

export default function App() {
  const [prompt, setPrompt] = useState("A cinematic drone shot of Hyderabad at night")
  const [video, setVideo] = useState("")
  const [loading, setLoading] = useState(false)

  const generate = () => {
    setLoading(true)
    setTimeout(() => {
      setVideo("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
      setLoading(false)
    }, 1200)
  }

  return (
    <div style={{minHeight:'100vh', background:'#08080a', color:'#e5e5e5', padding:16, fontFamily:'Inter, sans-serif'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'rgba(255,255,255,0.05)', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', marginBottom:16}}>
          <b style={{letterSpacing:1}}>PAVAN AI STUDIO PREMIUM</b>
          <span style={{fontSize:11, background:'#22c55e22', padding:'4px 10px', borderRadius:20, border:'1px solid #22c55e55', color:'#22c55e'}}>🟢 Ready - Green Tick</span>
        </div>

        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          
          {/* Left Panel */}
          <div style={{flex:'1 1 340px', background:'rgba(255,255,255,0.04)', borderRadius:20, padding:20, border:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontSize:10, letterSpacing:1.5, opacity:0.5, marginBottom:8}}>PROMPT</div>
            <textarea 
              value={prompt} 
              onChange={e=>setPrompt(e.target.value)} 
              style={{width:'100%', height:120, background:'#0a0a0c', color:'white', borderRadius:12, padding:12, border:'1px solid #222', outline:'none', resize:'none'}}
            />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:16}}>
              <select style={{padding:10, borderRadius:10, background:'#0a0a0c', color:'white', border:'1px solid #222'}}><option>16:9</option><option>9:16</option></select>
              <select style={{padding:10, borderRadius:10, background:'#0a0a0c', color:'white', border:'1px solid #222'}}><option>720p</option><option>1080p</option></select>
            </div>
            <button onClick={generate} style={{marginTop:16, width:'100%', padding:14, borderRadius:12, background:'white', color:'black', fontWeight:800, border:'none', cursor:'pointer'}}>
              {loading ? "⏳ Generating..." : "▶ GENERATE VIDEO"}
            </button>
            <div style={{marginTop:12, fontSize:11, opacity:0.5, textAlign:'center'}}>Premium Design + Pakkana Video Player</div>
          </div>

          {/* Right Panel - Video */}
          <div style={{flex:'1 1 420px', background:'rgba(255,255,255,0.04)', borderRadius:20, padding:16, border:'1px solid rgba(255,255,255,0.08)', minHeight:380, display:'grid', placeItems:'center'}}>
            {!video && !loading && (
              <div style={{textAlign:'center', opacity:0.4, lineHeight:1.6}}>
                <div style={{fontSize:40}}>🎬</div>
                <div>Your video will appear here</div>
                <div style={{fontSize:12}}>Pakkana video vastundi</div>
              </div>
            )}
            {loading && <div style={{opacity:0.8}}>⏳ Generating premium video...</div>}
            {video && (
              <div style={{width:'100%'}}>
                <video src={video} controls autoPlay style={{width:'100%', borderRadius:12, background:'black'}}/>
                <div style={{marginTop:10, display:'flex', gap:8}}>
                  <button style={{flex:1, padding:10, borderRadius:10, background:'rgba(255,255,255,0.08)', color:'white', border:'1px solid #333', cursor:'pointer'}}>⬇ Download</button>
                  <button style={{flex:1, padding:10, borderRadius:10, background:'white', color:'black', border:'none', fontWeight:700, cursor:'pointer'}}>✨ Enhance</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
