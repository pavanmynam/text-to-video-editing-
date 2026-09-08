import { useState } from 'react'
import { fal } from "@fal-ai/client"
fal.config({ credentials: import.meta.env.VITE_FAL_KEY })

export default function App(){
  const [prompt,setPrompt]=useState("")
  const [video,setVideo]=useState("")
  const [load,setLoad]=useState(false)
  const gen=async()=>{
    if(!prompt) return alert("Prompt rayi bro!")
    setLoad(true)
    try{
      const r=await fal.subscribe("fal-ai/ltx-video",{input:{prompt}})
      setVideo(r.data.video.url)
    }catch(e){alert("Error: "+e.message)}
    setLoad(false)
  }
  return(
    <div style={{padding:40, fontFamily:'Arial'}}>
      <h1>🎬 AI Video Generator - Pavan</h1>
      <p>Cost: $0.40 per video | 1k credits = 2500 videos</p>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Eg: Hyderabad charminar drone shot" style={{width:400,padding:12, fontSize:16}}/>
      <button onClick={gen} disabled={load} style={{padding:12,marginLeft:10, background:'black', color:'white', cursor:'pointer'}}>{load?"Generating 30s...":"Generate Video"}</button>
      {video && <div style={{marginTop:30}}><video src={video} controls autoPlay style={{width:600, borderRadius:10}}/><br/><a href={video} download>Download Video</a></div>}
    </div>
  )
}
