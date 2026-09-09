const gen=async()=>{
    if(!prompt.trim()) return;
    setLoading(true); setStatus("Connecting to fal.ai...");
    try{
      const mod = await import("@fal-ai/client");
      // FIX for v.config error - auto detect correct object
      let client = mod;
      if(mod.createClient) client = mod.createClient({credentials: import.meta.env.VITE_FAL_KEY});
      else {
        const base = mod.fal || mod.default || mod;
        if(base.config) base.config({credentials: import.meta.env.VITE_FAL_KEY});
        client = base;
      }

      const r = await client.subscribe("fal-ai/minimax-video/text-to-video",{
        inputs:{prompt},
        logs:true,
        onQueueUpdate:(u)=> setStatus((u.status||"Generating")+" • "+(u.logs?.slice(-1)[0]?.message||""))
      });
      const url = r.data?.video?.url || r.video?.url;
      if(url){ setVideo(url); setHistory(h=>[{url,prompt,t:Date.now()},...h].slice(0,12)); setStatus("Done ✅ Video Ready!"); }
    }catch(e){ setStatus("Error: "+e.message); console.log(e); }
    setLoading(false);
  };
