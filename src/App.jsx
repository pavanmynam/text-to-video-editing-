import React, { useState } from 'react';

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoProject, setVideoProject] = useState(null);
  const [playingState, setPlayingState] = useState({});
  const [activeMasterVideo, setActiveMasterVideo] = useState(null);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      alert("Please enter your video idea!");
      return;
    }

    setLoading(true);
    setVideoProject(null);
    setActiveMasterVideo(null);
    setPlayingState({});

    try {
      // Proper encoding
      const cleanPrompt = encodeURIComponent(prompt.trim());
      const seed = Date.now(); // cache busting ki

      // Pollinations - correct image-to-video trick
      const baseUrl = `https://image.pollinations.ai/prompt/${cleanPrompt}%20cinematic%20hyperrealistic%20video%20sequence%204k%20motion%20neon%20lighting?width=1280&height=720&seed=${seed}&nologo=true&model=turbo`;

      const newProject = {
        title: prompt,
        scenes: [
          {
            id: 1,
            title: "🎬 Scene 1: Cinematic Establishing Sequence",
            voiceover: `Initiating visual layout sequence for "${prompt}". High contrast rendering active.`,
            videoUrl: baseUrl + `&scene=1`,
            duration: 3,
          },
          {
            id: 2,
            title: "⚡ Scene 2: Ultra-Dynamic Climax Shot",
            voiceover: `Transitioning to climax sequence. Dynamic motion engaged.`,
            videoUrl: baseUrl + `&scene=2&enhance=true`,
            duration: 3,
          },
        ],
      };

      // Timeout duration DECREASED - mundu 3000 undi, ippudu 300ms
      setTimeout(() => {
        setVideoProject(newProject);
        setActiveMasterVideo(newProject.scenes[0]);
        setLoading(false);
      }, 300);

    } catch (error) {
      console.error("Video generation failed:", error);
      alert("Error generating video. Try again!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Text to Video Editing</h1>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your video idea... ex: cyberpunk city at night"
          className="flex-1 p-3 rounded bg-zinc-800 border border-zinc-700 outline-none"
        />
        <button
          onClick={handleGenerateVideo}
          disabled={loading}
          className="px-6 py-3 bg-white text-black font-bold rounded disabled:opacity-50"
        >
          {loading? "Generating..." : "Generate"}
        </button>
      </div>

      {videoProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videoProject.scenes.map((scene) => (
            <div key={scene.id} className="bg-zinc-900 p-3 rounded">
              <h3 className="font-semibold mb-2">{scene.title}</h3>
              <img
                src={scene.videoUrl}
                alt={scene.title}
                className="w-full h-auto rounded"
                loading="lazy"
              />
              <p className="text-sm text-zinc-400 mt-2">{scene.voiceover}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
