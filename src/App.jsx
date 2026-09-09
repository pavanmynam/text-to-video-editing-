import { useState } from "react";
import { createClient } from "@fal-ai/client";

const fal = createClient({ credentials: import.meta.env.VITE_FAL_KEY });

const CHIPS = [
  {l:"🌅 Charminar", p:"cinematic drone Charminar Hyderabad sunset 4k golden hour"},
  {l:"🌃 Cyberpunk Hyd", p:"cyberpunk Hyderabad neon wet streets 4k cinematic"},
  {l:"🏞️ Anime Lake", p:"Hussain Sagar anime ghibli cherry blossoms ultra detailed"},
  {l:"🚁 Drone", p:"cinematic drone mountains fog sunrise 8k smooth motion"},
  {l:"🌿 Nature", p:"macro forest rain droplets sunlight 4k"},
];

export default function App(){
  const [prompt,setPrompt]=useState("cinematic Charminar Hyderabad sunset 4k");
  const [video,setVideo]=useState("");
  const [status,setStatus]=useState("Ready ✅ $8.60 • minimax $0.15/video");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);

  const gen=async()=>{
    if(!prompt.trim()) return;
    setLoading(true); setStatus("Generating 60-90s...");
    try{
      const r = await fal.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{prompt},
        logs:true,
        onQueueUpdate:(u)=> setStatus((u.status||"Generating")+" • "+(u.logs?.slice(-1)[0]?.message||""))
      });
      const url = r.data?.video?.url || r.video?.url;
      if(url){ setVideo(url); setHistory(h=>[{url,prompt,t:Date.now()},...h].slice(0,10)); setStatus("Done ✅ Video Ready"); }
    }catch(e){ setStatus("Error: "+e.message); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#050507', color:'#fff', fontFamily:'Inter,system-ui', padding:12}}>
      <div style={{maxWidth:1400, margin:'0 auto'}}>
        <div style={{height:60, background:'#12121a', border:'1px solid #242436', borderRadius:18, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 16px', marginBottom:12}}>
          <div style={{display:'flex', gap:10, alignItems:'center', fontWeight:800}}><div style={{width:30,height:30, borderRadius:8, background:'linear-gradient(135deg,#7c3aed,#3b82f6)', display:'grid', placeItems:'center'}}>🎬</div>Pavan AI Generator <span style={{fontSize:10, background:'#10b981', color:'#000', padding:'2px 6px', borderRadius:20}}>LIVE</span></div>
          <div style={{display:'flex', gap:8, fontSize:11}}><span style={{background:'#1a1a24', border:'1px solid #2a2a3a', padding:'6px 12px', borderRadius:20}}>$8.60</span><span style={{background:'#10b9811a', color:'#10b981', border:'1px solid #10b98133', padding:'6px 12px', borderRadius:20}}>● Ready</span></div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'360px 1fr', gap:12}}>
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:16}}>
            <div style={{fontSize:10, opacity:0.4, letterSpacing:2, marginBottom:8}}>PROMPT STUDIO</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:100, background:'#08080c', border:'1px solid #2a2a3a', borderRadius:12, color:'#fff', padding:10}}/>
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:10}}>{CHIPS.map(c=><button key={c.l} onClick={()=>setPrompt(c.p)} style={{fontSize:11, background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#bbb', padding:'5px 10px', borderRadius:20, cursor:'pointer'}}>{c.l}</button>)}</div>
            <button onClick={gen} disabled={loading} style={{width:'100%', marginTop:14, height:46, borderRadius:12, border:'none', background:'linear-gradient(90deg,#7c3aed,#3b82f6)', color:'#fff', fontWeight:800, cursor:'pointer'}}>{loading?'⏳ Generating 60s...':'✨ Generate Video'}</button>
            <div style={{marginTop:10, background:'#08080c', border:'1px solid #1e1e2a', borderRadius:10, padding:8, fontSize:11, fontFamily:'monospace', color:'#8b8ba7'}}>{status}</div>
          </div>
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:14}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:10, opacity:0.5, marginBottom:10}}><span>PREVIEW PLAYER • 4K</span>{video && <button onClick={()=>{const a=document.createElement('a'); a.href=video; a.download='pavan.mp4'; a.click();}} style={{background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#fff', padding:'4px 10px', borderRadius:8, cursor:'pointer'}}>Download</button>}</div>
            <div style={{background:'#08080c', border:'1px solid #1e1e2a', borderRadius:16, height:420, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
              {!video &&!loading && <div style={{textAlign:'center', opacity:0.4}}>🎬<br/>Prompt ichi Generate kottu</div>}
              {loading && <div style={{textAlign:'center'}}><div style={{width:36,height:36, border:'3px solid #222', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto'}}/><div style={{marginTop:8}}>Generating...</div></div>}
              {video && <video src={video} controls autoPlay loop style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
