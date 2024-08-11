import os

import streamlit as st
import tempfile
from record_button import record_button
from openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""

if "client" not in st.session_state:
    st.session_state.client = OpenAI()

if "chat_history" not in st.session_state:
    st.session_state.chat_history = ""

if "audio_processed" not in st.session_state:
    st.session_state.audio_processed = False

text_container = st.empty()

col_1, col_2 = st.columns([0.8, 0.2])

with col_1:
    prompt = st.text_input(
        label="Chat input",
        label_visibility="collapsed",
        value=st.session_state.chat_history,
    )
    if prompt:
        with text_container.chat_message("user"):
            st.markdown(prompt)

        with text_container.chat_message("assistant"):
            completion = st.session_state.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )
            st.markdown(completion.choices[0].message.content)

with col_2:
    if binary_audio := record_button(use_container_width=True):
        if not st.session_state.audio_processed:
            with tempfile.NamedTemporaryFile(
                    delete=False,
                    suffix=".webm"
            ) as temp_file:
                temp_file.write(binary_audio)
                temp_audio_path = temp_file.name

            with open(temp_audio_path, "rb") as audio_file:
                st.session_state.chat_history = st.session_state.client.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1",
                    response_format="text",
                    language="en"
                )
                st.session_state.audio_processed = True
                st.rerun()

st.session_state.audio_processed = False
