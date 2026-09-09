import { useState } from "react";
import * as fal from "@fal-ai/client";
fal.config({ credentials: import.meta.env.VITE_FAL_KEY });

const CHIPS = [
  {l:"Charminar Sunset", p:"cinematic drone shot of Charminar Hyderabad at sunset, 4k golden hour, epic"},
  {l:"Cyberpunk Hyd", p:"cyberpunk Hyderabad night, neon lights, wet streets, 4k"},
  {l:"Anime Lake", p:"Hussain Sagar lake anime ghibli style, cherry blossoms, soft light"},
  {l:"Drone", p:"cinematic drone over mountains fog sunrise 8k smooth motion"},
  {l:"Nature", p:"macro forest after rain droplets on leaves sunlight 4k"},
];

export default function App(){
  const [prompt,setPrompt]=useState("");
  const [video,setVideo]=useState("");
  const [status,setStatus]=useState("Ready ✅ $8.60 Credits - minimax cheap");
  const [loading,setLoading]=useState(false);
  const [history,setHistory]=useState([]);

  const gen=async()=>{
    if(!prompt.trim()){alert("Prompt rayi"); return;}
    setLoading(true); setVideo(""); setStatus("Generating 60-90s...");
    try{
      const res = await fal.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{prompt},
        logs:true,
        onQueueUpdate:(u)=>setStatus(u.status+" "+(u.logs?.[0]?.message||""))
      });
      const url = res.data?.video?.url || res.video?.url;
      if(url){ setVideo(url); setHistory(h=>[{url,prompt,t:Date.now()},...h].slice(0,10)); setStatus("Done ✅ Video ready"); }
      else setStatus("Error: URL raledu");
    }catch(e){ setStatus("Error: "+e.message); }
    setLoading(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'radial-gradient(600px at 0% 0%, #7c3aed22, transparent), radial-gradient(600px at 100% 100%, #3b82f622, transparent), #050507', color:'#fff', fontFamily:'Inter,sans-serif', padding:14}}>
      {/* NAV */}
      <div style={{maxWidth:1400, margin:'0 auto 16px', background:'#12121a', border:'1px solid #242436', borderRadius:16, height:60, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:10, fontWeight:800}}><div style={{width:28,height:28, borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#3b82f6)'}}/>Pavan AI Generator <span style={{width:8,height:8, background:'#10b981', borderRadius:99, display:'inline-block', marginLeft:6}}/> <span style={{fontSize:11, opacity:0.5, fontWeight:400}}>LIVE</span></div>
        <div style={{display:'flex', gap:8}}><span style={{fontSize:11, background:'#1a1a24', border:'1px solid #2a2a3a', padding:'6px 10px', borderRadius:20}}>$8.60</span><span style={{fontSize:11, background:'#10b98122', color:'#10b981', padding:'6px 10px', borderRadius:20}}>Ready</span></div>
      </div>

      <div style={{maxWidth:1400, margin:'0 auto', display:'grid', gridTemplateColumns:'360px 1fr', gap:14}}>
        {/* LEFT */}
        <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:18}}>
          <div style={{fontSize:10, letterSpacing:2, opacity:0.4, marginBottom:8}}>PROMPT</div>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="ex: Charminar Hyderabad cinematic sunset 4k" style={{width:'100%', height:100, background:'#0a0a0f', border:'1px solid #2a2a3a', borderRadius:12, color:'#fff', padding:10}}/>
          <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:10}}>
            {CHIPS.map(c=><button key={c.l} onClick={()=>setPrompt(c.p)} style={{fontSize:10, background:'#1e1e2a', border:'1px solid #2a2a3a', color:'#ccc', padding:'5px 9px', borderRadius:20, cursor:'pointer'}}>{c.l}</button>)}
          </div>
          <button onClick={gen} disabled={loading} style={{width:'100%', marginTop:16, height:46, borderRadius:12, border:'none', background:'linear-gradient(90deg,#7c3aed,#3b82f6)', color:'#fff', fontWeight:700, cursor:'pointer', boxShadow:'0 0 20px #7c3aed55'}}>{loading?'Generating...':'Generate 🎬'}</button>
          <div style={{marginTop:12, background:'#0a0a0f', border:'1px solid #1e1e2a', borderRadius:10, padding:10, fontSize:11, fontFamily:'monospace', opacity:0.7}}>{status}</div>
        </div>

        {/* RIGHT PLAYER - BEST DESIGN */}
        <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:14}}>
          <div style={{display:'flex', justifyContent:'space-between', fontSize:11, opacity:0.5, marginBottom:10}}><span>PREVIEW PLAYER</span>{video && <button onClick={()=>{const a=document.createElement('a'); a.href=video; a.download='pavan.mp4'; a.click();}} style={{background:'#1e1e2a', color:'#fff', border:'1px solid #2a2a3a', padding:'4px 10px', borderRadius:8, cursor:'pointer'}}>Download</button>}</div>
          <div style={{background:'#08080c', border:'1px dashed #242436', borderRadius:16, height:380, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
            {!video && !loading && <div style={{textAlign:'center', opacity:0.4}}><div style={{fontSize:30}}>🎬</div><div style={{fontSize:13}}>Your video will appear here</div><div style={{fontSize:11}}>Prompt ichi Generate kottu</div></div>}
            {loading && <div style={{textAlign:'center'}}><div style={{width:36,height:36, border:'3px solid #222', borderTop:'3px solid #7c3aed', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto'}}/><p style={{marginTop:8,
