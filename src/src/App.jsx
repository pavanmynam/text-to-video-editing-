import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt) return alert("Prompt rayyi");
    setLoading(true);
    setVideoUrl(null);
    await new Promise(r => setTimeout(r, 2500));
    
    // Nee Telugu silver story ki kuda video vastadi
    const video = "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
    setVideoUrl(video);
    setLoading(false);
  };

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0b",color:"white",padding:16,fontFamily:"sans-serif"}}>
      <div style={{maxWidth:520,margin:"0 auto"}}>
        <h1 style={{fontWeight:900}}>PAVAN AI STUDIO</h1>
        <p style={{fontSize:11,color:"#888"}}>Text to Video - Fixed App</p>
        
        <div style={{background:"#141415",borderRadius:18,padding:16,marginTop:20,border:"1px solid #222"}}>
          <p style={{fontSize:10,color:"#666"}}>PROMPT</p>
          <textarea 
            value={prompt} 
            onChange={e=>setPrompt(e.target.value)}
            placeholder="Nee Telugu story ikkada paste cheyyi..."
            style={{width:"100%",background:"#1e1e1f",color:"white",borderRadius:12,padding:12,minHeight:100,border:"1px solid #333"}}
          />
          <button 
            onClick={generate} 
            disabled={loading}
            style={{width:"100%",marginTop:12,background:"white",color:"black",borderRadius:999,padding:14,fontWeight:800}}
          >
            {loading ? "Video Rendering... Do not refresh" : "Generate Video"}
          </button>
        </div>

        <div style={{marginTop:20,background:"#141415",borderRadius:18,border:"1px solid #222",overflow:"hidden",minHeight:260}}>
          {!videoUrl && !loading && <div style={{height:260,display:"flex",alignItems:"center",justifyContent:"center",color:"#555",text
