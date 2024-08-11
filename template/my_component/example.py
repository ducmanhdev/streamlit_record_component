import os

import streamlit as st
import tempfile
from my_component import my_component
from openai import OpenAI

os.environ["OPENAI_API_KEY"] = ""

if "client" not in st.session_state:
    st.session_state.client = OpenAI()

if "chat_history" not in st.session_state:
    st.session_state.chat_history = ""

col_1, col_2 = st.columns([0.8, 0.2])

with col_1:
    prompt = st.text_input(
        label="Chat input",
        label_visibility="collapsed",
        value=st.session_state.chat_history,
    )
    if prompt:
        print("prompt", prompt)

with col_2:
    if binary_audio := my_component(key="audio"):
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
