import { useState } from "react";
import { createClient } from "@fal-ai/client";
const fal = createClient({ credentials: import.meta.env.VITE_FAL_KEY });
export default function App(){
  const [prompt,setPrompt]=useState("cinematic Charminar Hyderabad sunset 4k golden hour");
  const [video,setVideo]=useState(""); const [loading,setLoading]=useState(false); const [status,setStatus]=useState("Ready ✅");
  const gen=async()=>{
    if(!prompt.trim()) return; setLoading(true); setStatus("Generating...");
    try{
      const r=await fal.subscribe("fal-ai/minimax-video/text-to-video",{inputs:{prompt},logs:true,onQueueUpdate:u=>setStatus(u.status)});
      const url=r.data?.video?.url||r.video?.url; if(url){setVideo(url); setStatus("Done ✅");}
    }catch(e){setStatus("Error: "+e.message);} setLoading(false);
  };
  return(
    <div style={{minHeight:'100vh',background:'#050507',color:'#fff',padding:16,fontFamily:'system-ui'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:24,fontWeight:800}}>🎬 Pavan AI <span style={{background:'#10b981',color:'#000',fontSize:10,padding:'2px 6px',borderRadius:10}}>LIVE</span></h1>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:80,background:'#111',color:'#fff',border:'1px solid #333',borderRadius:10,padding:10,marginTop:12}}/>
        <button onClick={gen} disabled={loading} style={{width:'100%',marginTop:10,height:44,borderRadius:10,border:'none',background:'#7c3aed',color:'#fff',fontWeight:700}}>{loading?'Generating...':'✨ Generate Video'}</button>
        <div style={{marginTop:8,fontSize:12,opacity:0.6}}>{status}</div>
        <div style={{marginTop:16,background:'#111',borderRadius:16,height:360,display:'grid',placeItems:'center'}}>{video?<video src={video} controls autoPlay loop style={{width:'100%',height:'100%'}}/>:<span style={{opacity:0.4}}>Video ikkada vasthundi</span>}</div>
      </div>
    </div>
  )
}
