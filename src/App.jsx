import { useState } from "react";

export default function App(){
  const [prompt,setPrompt]=useState("cinematic Charminar Hyderabad sunset 4k golden hour");
  const [video,setVideo]=useState(""); 
  const [loading,setLoading]=useState(false); 
  const [status,setStatus]=useState("Ready - Super Design LIVE ✅");

  const gen=async()=>{
    if(!prompt.trim()) return;
    setLoading(true); setStatus("Generating 60s... $8.60");
    try{
      const { fal } = await import("@fal-ai/client");
      fal.config({ credentials: import.meta.env.VITE_FAL_KEY });
      const r = await fal.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{ prompt },
        logs:true,
        onQueueUpdate:(u)=>setStatus(u.status)
      });
      const url = r.data?.video?.url || r.video?.url;
      if(url){ setVideo(url); setStatus("Done ✅ Video Ready!"); }
    }catch(e){ setStatus("Error: "+e.message); console.error(e); }
    setLoading(false);
  };

  return(
    <div style={{minHeight:'100vh',background:'#050507',color:'#fff',padding:16,fontFamily:'system-ui'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:28,fontWeight:800}}>🎬 Pavan AI <span style={{background:'#10b981',color:'#000',fontSize:10,padding:'4px 8px',borderRadius:20,marginLeft:8}}>LIVE</span></h1>
        <p style={{opacity:0.5,fontSize:12,marginTop:4}}>Super Premium Design - Mardhu! 🔥</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:16,marginTop:20}}>
          <div style={{background:'#111113',border:'1px solid #222',borderRadius:16,padding:16}}>
            <label style={{fontSize:11,opacity:0.6}}>PROMPT</label>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:120,background:'#0a0a0a',color:'#fff',border:'1px solid #333',borderRadius:12,padding:12,marginTop:6}}/>
            <button onClick={gen} disabled={loading} style={{width:'100%',marginTop:12,height:48,borderRadius:12,border:'none',background:'linear-gradient(90deg,#7c3aed,#ec4899)',color:'#fff',fontWeight:800,cursor:'pointer'}}>{loading?'⏳ Generating...':'✨ Generate Video'}</button>
            <div style={{marginTop:10,fontSize:12,opacity:0.7,background:'#000',padding:10,borderRadius:8,border:'1px solid #222'}}>{status}</div>
          </div>
          <div style={{background:'#111113',border:'1px solid #222',borderRadius:16,height:420,display:'grid',placeItems:'center',overflow:'hidden'}}>
            {video?<video src={video} controls autoPlay loop style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center',opacity:0.5}}><div style={{fontSize:50}}>🎥</div><div>Super Design - Video Ikada</div></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
