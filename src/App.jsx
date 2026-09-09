import { useState } from 'react';
import * as fal from '@fal-ai/client';
fal.config({ credentials: import.meta.env.VITE_FAL_KEY });

export default function App() {
  const [prompt, setPrompt] = useState("cinematic drone shot of Charminar Hyderabad at sunset");
  const [video, setVideo] = useState("");
  const [status, setStatus] = useState("Ready ✅ Credits: $8.60");

  const generate = async () => {
    setStatus("Generating... 60-90 sec");
    try {
      // Cheap & fast model ki marite credits save avutayi - minimax try chey
      const result = await fal.subscribe("fal-ai/minimax-video/text-to-video", {
        inputs: { prompt },
        logs: true,
        onQueueUpdate: (u) => setStatus(u.status)
      });
      
      console.log("FULL RESULT", result); // Vercel log lo chudu
      const videoUrl = result.data?.video?.url || result.video?.url || result.data?.video_url;
      if(videoUrl){
        setVideo(videoUrl);
        setStatus("Done! Cost: $0.40 approx");
      } else {
        setStatus("URL raledu - check console");
      }
    } catch(e){
      setStatus("Error: " + e.message);
    }
  };

  return (
    <div style={{background:'#0a0a0f', minHeight:'100vh', color:'#fff', padding:20}}>
      <h2>Pavan AI Generator - $8.60 Left</h2>
      <p>{status}</p>
      <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} style={{width:'100%', height:80, background:'#1a1a23', color:'#fff', padding:10, borderRadius:10}} />
      <button onClick={generate} style={{marginTop:10, padding:12, background:'#7c3aed', color:'#fff', borderRadius:10, border:'none', width:'100%'}}>Generate (Minimax - cheap & fast)</button>
      {video && <video src={video} controls autoPlay style={{width:'100%', marginTop:20, borderRadius:16}} />}
    </div>
  )
}
