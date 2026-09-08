import { useState } from "react"

export default function App(){
  const [prompt,setPrompt]=useState("A cinematic drone shot of Hyderabad at night")
  const [video,setVideo]=useState("")
  const [loading,setLoading]=useState(false)

  const generate=()=>{
    setLoading(true)
    setTimeout(()=>{
      setVideo("https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4")
      setLoading(false)
    }, 1500)
  }

  return(
    <div style={{minHeight:'100vh', background:'#08080a', color:'#e5e5e5', padding:16, fontFamily:'sans-serif'}}>
      <div style={{maxWidth:1100, margin:'0 auto'}}>
        <div style={{display:'flex', justifyContent:'space-between', padding:12, background:'rgba(255,255,255,0.05)', borderRadius:16, border:'1px solid rgba(255,255,255,0.1)', marginBottom:16}}>
          <b>PAVAN AI STUDIO PREMIUM</b>
          <span style={{fontSize:11, background:'#22c55e22', padding:'4px 8px', borderRadius:20, border:'1px solid #22c55e44'}}>🟢 Ready</span>
        </div>
        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          <div style={{flex:'1 1 350px', background:'rgba(255,255,255,0.04)', borderRadius:20, padding:20, border:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontSize:11, opacity:0.6, marginBottom:8}}>PROMPT</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:120, background:'#0a0a0c', color:'white', borderRadius:12, padding:12, border:'1px solid #222'}}/>
            <button onClick={generate} style={{marginTop:16, width:'100%', padding:14, borderRadius:12, background:'white', color:'black', fontWeight:800, border:'none', cursor:'pointer'}}>
              {loading ? "Generating..." : "▶ GENERATE VIDEO"}
            </button>
          </div>
          <div style={{flex:'1 1 400px', background:'rgba(255,255,255,0.04)', borderRadius:20, padding:16, border:'1px solid rgba(255,255,255,0.08)', minHeight:360, display:'grid', placeItems:'center'}}>
            {!video && !loading && <div style={{textAlign:'center', opacity:0.5}}>🎬<br/>Your video will appear here<br/><small>Pakkana video vastundi</small></div>}
            {loading && <div>⏳ Generating...</div>}
            {video && <video src={video} controls autoPlay style={{width:'100%', borderRadius:12}}/>}
          </div>
        </div>
      </div>
    </div>
  )
}
