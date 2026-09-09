import { useState } from "react";

const CHIPS = [
  {l:"🌅 Charminar Sunset", p:"cinematic drone shot of Charminar Hyderabad at sunset, 4k golden hour, dust particles"},
  {l:"🌃 Cyberpunk Hyd", p:"cyberpunk Hyderabad night, neon lights reflecting on wet streets, flying vehicles, 4k cinematic"},
  {l:"🏞️ Anime Lake", p:"Hussain Sagar lake anime studio ghibli style, cherry blossoms, ultra detailed"},
  {l:"🚁 Drone", p:"cinematic drone flying over mountains fog sunrise 8k ultra realistic smooth"},
  {l:"🌿 Nature", p:"macro forest after rain water droplets on leaves sunlight 4k"},
];

export default function App(){
  const [prompt,setPrompt]=useState("Charminar sunset cinematic");
  const [video,setVideo]=useState("");
  const [status,setStatus]=useState("Ready ✅ Credits $8.60 • minimax cheap mode");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);

  const gen=async()=>{
    if(!prompt.trim()) return;
    setLoading(true); setStatus("Queued... model warming up");
    try{
      const fal = await import("@fal-ai/client");
      fal.config({credentials: import.meta.env.VITE_FAL_KEY});
      const r = await fal.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{prompt},
        logs:true,
        onQueueUpdate:(u)=> setStatus((u.status || "generating") + " • " + (u.logs?.slice(-1)[0]?.message||""))
      });
      const url = r.data?.video?.url || r.video?.url;
      if(url){ setVideo(url); setHistory(h=>[{url,prompt,t:Date.now()},...h].slice(0,12)); setStatus("Done ✅ Ready"); }
    }catch(e){ setStatus("Error: "+e.message); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#050507', color:'#fff', fontFamily:'Inter,system-ui', padding:12}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{maxWidth:1400, margin:'0 auto'}}>
        {/* NAV PREMIUM */}
        <div style={{height:62, background:'linear-gradient(180deg,#12121a,#0e0e16)', border:'1px solid #242436', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', marginBottom:14}}>
          <div style={{display:'flex', alignItems:'center', gap:10, fontWeight:800, fontSize:16}}><div style={{width:34,height:34, borderRadius:10, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'grid', placeItems:'center'}}>🎬</div>Pavan AI Generator <span style={{fontSize:10, background:'#10b981', color:'#000', padding:'2px 6px', borderRadius:20, marginLeft:6}}>LIVE</span></div>
          <div style={{display:'flex', gap:8}}><div style={{fontSize:11, background:'#1a1a24', border:'1px solid #2a2a3a', padding:'6px 12px', borderRadius:20}}>💳 $8.60 left</div><div style={{fontSize:11, background:'#10b9811a', border:'1px solid #10b98133', color:'#10b981', padding:'6px 12px', borderRadius:20}}>● Key Ready</div></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:14}}>
          {/* LEFT PANEL PREMIUM */}
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:18, boxShadow:'0 20px 60px #0008'}}>
            <div style={{fontSize:10, letterSpacing:2, opacity:0.4, fontWeight:700, marginBottom:10}}>PROMPT STUDIO</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe your video..." style={{width:'100%', height:110, background:'#08080c', border:'1px solid #2a2a3a', borderRadius:14, color:'#fff', padding:12, fontSize:13, outline:'none', resize:'none'}}/>
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:12}}>
              {CHIPS.map(c=><button key={c.l} onClick={()=>setPrompt(c.p)} style={{fontSize:11, background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#bbb', padding:'6px 10px', borderRadius:20, cursor:'pointer'}}>{c.l}</button>)}
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14}}>
              <div style={{background:'#0a0a0f', border:'1px solid #1e1e2a', borderRadius:10, padding:'8px 10px', fontSize:11}}><div style={{opacity:0.4}}>MODEL</div><div style={{fontWeight:700}}>minimax-video • cheap</div></div>
              <div style={{background:'#0a0a0f', border:'1px solid #1e1e2a', borderRadius:10, padding:'8px 10px', fontSize:11}}><div style={{opacity:0.4}}>DURATION</div><div style={{fontWeight:700}}>5s • 16:9</div></div>
            </div>
            <button onClick={gen} disabled={loading} style={{width:'100%', marginTop:16, height:50, borderRadius:14, border:'none', background:'linear-gradient(90deg,#7c3aed,#3b82f6)', color:'#fff', fontWeight:800, fontSize:14, cursor:'pointer', boxShadow:'0 10px 30px #7c3aed44'}}>{loading?'⏳ Generating 60s...':'✨ Generate Video'}</button>
            <div style={{marginTop:12, background:'#08080c', border:'1px solid #1e1e2a', borderRadius:12, padding:10, fontSize:11, fontFamily:'monospace', color:'#8b8ba7'}}>{status}</div>
          </div>

          {/* RIGHT PLAYER PREMIUM */}
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:16}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <span style={{fontSize:10, letterSpacing:2, opacity:0.4, fontWeight:700}}>PREVIEW PLAYER • 4K</span>
              {video && <div style={{display:'flex', gap:8}}><button onClick={()=>{const a=document.createElement('a'); a.href=video; a.download='pavan-ai.mp4'; a.click();}} style={{background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#fff', padding:'6px 12px', borderRadius:10, fontSize:11, cursor:'pointer'}}>⬇️ Download</button><button onClick={()=>navigator.clipboard.writeText(video)} style={{background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#fff', padding:'6px 12px', borderRadius:10, fontSize:11, cursor:'pointer'}}>🔗 Copy</button></div>}
            </div>
            <div style={{background:'radial-gradient(400px at 50% 0%, #7c3aed18, transparent), #08080c', border:'1px solid #1e1e2a', borderRadius:18, height:420, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', position:'relative'}}>
              {!video && !loading && <div style={{textAlign:'center'}}><div style={{width:64,height:64, background:'#1a1a24', borderRadius:20, display:'grid', placeItems:'center', margin:'0 auto 12px', fontSize:24}}>▶️</div><div style={{fontWeight:700}}>Your cinematic video will appear here</div><div style={{fontSize:11, opacity:0.4, marginTop:4}}>Enter a prompt and hit Generate</div></div>}
              {loading && <div style={{textAlign:'center'}}><div style={{width:44,height:44, border:'3px solid #222', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto'}}/><div style={{marginTop:12, fontWeight:700}}>Generating your video... 60-90s</div><div style={{fontSize:11, opacity:0.4, marginTop:4, maxWidth:280}}>{prompt}</div></div>}
              {video && <video src={video} controls autoPlay loop style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
            </div>
            {history.length>0 && <div style={{marginTop:16}}><div style={{fontSize:10, letterSpacing:2, opacity:0.4, fontWeight:700, marginBottom:8}}>RECENT • {history.length}</div><div style={{display:'flex', gap:10, overflowX:'auto', paddingBottom:4}}>{history.map((h,i)=><div key={i} onClick={()=>setVideo(h.url)} style={{minWidth:160, background:'#0a0a0f', border:'1px solid #1e1e2a', borderRadius:12, overflow:'hidden', cursor:'pointer'}}><div style={{height:72, background:'#000'}}><video src={h.url} muted style={{width:'100%', height:'100%', objectFit:'cover'}}/></div><div style={{padding:8}}><div style={{fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{h.prompt}</div><div style={{fontSize:9, opacity:0.4}}>{new Date(h.t).toLocaleTimeString()}</div></div></div>)}</div></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
