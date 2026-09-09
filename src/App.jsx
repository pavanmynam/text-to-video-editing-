import { useState } from "react";

export default function App(){
  const [prompt,setPrompt]=useState("");
  const [video,setVideo]=useState("");
  const [loading,setLoading]=useState(false);

  const gen=async()=>{
    if(!prompt) return;
    setLoading(true);
    try{
      const fal = await import("@fal-ai/client");
      fal.config({credentials: import.meta.env.VITE_FAL_KEY});
      const r = await fal.subscribe("fal-ai/minimax-video/text-to-video",{inputs:{prompt}});
      setVideo(r.data?.video?.url || "");
    }catch(e){ alert(e.message); }
    setLoading(false);
  };

  return (
    <div style={{background:'#050507', color:'#fff', minHeight:'100vh', padding:20}}>
      <h2>Pavan AI - Best Design 🔥</h2>
      <p style={{opacity:0.6}}>Production {loading ? 'Generating...' : 'Ready'}</p>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Charminar sunset cinematic" style={{width:'70%', padding:10, background:'#111', color:'#fff', borderRadius:8, border:'1px solid #333'}}/>
      <button onClick={gen} style={{marginLeft:10, padding:'10px 16px', background:'#7c3aed', color:'#fff', borderRadius:8, border:'none'}}>{loading?'...':'Generate'}</button>
      <div style={{marginTop:20, background:'#111', minHeight:300, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center'}}>
        {video ? <video src={video} controls autoPlay style={{width:'100%', borderRadius:12}}/> : <span style={{opacity:0.4}}>{loading ? 'Video vastundi...' : 'Generate kottu'}</span>}
      </div>
    </div>
  )
}
