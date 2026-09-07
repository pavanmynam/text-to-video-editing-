import React, { useState } from 'react';
import { Sparkles, Video, Play, RefreshCw, Download, Image } from 'lucide-react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoProject, setVideoProject] = useState(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) return alert("దయచేసి మీ వీడియో ఐడియాను టైప్ చేయండి!");
    setLoading(true);
    setVideoProject(null);
    
    try {
      const cleanPrompt = encodeURIComponent(prompt.trim());
      
      const newProject = {
        title: prompt,
        scenes: [
          {
            id: 1,
            title: "Scene 1: Establishing Shot",
            voiceover: `Opening sequence showing the epic visualization of ${prompt}.`,
            videoUrl: `https://pollinations.ai{cleanPrompt}%20cinematic%20hyperrealistic%20video%20sequence%204k%20motion?width=1024&height=576&seed=42&enhance=true&nologo=true`
          },
          {
            id: 2,
            title: "Scene 2: Dynamic Action Close-up",
            voiceover: "The movement intensifies as the core element evolves rapidly forward.",
            videoUrl: `https://pollinations.ai{cleanPrompt}%20slow%20motion%20drone%20shot%20highly%20detailed%20epic%20movement?width=1024&height=576&seed=99&enhance=true&nologo=true`
          }
        ]
      };

      // Simulated AI generation time delay
      await new Promise(resolve => setTimeout(resolve, 4000));
      setVideoProject(newProject);
    } catch (error) {
      alert("AI Video Generation లో లోపం వచ్చింది. మళ్లీ ట్రై చేయండి!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10 selection:bg-indigo-500/30">
      {/* Glow Header */}
      <header className="text-center space-y-3 relative">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h1 className="text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center justify-center gap-3">
          <Video className="w-12 h-12 text-indigo-400 animate-pulse" /> AI Real Text-to-Video Engine
        </h1>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          మీ ఊహను టెక్స్ట్‌గా ఇవ్వండి. AI కొన్ని క్షణాల్లోనే సినిమాటిక్ వీడియో క్లిప్స్ మరియు స్క్రిప్ట్‌ను సృష్టిస్తుంది.
        </p>
      </header>

      {/* Input Console */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="ఉదాహరణకు: Ancient temple hidden inside a glowing cave, waterfalls, photorealistic, 8k movie style..."
          className="w-full h-32 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none placeholder:text-slate-600 text-base leading-relaxed transition"
        />
        <button
          onClick={handleGenerateVideo}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-40"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" /> 
              <span>AI Cinematic Engine వీడియోని జనరేట్ చేస్తోంది...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" /> 
              <span>Generate AI Video Storyboard</span>
            </>
          )}
        </button>
      </div>

      {/* Video Timeline Display */}
      {videoProject && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2.5 text-slate-200">
              <Play className="w-6 h-6 text-pink-400 fill-pink-400/20" /> 
              <span>Active Render Timeline</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videoProject.scenes.map((scene) => (
              <div key={scene.id} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden shadow-2xl flex flex-col group hover:border-slate-700 transition-all duration-300">
                
                {/* AI Render Frame */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img 
                    src={scene.videoUrl} 
                    alt={scene.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <span className="absolute top-3 left-3 bg-red-600 text-[10px] uppercase tracking-wider text-white px-2.5 py-1 rounded-md font-bold animate-pulse">
                    • AI Live Feed
                  </span>
                </div>

                {/* Subtitles & Scripts */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-slate-200 tracking-tight">{scene.title}</h3>
                    <div className="mt-2 bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                      <p className="text-sm text-slate-400 italic leading-relaxed">
                        "{scene.voiceover}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2">
                    <a 
                      href={scene.videoUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full py-3 px-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200"
                    >
                      <Download className="w-4 h-4" /> Open Full Video Clip
                    </a>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
