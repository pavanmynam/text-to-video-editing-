import streamlit as st
from modules.deepu_engine import analyze_script
from modules.video_engine import generate_kling_video, estimate_total_seconds

st.set_page_config(page_title="CineLuxe DEEPU", page_icon="🎬", layout="wide")

st.markdown("""
<style>
.block-container {max-width: 1450px; padding-top: 1.2rem;}
.hero {padding: 24px; border: 1px solid #2a2a32; border-radius: 22px;
background: linear-gradient(135deg,#121218,#1a1026);}
.badge {display:inline-block; padding:4px 10px; border-radius:99px;
background:#5b21b6; color:white; font-size:12px; font-weight:700;}
.card {border:1px solid #2b2b34; background:#121216; border-radius:16px; padding:16px; margin:10px 0;}
.small {color:#a1a1aa; font-size:0.9rem;}
</style>
""", unsafe_allow_html=True)

def secret(name):
    return st.secrets.get(name, None) if hasattr(st, "secrets") else None

if "script" not in st.session_state:
    st.session_state.script = ""
if "plan" not in st.session_state:
    st.session_state.plan = None
if "videos" not in st.session_state:
    st.session_state.videos = {}

st.markdown("""
<div class="hero">
  <span class="badge">● DEEPU MODE</span>
  <h1 style="margin-bottom:4px">🎬 CineLuxe AI</h1>
  <div class="small">Professional Script → Semantic Scene Plan → Cinematic Visual Prompts → Kling Video</div>
</div>
""", unsafe_allow_html=True)

with st.sidebar:
    st.header("⚙️ Production Settings")
    duration = st.selectbox("Clip duration", [5, 10], index=0)
    aspect_ratio = st.selectbox("Aspect ratio", ["16:9", "9:16", "1:1"], index=0)
    st.caption("Kling clip length is selected per generated scene.")
    st.divider()
    st.subheader("🔐 API Status")
    st.write("🧠 Gemini:", "✅" if secret("GEMINI_API_KEY") else "⚠️ optional / fallback mode")
    st.write("🎬 FAL:", "✅" if secret("FAL_KEY") else "❌ missing")
    st.caption("Keys must be added in Streamlit Secrets, not inside the ZIP.")

left, right = st.columns([1.35, 0.65], gap="large")

with left:
    st.subheader("📝 Script Studio")
    script_file = st.file_uploader("📄 Upload script file (.txt)", type=["txt"])
    if script_file is not None:
        try:
            st.session_state.script = script_file.read().decode("utf-8")
        except UnicodeDecodeError:
            st.session_state.script = script_file.read().decode("utf-8-sig")

    script = st.text_area(
        "Paste Telugu, English or mixed script",
        value=st.session_state.script,
        height=330,
        placeholder="Paste any new script here. DEEPU will analyze the meaning and create scene-by-scene visual plans."
    )
    st.session_state.script = script

    c1, c2 = st.columns(2)
    with c1:
        analyze = st.button("🧠 Analyze with DEEPU", type="primary", use_container_width=True)
    with c2:
        clear = st.button("🗑️ Clear Project", use_container_width=True)

    if clear:
        st.session_state.script = ""
        st.session_state.plan = None
        st.session_state.videos = {}
        st.rerun()

    if analyze:
        if not script.strip():
            st.warning("Paste a script first.")
        else:
            with st.spinner("DEEPU is understanding the script, story context and visuals..."):
                st.session_state.plan = analyze_script(
                    script,
                    api_key=secret("GEMINI_API_KEY"),
                    target_seconds=duration
                )
            st.session_state.videos = {}
            st.success("DEEPU analysis complete.")

with right:
    st.subheader("🎙 Voice-over & Timing")
    audio = st.file_uploader("Upload voice-over audio", type=["mp3", "wav", "m4a", "aac"])
    audio_seconds = None
    if audio:
        st.audio(audio)
        try:
            from mutagen import File as MutagenFile
            meta = MutagenFile(audio)
            if meta and meta.info:
                audio_seconds = float(meta.info.length)
                st.metric("Voice-over duration", f"{audio_seconds:.1f} sec")
        except Exception:
            st.info("Audio uploaded. Exact duration could not be read for this format.")

    if st.session_state.plan:
        total = estimate_total_seconds(st.session_state.plan["scenes"], duration)
        st.metric("Estimated generated timeline", f"{total} sec")
        st.metric("Scene count", len(st.session_state.plan["scenes"]))
        if audio_seconds:
            st.caption(f"Voice-over timing: {audio_seconds:.1f}s. Generated clips may need final timeline editing to match exactly.")

    st.divider()
    st.subheader("📹 Reference Video")
    reference = st.file_uploader("Optional style/reference video", type=["mp4", "mov", "webm"])
    if reference:
        st.video(reference)
        st.caption("Reference upload is available for review. Automatic frame-by-frame style transfer is not claimed in this version.")

if st.session_state.plan:
    plan = st.session_state.plan
    st.divider()
    st.subheader("🧠 DEEPU Production Blueprint")
    st.caption(plan.get("summary", ""))
    st.write(f"**Style:** {plan.get('global_style', 'cinematic')}")

    scenes = plan["scenes"]

    g1, g2 = st.columns([1, 1])
    with g1:
        generate_all = st.button("🎬 Generate All Scenes", type="primary", use_container_width=True)
    with g2:
        if st.button("💾 Reset Generated Videos", use_container_width=True):
            st.session_state.videos = {}
            st.rerun()

    if generate_all:
        if not secret("FAL_KEY"):
            st.error("FAL_KEY is missing. Add it in Streamlit Secrets before generating.")
        else:
            progress = st.progress(0)
            for idx, scene in enumerate(scenes):
                try:
                    with st.spinner(f"Generating Scene {idx+1}/{len(scenes)}..."):
                        url = generate_kling_video(
                            scene.get("kling_prompt", ""),
                            duration=duration,
                            aspect_ratio=aspect_ratio,
                            fal_key=secret("FAL_KEY")
                        )
                    st.session_state.videos[scene["id"]] = url
                except Exception as exc:
                    st.error(f"Scene {scene['id']} failed: {exc}")
                progress.progress((idx + 1) / len(scenes))
            st.success("Generation process finished.")

    for scene in scenes:
        sid = scene["id"]
        with st.expander(f"🎬 SCENE {sid:02d} — {scene.get('primary_visual','Visual plan')}", expanded=(sid == 1)):
            a, b = st.columns(2)
            with a:
                st.markdown("**🎙 Voice-over**")
                st.write(scene.get("voiceover", ""))
                st.markdown("**🧠 Meaning**")
                st.write(scene.get("meaning", ""))
                st.markdown("**🎬 Primary Visual**")
                st.write(scene.get("primary_visual", ""))
                st.markdown("**🎞 Secondary / B-roll**")
                st.write(scene.get("secondary_visual", ""))
            with b:
                st.write(f"**Visual type:** {scene.get('visual_type','')}")
                st.write(f"**Era / location:** {scene.get('era_location','')}")
                st.write(f"**Mood:** {scene.get('mood','')}")
                st.write(f"**Shot:** {scene.get('shot','')}")
                st.write(f"**Camera:** {scene.get('camera_movement','')}")
                st.write(f"**Transition:** {scene.get('transition','')}")
                st.write(f"**Target duration:** {duration} sec")

            st.markdown("**🤖 Kling-ready Prompt**")
            st.code(scene.get("kling_prompt", ""), language=None)

            x, y = st.columns([1, 2])
            with x:
                if st.button(f"🎬 Generate Scene {sid}", key=f"gen_{sid}", use_container_width=True):
                    if not secret("FAL_KEY"):
                        st.error("Add FAL_KEY in Streamlit Secrets.")
                    else:
                        try:
                            with st.spinner("Kling is generating this scene..."):
                                url = generate_kling_video(
                                    scene.get("kling_prompt", ""),
                                    duration=duration,
                                    aspect_ratio=aspect_ratio,
                                    fal_key=secret("FAL_KEY")
                                )
                            st.session_state.videos[sid] = url
                            st.rerun()
                        except Exception as exc:
                            st.error(str(exc))
            if sid in st.session_state.videos:
                st.video(st.session_state.videos[sid])
                st.caption("Generated scene URL is provided by the video service.")

    st.divider()
    st.info("🎬 CineLuxe DEEPU: Analyze first → review scene blueprint → generate selected scenes or all scenes.")
else:
    st.info("Paste any script and click **Analyze with DEEPU**. With GEMINI_API_KEY, DEEPU performs semantic AI analysis; without it, the app still creates a basic fallback scene plan.")
