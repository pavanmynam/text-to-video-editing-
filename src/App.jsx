import { useState } from "react";

// Status colours - red lo error, green lo success!
function StatusBadge({ status, type }) {
  const colors = {
    error: { bg: "#2a0a0a", border: "#ff4444", text: "#ff6b6b" },
    success: { bg: "#0a2a0a", border: "#10b981", text: "#10b981" },
    loading: { bg: "#1a1033", border: "#7c3aed", text: "#a78bfa" },
    idle: { bg: "#000", border: "#222", text: "#999" }
  };
  const c = colors[type] || colors.idle;
  return (
    <div style={{
      marginTop: 12, padding: "10px 12px", borderRadius: 10,
      background: c.bg, border: `1px solid ${c.border}`,
      color: c.text, fontSize: 12, fontWeight: 600,
      wordBreak: "break-word"
    }}>
      {type === "error"? "❌ " : type === "success"? "✅ " : type === "loading"? "⏳ " : "💡 "}
      {status}
    </div>
  )
}

export default function App(){
  const [prompt,setPrompt]=useState("cinematic Charminar Hyderabad sunset 4k golden hour");
  const [video,setVideo]=useState("");
  const [loading,setLoading]=useState(false);
  const [status,setStatus]=useState("Ready - Super Design Mardhu! 🔥");
  const [statusType,setStatusType]=useState("idle");

  const updateStatus = (msg, type="idle") => {
    setStatus(msg);
    setStatusType(type);
  }

  const gen=async()=>{
    if(!prompt.trim()){
      updateStatus("Prompt enter chey bro!", "error");
      return;
    }
    setLoading(true);
    setVideo("");
    updateStatus("Starting generation... $0.05/sec", "loading");

    try{
      const { fal } = await import("@fal-ai/client");
      fal.config({ credentials: import.meta.env.VITE_FAL_KEY });

      const result = await fal.subscribe("fal-ai/minimax/hailuo-02/standard/text-to-video",{
        inputs:{ prompt, duration:"6" },
        logs:true,
        onQueueUpdate:(u)=>{
          if(u.status==="IN_PROGRESS") updateStatus(`Generating... ${u.status} - 60sec pattuddi`, "loading");
          else if(u.status==="IN_QUEUE") updateStatus("Queue lo undi... wait chey", "loading");
          else updateStatus(u.status, "loading");
        }
      });

      console.log(result);
      const url = result.data?.video?.url || result.data?.videos?.[0]?.url;

      if(url){
        setVideo(url);
        updateStatus("Done! Video ready - Download chesko! 🎉", "success");
      } else {
        updateStatus("Completed kani video URL raledu - console check chey", "error");
      }
    }catch(e){
      // Key hide chesa - red lo error safe ga vastundi, key kanipinchadu!
      const safeMsg = e.message?.includes("c757321a")? "API Key error - Vercel env check chey" : e.message;
      updateStatus("Error: "+safeMsg, "error");
      console.error(e);
    }
    setLoading(false);
  };

  return(
    <div style={{minHeight:'100vh',background:'#050507',color:'#fff',padding:16,fontFamily:'system-ui'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        <h1 style={{fontSize:28,fontWeight:800,letterSpacing:-0.5}}>🎬 Pavan AI <span style={{background:'#10b981',color:'#000',fontSize:10,padding:'4px 8px',borderRadius:20,marginLeft:8}}>LIVE</span></h1>
        <p style={{opacity:0.5,fontSize:12,marginTop:4}}>Super Premium Design - Mardhu! Refactored ✅</p>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1.2fr',gap:16,marginTop:20}}>
          <div style={{background:'#111113',border:'1px solid #222',borderRadius:16,padding:16}}>
            <label style={{fontSize:10,opacity:0.5,letterSpacing:1}}>PROMPT</label>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%',height:110,background:'#0a0a0a',color:'#fff',border:'1px solid #333',borderRadius:12,padding:12,marginTop:6,fontSize:14}}/>
            <button onClick={gen} disabled={loading} style={{width:'100%',marginTop:12,height:48,borderRadius:12,border:'none',background:loading?'#333':'linear-gradient(90deg,#7c3aed,#ec4899)',color:'#fff',fontWeight:800,cursor:loading?'not-allowed':'pointer',opacity:loading?0.6:1}}>
              {loading?'⏳ Generating 60sec...':'✨ Generate Video'}
            </button>
            <StatusBadge status={status} type={statusType} />
          </div>

          <div style={{background:'#111113',border:'1px solid #222',borderRadius:16,height:420,display:'grid',placeItems:'center',overflow:'hidden'}}>
            {video?<video src={video} controls autoPlay loop playsInline style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<div style={{textAlign:'center',opacity:0.4}}><div style={{fontSize:48}}>🎥</div><div style={{marginTop:8,fontSize:13}}>Super Design - Video Ikada</div></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
