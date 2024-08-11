# streamlit-record-btn

The Streamlit component allows you to record voice and return a bytearray

## Installation instructions

```sh
pip install -i https://test.pypi.org/simple/ streamlit-record-btn==1.0.0
```

[//]: # (```sh)

[//]: # (pip install streamlit-record-btn)

[//]: # (```)

## Usage instructions

```python
import streamlit as st

from record_button import record_button

if binary_audio := record_button():
    print(binary_audio)
```