import { useState, useRef } from 'react'

export default function App(){
  const [prompt,setPrompt]=useState('')
  const [style,setStyle]=useState('cinematic')
  const [duration,setDuration]=useState(5)
  const [isGenerating,setIsGenerating]=useState(false)
  const [progress,setProgress]=useState('')
  const [videoUrl,setVideoUrl]=useState('')
  const canvasRef = useRef(null)
  const videoRef = useRef(null)

  const generate = async()=>{
    if(!prompt.trim()) return alert('Prompt rayi bro!')
    setIsGenerating(true)
    setVideoUrl('')
    setProgress('Step 1/2 - AI Image Creating...')

    const fullPrompt = `${prompt}, ${style} style, 8k, ultra detailed`
    const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=1280&height=720&nologo=true&model=turbo&seed=${Date.now()}`
    
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = imgUrl

    img.onload = ()=>{
      setProgress(`Step 2/2 - Making ${duration}s VIDEO...`)
      const canvas = canvasRef.current
      if(!canvas) return
      const ctx = canvas.getContext('2d')
      canvas.width = 1280; canvas.height = 720

      let mimeType = 'video/webm'
      if(MediaRecorder.isTypeSupported('video/webm;codecs=vp9')){
        mimeType = 'video/webm;codecs=vp9'
      }

      const stream = canvas.captureStream(30)
      const recorder = new MediaRecorder(stream, {mimeType})
      const chunks=[]
      recorder.ondataavailable = e=>{ if(e.data.size>0) chunks.push(e.data) }
      recorder.onstop = ()=>{
        const blob = new Blob(chunks, {type:'video/webm'})
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setProgress('')
        setIsGenerating(false)
        setTimeout(()=>videoRef.current?.play(), 200)
      }
      recorder.start()
      
      let frame=0
      const totalFrames = parseInt(duration)*30
      const animate = ()=>{
        if(frame>=totalFrames){ recorder.stop(); return }
        const p = frame/totalFrames
        const scale = 1 + p*0.25
        const xOffset = Math.sin(p*Math.PI*2)*20
        ctx.clearRect(0,0,canvas.width,canvas.height)
        ctx.save()
        ctx.translate(canvas.width/2 + xOffset, canvas.height/2)
        ctx.scale(scale, scale)
        ctx.drawImage(img, -canvas.width/2, -canvas.height/2, canvas.width, canvas.height)
        ctx.restore()
        frame++
        setProgress(`Rendering VIDEO... ${Math.round(p*100)}%`)
        requestAnimationFrame(animate)
      }
      animate()
    }
    img.onerror = ()=>{ setProgress('Failed, malli try chey'); setIsGenerating(false) }
  }

  return (
    <div style={{minHeight:'100vh', background:'#050507', color:'#fff', fontFamily:'Inter, system-ui, sans-serif'}}>
      <div style={{borderBottom:'1px solid #1f1f23', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:'10px', alignItems:'center', fontWeight:'900', fontSize:'20px'}}>
          <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg,#7c3aed,#ec4899)', borderRadius:'10px', display:'grid', placeItems:'center'}}>▶</div>
          PAVAN AI STUDIO
        </div>
        <div style={{fontSize:'12px', color:'#888'}}>Text to Video • Proper App</div>
      </div>

      <div style={{maxWidth:'1100px', margin:'0 auto', padding:'24px', display:'grid', gridTemplateColumns:'360px 1fr', gap:'24px'}}>
        <div style={{background:'#121214', border:'1px solid #1f1f23', borderRadius:'16px', padding:'20px', height:'fit-content'}}>
          <h3 style={{margin:'0 0 16px 0'}}>Create Video</h3>
          <label style={{fontSize:'12px', color:'#888'}}>PROMPT</label>
          <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="A drone shot of Charminar at sunset, cinematic..." 
            style={{width:'100%', minHeight:'110px', margin:'8px 0 16px 0', background:'#0a0a0c', border:'1px solid #2a2a2e', borderRadius:'10px', color:'#fff', padding:'12px', resize:'none', boxSizing:'border-box'}} />
          
          <label style={{fontSize:'12px', color:'#888'}}>STYLE</label>
          <select value={style} onChange={e=>setStyle(e.target.value)} style={{width:'100%', margin:'8px 0 16px 0', background:'#0a0a0c', border:'1px solid #2a2a2e', borderRadius:'10px', color:'#fff', padding:'10px'}}>
            <option value="cinematic">Cinematic</option><option value="realistic">Realistic</option><option value="anime">Anime</option><option value="cyberpunk">Cyberpunk</option><option value="3d render">3D Render</option>
          </select>

          <label style={{fontSize:'12px', color:'#888'}}>DURATION: {duration}s</label>
          <input type="range" min="3" max="10" value={duration} onChange={e=>setDuration(parseInt(e.target.value))} style={{width:'100%', margin:'8px 0 20px 0'}} />

          <button onClick={generate} disabled={isGenerating} style={{width:'100%', padding:'14px', borderRadius:'12px', border:'none', background: isGenerating?'#333':'linear-gradient(135deg,#7c3aed,#ec4899)', color:'#fff', fontWeight:'800', cursor: isGenerating?'not-allowed':'pointer', fontSize:'15px'}}>
            {isGenerating? progress : '✨ Generate VIDEO'}
          </button>
          {isGenerating && <div style={{marginTop:'10px', fontSize:'11px', color:'#666', textAlign:'center'}}>Do not refresh, video rendering...</div>}
        </div>

        <div style={{background:'#121214', border:'1px solid #1f1f23', borderRadius:'16px', padding:'16px', minHeight:'500px'}}>
          <canvas ref={canvasRef} style={{display:'none'}} />
          {!videoUrl && !isGenerating && (
            <div style={{height:'420px', display:'grid', placeItems:'center', color:'#555', border:'2px dashed #222', borderRadius:'12px'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'48px'}}>🎬</div><div>Your AI video will appear here</div><div style={{fontSize:'12px', marginTop:'6px', color:'#444'}}>Proper video player + download</div></div>
            </div>
          )}
          {isGenerating && !videoUrl && (
            <div style={{height:'420px', display:'grid', placeItems:'center', background:'#000', borderRadius:'12px'}}>
              <div style={{textAlign:'center'}}><div style={{width:'40px', height:'40px', border:'3px solid #333', borderTopColor:'#7c3aed', borderRadius:'50%', margin:'0 auto 12px auto'}}></div><div style={{color:'#a78bfa'}}>{progress}</div></div>
            </div>
          )}
          {videoUrl && (
            <>
              <video ref={videoRef} src={videoUrl} controls loop autoPlay playsInline style={{width:'100%', borderRadius:'12px', background:'#000', maxHeight:'480px'}} />
              <div style={{display:'flex', gap:'12px', marginTop:'16px'}}>
                <a href={videoUrl} download={`pavan-ai-video-${Date.now()}.webm`} style={{flex:1, textAlign:'center', background:'#16a34a', color:'#fff', padding:'12px', borderRadius:'10px', textDecoration:'none', fontWeight:'700'}}>⬇ Download VIDEO</a>
                <button onClick={()=>setVideoUrl('')} style={{background:'#222', color:'#fff', border:'1px solid #333', padding:'12px 20px', borderRadius:'10px', cursor:'pointer'}}>Clear</button>
              </div>
              <div style={{marginTop:'12px', fontSize:'12px', color:'#666', background:'#0a0a0c', padding:'10px', borderRadius:'8px'}}>Prompt: {prompt}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
