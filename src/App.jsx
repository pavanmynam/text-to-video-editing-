import React, { useState } from 'react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoProject, setVideoProject] = useState(null);
  const [playingState, setPlayingState] = useState({});
  const [activeMasterVideo, setActiveMasterVideo] = useState(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return alert("Please enter your video idea!");
    setLoading(true);
    setVideoProject(null);
    setActiveMasterVideo(null);
    setPlayingState({});
    
    try {
      const cleanPrompt = encodeURIComponent(prompt.trim());
      
      const newProject = {
        title: prompt,
        scenes: [
          {
            id: 1,
            title: "🎬 Scene 1: Cinematic Establishing Sequence",
            voiceover: `Initiating visual layout sequence for "${prompt}". High contrast rendering active.`,
            videoUrl: `https://pollinations.ai{cleanPrompt}%20cinematic%20hyperrealistic%20video%20sequence%204k%20motion%20neon%20lighting?width=1024&height=576&seed=88&enhance=true&nologo=true`
          },
          {
            id: 2,
            title: "⚡ Scene 2: Ultra-Dynamic Climax Shot",
            voiceover: "The simulation peaks as neon currents reshape the environment structure.",
            videoUrl: `https://pollinations.ai{cleanPrompt}%20slow%20motion%20drone%20shot%20highly%20detailed%20epic%20movement%20cyberpunk?width=1024&height=576&seed=77&enhance=true&nologo=true`
          }
        ]
      };

      await new Promise(resolve => setTimeout(resolve, 4000));
      setVideoProject(newProject);
      if (newProject.scenes && newProject.scenes.length > 0) {
        setActiveMasterVideo(newProject.scenes[0].videoUrl);
      }
    } catch (error) {
      alert("AI Engine error occurred. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = (id) => {
    setPlayingState(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Top Header Panel */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">▶</span>
            </div>
            <div>
              <span className="text-xs font-bold font-mono tracking-widest text-indigo-400 block uppercase">Studio Engine V3.0</span>
              <h1 className="text-xl font-black tracking-tight text-white">NEXUS STUDIO</h1>
            </div>
          </div>
        </div>

        {/* Studio Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side Controls */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 tracking-wider uppercase block">
                Prompt Studio Input
              </label>
              <p className="text-[11px] text-slate-500">Enter a story or prompt to generate your AI video project.</p>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Cyberpunk space base inside Saturn rings, 4k cinematic resolution..."
              className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 focus:outline-none focus:border-purple-500 resize-none text-sm leading-relaxed placeholder:text-slate-700"
            />

            <button
              onClick={handleGenerateVideo}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:opacity-90 text-white font-bold py-4 px-4 rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-40 text-sm"
            >
              {loading ? "Compiling Video Tracks..." : "Generate AI Video System"}
            </button>
          </div>

          {/* Right Side Monitor Console */}
          <div className="lg:col-span-8 space-y-6">
            {!videoProject ? (
              <div className="border border-dashed border-slate-800 rounded-2xl p-24 text-center space-y-4 bg-slate-900/10">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-300">Video Player Terminal Offline</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">The theater screen and live layout timeline will activate once you generate a prompt.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* MASTER CINEMATIC THEATER SCREEN */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden p-2 shadow-2xl">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    {activeMasterVideo && (
                      <img 
                        src={activeMasterVideo} 
                        alt="Master Render Feed" 
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/70 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-[11px] font-mono tracking-wider text-slate-300">● MASTER THEATER OUTPUT</span>
                    </div>
                  </div>
                </div>

                {/* SCENE TIMELINE */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold font-mono tracking-wider text-slate-400 uppercase">
                    Multi-Scene Player Timeline
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {videoProject.scenes.map((scene) => {
                      const isPlaying = playingState[scene.id] ?? true;

                      return (
                        <div 
                          key={scene.id} 
                          onClick={() => setActiveMasterVideo(scene.videoUrl)}
                          className={`bg-slate-900 border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all ${activeMasterVideo === scene.videoUrl ? 'border-purple-500 bg-purple-950/10' : 'border-slate-800 hover:border-slate-700'}`}
                        >
                          
                          {/* Video Frame */}
                          <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                            <img 
                              src={scene.videoUrl} 
                              alt={scene.title} 
                              className={`w-full h-full object-cover transition-all ${isPlaying ? 'opacity-100' : 'opacity-40'}`} 
                            />
                            
                            {/* Player Control Overlay */}
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-3 pt-8 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); togglePlay(scene.id); }}
                                  className="w-8 h-8 rounded bg-slate-950 text-white flex items-center justify-center border border-slate-800 text-xs font-bold hover:bg-purple-600 transition"
                                >
                                  {isPlaying ? "‖" : "▶"}
                                </button>
                              </div>
                            </div>

                            <span className="absolute top-2.5 left-2.5 bg-slate-950 text-[9px] font-mono tracking-widest text-purple-400 px-2 py-0.5 rounded border border-purple-900/50">
                              FEED_0{scene.id}
                            </span>
                          </div>

                          {/* Info Data */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                            <div className="space-y-2">
                              <h4 className="font-bold text-xs text-slate-300 tracking-tight">{scene.title}</h4>
                              <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5">
                                <p className="text-[11px] text-slate-400 italic leading-relaxed font-mono">
                                  "{scene.voiceover}"
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => setActiveMasterVideo(scene.videoUrl)}
                                className="w-full py-2 bg-slate-950 hover:bg-purple-900/30 hover:text-purple-400 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-semibold transition"
                              >
                                Send to Theater
                              </button>
                            </div>
                          </div>

                        </div>
                      );
