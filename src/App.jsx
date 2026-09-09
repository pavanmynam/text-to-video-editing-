import { useState } from 'react';
import * as fal from '@fal-ai/client';

fal.config({ credentials: import.meta.env.VITE_FAL_KEY });

export default function App() {
  const [prompt, setPrompt] = useState("A cinematic drone shot of Charminar, Hyderabad at night, neon lights");
  const [video, setVideo] = useState("");
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState("Ready");

  const generate = async () => {
    setLoading(true); setVideo(""); setLog("Starting...");
    try {
      const res = await fal.subscribe("fal-ai/kling-video/v2.1/master/text-to-video", {
        inputs: { prompt, duration: "5", aspect_ratio: "16:9" },
        logs: true,
        onQueueUpdate: (u) => setLog(u.status)
      });
      setVideo(res.data.video.url);
      setLog("Done ✅");
    } catch (e) {
      setLog("Error: " + e.message);
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div style={{background:'#0a0a0f', minHeight:'100vh', color:'#fff', padding:20}}>
      <h2>FLI Studio - Text to Video</h2>
      <p style={{opacity:0.6}}>{log}</p>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:100, background:'#1a1a23', color:'#fff', borderRadius:12, padding:10}} />
      <button onClick={generate} disabled={loading} style={{marginTop:10, padding:'12px 24px', background:'#7c3aed', border:'none', borderRadius:12, color:'#fff', fontWeight:700}}>
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
      {video && <video src={video} controls autoPlay style={{width:'100%', marginTop:20, borderRadius:16}} />}
    </div>
  )
}
