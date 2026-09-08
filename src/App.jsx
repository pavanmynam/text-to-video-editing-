import { useState } from 'react'
import { fal } from "@fal-ai/client"
fal.config({ credentials: import.meta.env.VITE_FAL_KEY })

export default function App(){
  const [prompt,setPrompt]=useState("")
  const [video,setVideo]=useState("")
  const [load,setLoad]=useState(false)

  const gen=async()=>{
    if(!prompt) return alert("Prompt rayi bro!")
    if(!import.meta.env.VITE_FAL_KEY) return alert("KEY missing! Vercel lo add chey!")
    setLoad(true)
    setVideo("")
    try{
      const result = await fal.subscribe("fal-ai/ltx-video",{
        input:{ prompt: prompt }
      })
      setVideo(result.data.video.url)
    }catch(e){
      alert("Error: " + (e.message || JSON.stringify(e).substring(0,300)))
    }
    setLoad(false)
  }

  return(
    <div style={{padding:40, background:'#111', color:'white', minHeight:'100vh'}}>
      <h1>🎬 Pavan AI Video Generator</h1>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="drone shot" style={{width:350,padding:12}}/>
      <button onClick={gen} style={{padding:12, marginLeft:10, background:'white', color:'black'}}>{load?"Generating...":"Generate"}</button>
      {video && <div style={{marginTop:20}}><video src={video} controls autoPlay style={{width:600}}/><br/><a href={video} style={{color:'cyan'}}>Download</a></div>}
    </div>
  )
}
