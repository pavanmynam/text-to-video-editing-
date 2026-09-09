import { useState } from "react";
export default function App(){
  const [prompt,setPrompt]=useState("cinematic Charminar Hyderabad sunset 4k golden hour");
  const [video,setVideo]=useState(""); const [loading,setLoading]=useState(false); const [status,setStatus]=useState("Ready ✅ Super Design Mardhu!");
  const gen=async()=>{
    if(!prompt.trim()) return;
    setLoading(true); setStatus("Starting...");
    try{
      const { fal } = await import("@fal-ai/client");
      fal.config({ credentials: import.meta.env.VITE_FAL_KEY });
      const r = await fal.subscribe("fal-ai/minimax/hailuo-02/standard/text-to-video",{
        inputs:{ prompt, duration:"6" },
        logs:true,
        onQueueUpdate:(u)=>{
          if(u.status==="IN_PROGRESS") setStatus(`Generating... ${u.logs?.[u.logs.length-1]?.message||''}`);
          else setStatus(u.status);
        }
      });
      console.log("FULL RESULT:", r);
      const url = r.data?.video?.url || r.data?.videos?.[0]?.url || r.video?.url;
      if(url){ setVideo(url); setStatus("Done ✅ Completed!"); }
      else { setStatus("Completed but no URL - check console. Result: "+JSON.stringify(r).slice(0,200)); }
    }catch(e){ setStatus("Error: "+e.message); console.error(e); }
    setLoading(false);
  };
  return(
    <div style={{minHeight:'100vh',background:'#050507',color:'#fff',padding:16,fontFamily:'system-ui'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:28,fontWeight:800}}>🎬 Pavan AI <span style={{background:'#10b981',color:'#000',fontSize:10,padding:'4px 8px',borderRadius:20}}>LIVE</span></h1>
        <p style={{opacity:0.5,fontSize:12}}>Super Premium Design - Mardhu! 🔥</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:16,marginTop:20}}>
          <div style={{background:'#111113',border:'1px solid #222',borderRadius:16,padding:16}}><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:100,background:'#0a0a0a',color:'#fff',borderRadius:10,padding:10}}/><button onClick={gen} disabled={loading} style={{width:'100%',marginTop:10,height:44,borderRadius:10,border:'none',background:'linear-gradient(90deg,#7c3aed,#ec4899)',color:'#fff',fontWeight:800}}>{loading?'Generating...':'✨ Generate'}</button><div style={{marginTop:8,fontSize:12,background:'#000',padding:8,borderRadius:8,wordBreak:'break-all'}}>{status}</div></div>
          <div style={{background:'#111',borderRadius:16,height:400,display:'grid',placeItems:'center'}}>{video?<video src={video} controls autoPlay loop style={{width:'100%',height:'100%'}}/>:<span style={{opacity:0.4}}>Video ikkada vasthundi</span>}</div>
        </div>
      </div>
    </div>
  )
}
