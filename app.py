import streamlit as st

from modules.deepu_engine import analyze_script
from modules.video_engine import (
    generate_kling_video,
    estimate_total_seconds
)

# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="CineLuxe DEEPU",
    page_icon="🎬",
    layout="wide"
)


# ============================================================
# STYLE
# ============================================================

st.markdown("""
<style>

.block-container {
    max-width: 1450px;
    padding-top: 1.2rem;
}

.hero {
    padding: 28px;
    border: 1px solid #2a2a32;
    border-radius: 22px;
    background: linear-gradient(
        135deg,
        #121218,
        #1a1026
    );
    margin-bottom: 20px;
}

.badge {
    display: inline-block;
    padding: 5px 12px;
    border-radius: 99px;
    background: #5b21b6;
    color: white;
    font-size: 12px;
    font-weight: 700;
}

.card {
    border: 1px solid #2b2b34;
    background: #121216;
    border-radius: 16px;
    padding: 16px;
    margin: 10px 0;
}

.small {
    color: #a1a1aa;
    font-size: 0.9rem;
}

.generate-box {
    padding: 20px;
    border-radius: 18px;
    border: 1px solid #6d28d9;
    background: linear-gradient(
        135deg,
        #160c27,
        #0f1020
    );
    margin-top: 15px;
}

</style>
""", unsafe_allow_html=True)


# ============================================================
# SECRETS
# ============================================================

def secret(name):

    try:
        return st.secrets.get(name, None)

    except Exception:
        return None


# ============================================================
# SESSION STATE
# ============================================================

if "script" not in st.session_state:

    st.session_state.script = ""


if "plan" not in st.session_state:

    st.session_state.plan = None


if "videos" not in st.session_state:

    st.session_state.videos = {}


if "generating" not in st.session_state:

    st.session_state.generating = False


# ============================================================
# HEADER
# ============================================================

st.markdown("""
<div class="hero">

<span class="badge">
● DEEPU MODE
</span>

<h1 style="margin-bottom:4px">
🎬 CineLuxe AI
</h1>

<div class="small">

Script → DEEPU Intelligence → Cinematic Scenes →
AI Video Generation

</div>

</div>
""", unsafe_allow_html=True)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.header("⚙️ Production Settings")

    duration = st.selectbox(

        "Clip duration",

        [5, 10],

        index=0

    )


    aspect_ratio = st.selectbox(

        "Aspect ratio",

        [

            "16:9",

            "9:16",

            "1:1"

        ],

        index=0

    )


    st.caption(

        "DEEPU automatically creates scenes. "
        "Each scene is generated as an AI video clip."

    )


    st.divider()


    st.subheader("🔐 API Status")


    gemini_status = (

        "✅ Connected"

        if secret("GEMINI_API_KEY")

        else "⚠️ Optional / Fallback"

    )


    fal_status = (

        "✅ Connected"

        if secret("FAL_KEY")

        else "❌ Missing"

    )


    st.write(

        "🧠 Gemini:",

        gemini_status

    )


    st.write(

        "🎬 FAL:",

        fal_status

    )


    st.divider()


    st.caption(

        "API keys are stored securely "
        "in Streamlit Secrets."

    )


# ============================================================
# MAIN LAYOUT
# ============================================================

left, right = st.columns(

    [1.35, 0.65],

    gap="large"

)


# ============================================================
# LEFT - SCRIPT STUDIO
# ============================================================

with left:

    st.subheader("📝 Script Studio")


    # --------------------------------------------------------
    # SCRIPT FILE UPLOAD
    # --------------------------------------------------------

    script_file = st.file_uploader(

        "📄 Upload script (.txt)",

        type=["txt"]

    )


    if script_file is not None:

        try:

            content = script_file.read()

            st.session_state.script = content.decode(

                "utf-8"

            )


        except UnicodeDecodeError:

            st.session_state.script = content.decode(

                "utf-8-sig"

            )


        except Exception as exc:

            st.error(

                f"Could not read script file: {exc}"

            )


    # --------------------------------------------------------
    # SCRIPT TEXT AREA
    # --------------------------------------------------------

    script = st.text_area(

        "Paste Telugu, English or mixed script",

        value=st.session_state.script,

        height=330,

        placeholder=(

            "Paste your complete script here...\n\n"

            "DEEPU will understand the meaning, "
            "story, history, characters, locations, "
            "mood and cinematic visuals."

        )

    )


    st.session_state.script = script


    # --------------------------------------------------------
    # BUTTONS
    # --------------------------------------------------------

    c1, c2 = st.columns(

        2

    )


    with c1:

        analyze = st.button(

            "🧠 Analyze with DEEPU",

            type="primary",

            use_container_width=True

        )


    with c2:

        clear = st.button(

            "🗑️ Clear Project",

            use_container_width=True

        )


    # --------------------------------------------------------
    # CLEAR
    # --------------------------------------------------------

    if clear:

        st.session_state.script = ""

        st.session_state.plan = None

        st.session_state.videos = {}

        st.session_state.generating = False

        st.rerun()


    # --------------------------------------------------------
    # ANALYZE SCRIPT
    # --------------------------------------------------------

    if analyze:

        if not script.strip():

            st.warning(

                "⚠️ Paste a script first."

            )


        else:

            try:

                with st.spinner(

                    "🧠 DEEPU is understanding your script..."

                ):

                    plan = analyze_script(

                        script,

                        api_key=secret(

                            "GEMINI_API_KEY"

                        ),

                        target_seconds=duration

                    )


                st.session_state.plan = plan

                st.session_state.videos = {}


                st.success(

                    "✅ DEEPU analysis complete!"

                )


                st.rerun()


            except Exception as exc:

                st.error(

                    f"DEEPU analysis failed: {exc}"

                )


# ============================================================
# RIGHT - AUDIO + REFERENCE
# ============================================================

with right:

    st.subheader(

        "🎙 Voice-over & Timing"

    )


    audio = st.file_uploader(

        "Upload voice-over audio",

        type=[

            "mp3",

            "wav",

            "m4a",

            "aac"

        ]

    )


    audio_seconds = None


    if audio:

        st.audio(audio)


        try:

            from mutagen import File as MutagenFile


            meta = MutagenFile(

                audio

            )


            if meta and meta.info:

                audio_seconds = float(

                    meta.info.length

                )


                st.metric(

                    "Voice-over duration",

                    f"{audio_seconds:.1f} sec"

                )


        except Exception:

            st.info(

                "Audio uploaded successfully."

            )


    # --------------------------------------------------------
    # REFERENCE VIDEO
    # --------------------------------------------------------

    st.divider()


    st.subheader(

        "📹 Reference Video"

    )


    reference = st.file_uploader(

        "Optional style / reference video",

        type=[

            "mp4",

            "mov",

            "webm"

        ]

    )


    if reference:

        st.video(reference)


        st.caption(

            "Reference video uploaded for "
            "visual review."

        )


# ============================================================
# DEEPU PLAN
# ============================================================

if st.session_state.plan:


    plan = st.session_state.plan


    scenes = plan.get(

        "scenes",

        []

    )


    st.divider()


    # ========================================================
    # PRODUCTION BLUEPRINT
    # ========================================================

    st.subheader(

        "🧠 DEEPU Production Plan"

    )


    summary = plan.get(

        "summary",

        ""

    )


    if summary:

        st.write(

            summary

        )


    style = plan.get(

        "global_style",

        "cinematic"

    )


    st.caption(

        f"🎨 Style: {style}"

    )


    # ========================================================
    # METRICS
    # ========================================================

    m1, m2, m3 = st.columns(

        3

    )


    with m1:

        st.metric(

            "Scenes",

            len(scenes)

        )


    with m2:

        total = estimate_total_seconds(

            scenes,

            duration

        )


        st.metric(

            "Estimated Duration",

            f"{total} sec"

        )


    with m3:

        st.metric(

            "Generated",

            len(

                st.session_state.videos

            )

        )


    # ========================================================
    # MAIN VIDEO GENERATION SECTION
    # ========================================================

    st.markdown("""

    <div class="generate-box">

    <h2>
    🎬 Generate Your Video
    </h2>

    <div class="small">

    DEEPU has analyzed your script.

    Click the button below to automatically generate
    AI video clips for all scenes.

    </div>

    </div>

    """, unsafe_allow_html=True)


    generate_video = st.button(

        "🎬🔥 GENERATE VIDEO",

        type="primary",

        use_container_width=True

    )


    # ========================================================
    # GENERATE ALL VIDEO SCENES
    # ========================================================

    if generate_video:


        if not secret("FAL_KEY"):

            st.error(

                """

                ❌ FAL_KEY is missing.

                Add your FAL API key in:

                Streamlit →
                Manage App →
                Settings →
                Secrets

                """

            )


        elif not scenes:

            st.error(

                "No scenes were created."

            )


        else:


            st.session_state.generating = True


            st.info(

                f"🎬 Starting generation for "
                f"{len(scenes)} scenes..."

            )


            progress = st.progress(

                0

            )


            status = st.empty()


            successful = 0


            for idx, scene in enumerate(scenes):


                scene_number = idx + 1


                scene_id = scene.get(

                    "id",

                    scene_number

                )


                try:


                    status.info(

                        f"""

                        🎬 Generating Scene

                        {scene_number} / {len(scenes)}

                        """

                    )


                    prompt = scene.get(

                        "kling_prompt",

                        ""

                    )


                    if not prompt:

                        raise Exception(

                            "Scene prompt is empty."

                        )


                    url = generate_kling_video(

                        prompt,

                        duration=duration,

                        aspect_ratio=aspect_ratio,

                        fal_key=secret(

                            "FAL_KEY"

                        )

                    )


                    st.session_state.videos[

                        scene_id

                    ] = url


                    successful += 1


                except Exception as exc:


                    st.error(

                        f"""

                        ❌ Scene {scene_number} failed:

                        {exc}

                        """

                    )


                progress.progress(

                    scene_number / len(scenes)

                )


            st.session_state.generating = False


            status.empty()


            if successful > 0:


                st.success(

                    f"""

                    🎉 Video generation completed!

                    Successfully generated:

                    {successful} / {len(scenes)} scenes.

                    """

                )


            else:


                st.error(

                    """

                    ❌ No scenes were generated.

                    Check your FAL API key and
                    video engine configuration.

                    """

                )


    # ========================================================
    # GENERATED VIDEOS
    # ========================================================

    if st.session_state.videos:


        st.divider()


        st.subheader(

            "🎥 Generated Video Scenes"

        )


        for idx, scene in enumerate(scenes):


            scene_id = scene.get(

                "id",

                idx + 1

            )


            if scene_id in st.session_state.videos:


                st.markdown(

                    f"""

                    ### 🎬 Scene {idx + 1}

                    """

                )


                video_url = (

                    st.session_state.videos[

                        scene_id

                    ]

                )


                st.video(

                    video_url

                )


                st.caption(

                    scene.get(

                        "primary_visual",

                        ""

                    )

                )


    # ========================================================
    # SCENE DETAILS
    # ========================================================

    st.divider()


    st.subheader(

        "🎞 DEEPU Scene Blueprint"

    )


    for idx, scene in enumerate(scenes):


        scene_id = scene.get(

            "id",

            idx + 1

        )


        title = scene.get(

            "primary_visual",

            "Visual Plan"

        )


        with st.expander(

            f"🎬 Scene {idx + 1}: {title}",

            expanded=False

        ):


            col1, col2 = st.columns(

                2

            )


            with col1:


                st.markdown(

                    "**🎙 Voice-over**"

                )


                st.write(

                    scene.get(

                        "voiceover",

                        ""

                    )

                )


                st.markdown(

                    "**🧠 Meaning**"

                )


                st.write(

                    scene.get(

                        "meaning",

                        ""

                    )

                )


                st.markdown(

                    "**🎬 Primary Visual**"

                )


                st.write(

                    scene.get(

                        "primary_visual",

                        ""

                    )

                )


                st.markdown(

                    "**🎞 Secondary Visual**"

                )


                st.write(

                    scene.get(

                        "secondary_visual",

                        ""

                    )

                )


            with col2:


                st.write(

                    f"""

                    **Visual Type:**

                    {scene.get('visual_type', '')}

                    """

                )


                st.write(

                    f"""

                    **Era / Location:**

                    {scene.get('era_location', '')}

                    """

                )


                st.write(

                    f"""

                    **Mood:**

                    {scene.get('mood', '')}

                    """

                )


                st.write(

                    f"""

                    **Shot:**

                    {scene.get('shot', '')}

                    """

                )


                st.write(

                    f"""

                    **Camera:**

                    {scene.get('camera_movement', '')}

                    """

                )


                st.write(

                    f"""

                    **Transition:**

                    {scene.get('transition', '')}

                    """

                )


            st.markdown(

                "**🤖 AI Video Prompt**"

            )


            st.code(

                scene.get(

                    "kling_prompt",

                    ""

                ),

                language=None

            )


    # ========================================================
    # RESET
    # ========================================================

    st.divider()


    if st.button(

        "🗑️ Reset Generated Videos",

        use_container_width=True

    ):


        st.session_state.videos = {}


        st.rerun()


# ============================================================
# INITIAL SCREEN
# ============================================================

else:


    st.info(

        """

        🎬 **How it works**

        1. Paste your complete script.

        2. Click **Analyze with DEEPU**.

        3. DEEPU understands the story and
           automatically creates cinematic scenes.

        4. Click **🎬🔥 GENERATE VIDEO**.

        5. CineLuxe sends the scene prompts to
           the AI video model and generates
           your video scenes.

        """

    )
