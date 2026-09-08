// App.jsx lo top lo ila add chey
console.log("KEY:", import.meta.env.VITE_FAL_KEY ? "OK" : "MISSING")

// gen function lo
const gen=async()=>{
  if(!import.meta.env.VITE_FAL_KEY) return alert("VITE_FAL_KEY missing! Redeploy chey!")
  // ... rest code
  try{
    const r=await fal.subscribe("fal-ai/ltx-video",{input:{prompt}})
    setVideo(r.data.video.url)
  }catch(e){
    console.log("FULL ERROR", e)
    alert("Error: " + JSON.stringify(e, null, 2).slice(0,500))
  }
}
