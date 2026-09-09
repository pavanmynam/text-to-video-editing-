import { useState, useEffect } from "react";
import * as fal from "@fal-ai/client";
fal.config({ credentials: import.meta.env.VITE_FAL_KEY });

const QUICK = [
  {label:"Charminar Sunset", prompt:"cinematic drone shot of Charminar Hyderabad at sunset, 4k golden hour"},
  {label:"Cyberpunk Hyd", prompt:"cyberpunk Hyderabad at night, neon lights wet streets, flying vehicles, 4k"},
  {label:"Anime Lake", prompt:"Hussain Sagar lake anime style, cherry blossoms, ghibli aesthetic"},
  {label:"Cinematic Drone", prompt:"cinematic drone over mountains, fog, sunrise, 8k realistic"},
  {label:"Nature", prompt:"macro forest after rain, droplets on leaves, sunlight"},
];

export default function App(){
  const [prompt,setPrompt]=useState("");
  const [video,setVideo]=useState("");
  const [status,setStatus]=useState("Ready ✅ Credits $8.60 - minimax cheap mode");
  const [loading,setLoading]=useState(false);
  const [aspect,setAspect]=useState("16:9");
  const [history,setHistory]=useState([]);

  const generate=async()=>{
    if(!prompt.trim()) return alert("Prompt rayi");
    setLoading(true); setVideo(""); setStatus("Queued...");
    try{
      const result = await fal.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{prompt},
        logs:true,
        onQueueUpdate:(u)=>setStatus(u.status+" "+(u.logs?.[0]?.message||""))
      });
      const url = result.data?.video?.url || result.video?.url;
      if(url){
        setVideo(url);
        setHistory(h=>[{url,prompt,time:Date.now()},...h].slice(0,8));
        setStatus("Done ✅ - $0.15 used");
      } else setStatus("Error: URL raledu - console chudu");
    }catch(e){ setStatus("Error: "+e.message); console.error(e); }
    setLoading(false);
  };

  const download=async()=>{
    const a=document.createElement("a"); a.href=video; a.download=`pavan-${Date.now()}.mp4`; a.click();
  };

  return (
    <div style={{minHeight:'100vh', background:'#050507', color:'#fff', fontFamily:'Inter, system-ui', padding:16}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap'); .glow{box-shadow:0 0 30px #7c3aed60} .shimmer{animation:shimmer 1.5s infinite} @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
      
      <div style={{maxWidth:1440, margin:'0 auto'}}>
        {/* NAV */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', height:64, borderBottom:'1px solid #1e1e2a', padding:'0 12px', marginBottom:20, backdropFilter:'blur(20px)', borderRadius:16, background:'#12121a'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}><div style={{width:32,height:32, borderRadius:8, background:'linear-gradient(90deg,#7c3aed,#3b82f6)'}}/> <b>Pavan AI Generator</b> <span style={{background:'#10b981', width:8, height:8, borderRadius:99, display:'inline-block'}}/> <span style={{fontSize:11, opacity:0.6}}>Live</span></div>
          <div style={{display:'flex', gap:8}}><span style={{background:'#1a1a24', padding:'6px 12px', borderRadius:20, fontSize:12, border:'1px solid #2a2a3a'}}>$8.60 Credits</span><span style={{background:'#10b98120', color:'#10b981', padding:'6px 12px', borderRadius:20, fontSize:12}}>Key: Ready</span></div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'380px 1fr', gap:16}}>
          {/* LEFT */}
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:20, height:'fit-content'}}>
            <div style={{fontSize:11, letterSpacing:2, opacity:0.4, marginBottom:10}}>PROMPT</div>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe your video... ex: cinematic Charminar at sunset, 4k" style={{width:'100%', height:110, background:'#0a0a0f', border:'1px solid #2a2a3a', borderRadius:14, color:'#fff', padding:12, outline:'none'}} />
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:10}}>
              {QUICK.map(q=><button key={q.label} onClick={()=>setPrompt(q.prompt)} style={{background:'#1e1e2a', border:'1px solid #2a2a3a', borderRadius:20, padding:'5px 10px', fontSize:11, color:'#fff8', cursor:'pointer'}}>{q.label}</button>)}
            </div>
            <div style={{display:'flex', gap:8, marginTop:16}}>
              {["16:9","9:16","1:1"].map(a=><button key={a} onClick={()=>setAspect(a)} style={{flex:1, padding:8, borderRadius:10, border:'1px solid #2a2a3a', background:aspect===a?'#7c3aed':'#1a1a24', color:'#fff', fontSize:12}}>{a}</button>)}
            </div>
            <button onClick={generate} disabled={loading} className="glow" style={{width:'100%', marginTop:16, height:48, borderRadius:12, border:'none', background:'linear-gradient(90deg,#7c3aed,#3b82f6)', color:'#fff', fontWeight:700, cursor:'pointer'}}>{loading?'Generating... 60s':'Generate Video 🎬'}</button>
            <div style={{marginTop:12, background:'#0a0a0f', borderRadius:10, padding:10, fontFamily:'monospace', fontSize:11, opacity:0.7, border:'1px solid #1e1e2a'}}>{status}</div>
          </div>

          {/* RIGHT PLAYER */}
          <div style={{background:'#12121a', border:'1px solid #242436', borderRadius:20, padding:16, minHeight:520}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
              <span style={{fontSize:12, letterSpacing:1, opacity:0.5}}>PREVIEW PLAYER</span>
              {video && <div style={{display:'flex', gap:6}}><button onClick={download} style={{background:'#1a1a24', border:'1px solid #2a2a3a', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11}}>Download</button><button onClick={()=>navigator.clipboard.writeText(video)} style={{background:'#1a1a24', border:'1px solid #2a2a3a', color:'#fff', padding:'6px 10px', borderRadius:8, fontSize:11}}>Copy Link</button></div>}
            </div>

            <div style={{background:'#08080c', border:'1px dashed #1e1e2a', borderRadius:16, height:360, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}}>
              {!video && !loading && <div style={{textAlign:'center', opacity:0.4}}><div style={{fontSize:32}}>▶️</div><div>Your cinematic video will appear here</div><div style={{fontSize:11}}>Enter prompt and generate</div></div>}
              {loading && <div style={{textAlign:'center'}}><div style={{width:40,height:40, border:'3px solid #2a2a3a', borderTop:'3px solid #7c3aed', borderRadius:99, animation:'spin 1s linear infinite', margin:'0 auto'}}/> <p style={{marginTop:10}}>Generating... 60-90s</p></div>}
              {video && <video src={video} controls autoPlay loop style={{width:'100%', height:'100%', objectFit:'cover', borderRadius:16}} />}
            </div>

            {history.length>0 && <div style={{marginTop:16}}><div style={{fontSize:11, opacity:0.4, marginBottom:8}}>RECENT GENERATIONS</div><div style={{display:'flex', gap:10, overflowX:'auto'}}>{history.map((h,i)=><div key={i} onClick={()=>setVideo(h.url)} style={{minWidth:150, background:'#0a0a0f', border:'1px solid #1e1e2a', borderRadius:12, padding:8, cursor:'pointer'}}><div style={{fontSize:11, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{h.prompt.slice(0,25)}</div><div style={{fontSize:10, opacity:0.4}}>{new Date(h.time).toLocaleTimeString()}</div></div>)}</div></div>}
          </div>
        </div>
      </div>
    </div>
  )
}
