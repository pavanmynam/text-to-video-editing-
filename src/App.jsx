import { useState } from 'react'

const FAL_KEY = import.meta.env.VITE_FAL_KEY;

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const generateVideo = async () => {
    if(!prompt) return alert("Prompt rayyi first");
    if(!FAL_KEY) return alert("VITE_FAL_KEY kanipinchaledu - Vercel lo redeploy cheyali");

    setLoading(true);
    setVideoUrl("");
    setStatus("Queue lo pedutunna...");

    try {
      // 1. Submit job to Fal
      const submitRes = await fetch("https://queue.fal.run/fal-ai/kling-video/v2.1/master/text-to-video", {
        method: "POST",
        headers: {
          "Authorization": `Key ${FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: "5",
          aspect_ratio: "16:9"
        })
      });

      const { request_id } = await submitRes.json();
      setStatus(`Generating... ID: ${request_id.slice(0,8)}`);

      // 2. Poll for result
      let result = null;
      while(!result || result.status !== "COMPLETED") {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`https://queue.fal.run/fal-ai/kling-video/requests/${request_id}/status`, {
          headers: { "Authorization": `Key ${FAL_KEY}` }
        });
        const statusData = await statusRes.json();
        console.log(statusData);
        if(statusData.status === "COMPLETED") {
          const finalRes = await fetch(`https://queue.fal.run/fal-ai/kling-video/requests/${request_id}`, {
            headers: { "Authorization": `Key ${FAL_KEY}` }
          });
          result = await finalRes.json();
          break;
        }
        setStatus(`Status: ${statusData.status}...`);
      }

      setVideoUrl(result.data.video.url);
      setStatus("Done! ✅");
    } catch (e) {
      console.error(e);
      setStatus("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0f', color:'white', padding:'30px', fontFamily:'Inter'}}>
      <h1 style={{fontSize:'28px', fontWeight:800}}>FLI Studio <span style={{color:'#7c3aed'}}>• Text to Video</span></h1>
      <p>{status}</p>
      
      <div style={{display:'grid', gridTemplateColumns:'400px 1fr', gap:'30px', marginTop:'20px'}}>
        <div style={{background:'#1a1a23', padding:'20px', borderRadius:'16px'}}>
          <textarea 
            value={prompt} onChange={e=>setPrompt(e.target.value)}
            placeholder="Ex: A cinematic drone shot of Charminar at night with lights..."
            style={{width:'100%', height:'120px', background:'#0a0a0f', color:'white', borderRadius:'12px', padding:'12px'}}
          />
          <button 
            onClick={generateVideo} disabled={loading}
            style={{marginTop:'12px', width:'100%', padding:'14px', background:'linear-gradient(90deg,#7c3aed,#3b82f6)', border:'none', borderRadius:'12px', color:'white', fontWeight:700, cursor:'pointer'}}
          >
            {loading ? "Generating..." : "Generate Video 🎬"}
          </button>
        </div>

        <div style={{background:'#1a1a23', borderRadius:'16px', minHeight:'400px', display:'flex', alignItems:'center', justifyContent:'center'}}>
          {videoUrl ? (
            <video src={videoUrl} controls autoPlay loop style={{width:'100%', borderRadius:'16px'}} />
          ) : (
            <p style={{opacity:0.5}}>{loading ? "Video vastundi wait..." : "Ikkada video vastundi"}</p>
          )}
        </div>
      </div>
    </div>
  )
}
