import { useState } from "react"
import { fal } from "@fal-ai/client"

export default function App(){
  const [prompt,setPrompt]=useState("A lone samurai walking through neon-lit Tokyo rain at night, reflections, slow motion, cinematic")
  const [video,setVideo]=useState("")
  const [loading,setLoading]=useState(false)
  const [status,setStatus]=useState("")
  const [err,setErr]=useState("")

  const generate=async()=>{
    const KEY = import.meta.env.VITE_FAL_KEY
    if(!KEY){ setErr("Key Missing bro! Vercel lo VITE_FAL_KEY ledu"); return }
    fal.config({credentials: KEY})
    setLoading(true); setVideo(""); setErr(""); setStatus("Queue lo pettam...")
    try{
      const res = await fal.subscribe("fal-ai/minimax-video/text-to-video", {
        input: { prompt },
        logs: true,
        onQueueUpdate: (u)=>{
          if(u.status) setStatus(u.status + " - 30s wait...")
          console.log(u)
        }
      })
      console.log("RESULT:", res)
      const url = res.data?.video?.url || res.data?.video_url || res.video?.url
      if(!url) throw new Error("Video URL raledu - console chudu")
      setVideo(url)
      setStatus("Ready!")
    }catch(e){
      console.error(e)
      setErr(e.message || "Error vachindi")
    }
    setLoading(false)
  }

  const presets = [
    {label:"Cinematic", text:"cinematic film look, 4k, shallow depth"},
    {label:"Drone", text:"drone shot, aerial view, sweeping"},
    {label:"Anime", text:"anime style, studio ghibli"},
    {label:"Realistic", text:"photorealistic, ultra detailed, 8k"},
  ]

  return(
    <div style={{minHeight:'100vh', background:'#08080a', color:'#e5e5e5', fontFamily:'Inter, sans-serif', padding:'16px'}}>
      <div style={{maxWidth:1200, margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, marginBottom:16}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <div style={{width:32, height:32, background:'white', borderRadius:8, display:'grid', placeItems:'center', color:'black'}}>⚙️</div>
            <div>
              <div style={{fontWeight:800, letterSpacing:1, fontSize:13}}>PAVAN AI STUDIO <span style={{background:'#222', padding:'2px 6px', borderRadius:6, fontSize:10, marginLeft:6}}>PREMIUM</span></div>
              <div style={{fontSize:10, opacity:0.5}}>1080P • CINEMATIC</div>
            </div>
          </div>
          <div style={{fontSize:11, padding:'6px 10px', borderRadius:20, background: import.meta.env.VITE_FAL_KEY ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border:'1px solid rgba(255,255,255,0.1)'}}>
            {import.meta.env.VITE_FAL_KEY ? "🟢 Ready" : "🔴 Missing"}
          </div>
        </div>

        <div style={{display:'flex', gap:16, flexWrap:'wrap'}}>
          {/* LEFT - PROMPT */}
          <div style={{flex:'1 1 380px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:20}}>
            <div style={{fontSize:11, letterSpacing:1, opacity:0.6, marginBottom:8}}>✏️ PROMPT</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:120, background:'#0a0a0c', color:'white', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:12, fontSize:13, lineHeight:1.5}} placeholder="Enter Telugu or English prompt..."/>
            
            <div style={{marginTop:16}}>
              <div style={{fontSize:11, opacity:0.5, marginBottom:8}}>STYLE PRESET</div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
                {presets.map(p=>(
                  <button key={p.label} onClick={()=>setPrompt(prev=> prev + ", " + p.text)} style={{padding:'10px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'#ccc', fontSize:12, textAlign:'left'}}>🎬 {p.label}</button>
                ))}
              </div>
            </div>

            <div style={{marginTop:16}}>
              <div style={{fontSize:11, opacity:0.5, marginBottom:8}}>DURATION</div>
              <div style={{display:'flex', gap:8}}>
                <div style={{flex:1, padding:8, textAlign:'center', background:'#fff', color:'#000', borderRadius:8, fontSize:12, fontWeight:700}}>6s</div>
                <div style={{flex:1, padding:8, textAlign:'center', background:'rgba(255,255,255,0.06)', borderRadius:8, fontSize:12}}>8s</div>
                <div style={{flex:1, padding:8, textAlign:'center', background:'rgba(255,255,255,0.06)', borderRadius:8, fontSize:12}}>10s</div>
              </div>
            </div>

            <button onClick={generate} disabled={loading} style={{marginTop:20, width:'100%', padding:'14px', borderRadius:12, background:'white', color:'black', fontWeight:800, border:'none', cursor:'pointer'}}>
              {loading ? `⏳ ${status}` : "▶ GENERATE VIDEO"}
            </button>
            
            {err && <div style={{marginTop:12, padding:10, background:'rgba(255,0,0,0.1)', border:'1px solid rgba(255,0,0,0.2)', borderRadius:10, color:'#ff8080', fontSize:12}}>{err}</div>}
          </div>

          {/* RIGHT - VIDEO PAKKANA */}
          <div style={{flex:'1 1 500px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:16, display:'flex', flexDirection:'column'}}>
            <div style={{flex:1, minHeight:360, background:'#0a0a0c', border:'1px dashed rgba(255,255,255,0.12)', borderRadius:16, display:'grid', placeItems:'center', position:'relative', overflow:'hidden'}}>
              {!video && !loading && (
                <div style={{textAlign:'center', padding:20}}>
                  <div style={{width:64, height:64, margin:'0 auto 16px', background:'rgba(255,255,255,0.06)', borderRadius:16, display:'grid', placeItems:'center', fontSize:24}}>🎞️</div>
                  <div style={{fontWeight:600, fontSize:14}}>Your video will appear here</div>
                  <div style={{fontSize:12, opacity:0.5, marginTop:6, maxWidth:300}}>Generate cheyagane pakkana video vastundi. No images — only real mp4 video with controls.</div>
                  <div style={{marginTop:12, display:'flex', gap:6, justifyContent:'center'}}>
                    <span style={{fontSize:9, padding:'4px 8px', background:'rgba(255,255,255,0.06)', borderRadius:20}}>LTX-2 • 1080P</span>
                    <span style={{fontSize:9, padding:'4px 8px', background:'rgba(255,255,255,0.06)', borderRadius:20}}>TEXT-TO-VIDEO</span>
                    <span style={{fontSize:9, padding:'4px 8px', background:'rgba(255,255,255,0.06)', borderRadius:20}}>VIDEO ONLY</span>
                  </div>
                </div>
              )}
              {loading && <div style={{textAlign:'center'}}><div style={{fontSize:30, animation:'spin 1s linear infinite'}}>⏳</div><div style={{marginTop:10, fontSize:13}}>{status}</div><div style={{fontSize:11, opacity:0.5}}>30 sec wait bro...</div></div>}
              {video && <video src={video} controls autoPlay loop style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:16}}/>}
            </div>
            {video && (
              <div style={{marginTop:12, display:'flex', gap:8}}>
                <a href={video} download style={{flex:1, textAlign:'center', padding:'10px', background:'white', color:'black', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:12}}>⬇️ Download MP4</a>
                <button onClick={()=>{navigator.clipboard.writeText(video); alert("Link copied!")}} style={{padding:'10px 16px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'white', fontSize:12}}>Copy Link</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
