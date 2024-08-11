import {Streamlit, StreamlitComponentBase, withStreamlitConnection} from "streamlit-component-lib";
import React, {ReactNode, useEffect} from "react";


interface State {
    isFocused: boolean,
    isRecording: boolean,
    mediaRecorder: MediaRecorder | null,
    error: string | null,
}

class MyComponent extends StreamlitComponentBase<State> {
    public state: State = {
        isFocused: false,
        isRecording: false,
        mediaRecorder: null,
        error: null,
    }

    private _startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({audio: true});

            this.setState({mediaRecorder: new MediaRecorder(stream)})
            const chunks: Blob[] = [];

            this.state.mediaRecorder!.ondataavailable = (event) => {
                chunks.push(event.data);
            };

            // blob
            // mediaRecorderRef.current.onstop = () => {
            //     const audioBlob = new Blob(chunks, {type: "audio/webm"});
            //     setAudioBlob(audioBlob);
            //     setIsRecording(false);
            //
            //     console.log('audioBlob', audioBlob)
            //     Streamlit.setComponentValue(audioBlob);
            //     setErrorMessage(null);
            // };

            // base64_audio
            // mediaRecorderRef.current.onstop = () => {
            //     const audioBlob = new Blob(chunks, {type: "audio/webm"});
            //     setAudioBlob(audioBlob);
            //     setIsRecording(false);
            //
            //     // Convert to base64
            //     const reader = new FileReader();
            //     reader.readAsDataURL(audioBlob);
            //     reader.onloadend = () => {
            //         const base64data = reader.result as string;
            //         Streamlit.setComponentValue(base64data);
            //     };
            //     setErrorMessage(null);
            // };

            // // binaryData
            this.state.mediaRecorder!.onstop = () => {
                const audioBlob = new Blob(chunks, {type: "audio/webm"});
                this.setState({isRecording: false});
                const reader = new FileReader();
                reader.readAsArrayBuffer(audioBlob);
                reader.onloadend = () => {
                    const binaryData = reader.result as ArrayBuffer;
                    Streamlit.setComponentValue(binaryData);
                };

                this.setState({
                    mediaRecorder: null,
                    error: null
                });
                stream.getTracks()?.forEach(track => track.stop());
            };

            this.state.mediaRecorder!.start();
            this.setState({isRecording: true});
        } catch (err: any) {
            if (err.name === "NotAllowedError") {
                this.state.error = "Microphone access denied. Please grant permission.";
            } else {
                this.state.error = "An error occurred during recording.";
            }
            console.error("Error accessing microphone:", err);
        }
    }

    private _stopRecording = () => {
        this.state.mediaRecorder?.stop();
    }

    private _toggleRecording = async () => {
        if (this.state.isRecording) {
            this._stopRecording();
        } else {
            await this._startRecording();
        }
    }

    private _onFocus = (): void => {
        this.setState({isFocused: true})
    }

    private _onBlur = (): void => {
        this.setState({isFocused: false})
    }

    public render = (): ReactNode => {
        // Streamlit.setComponentValue(null);

        const {theme} = this.props

        const style: React.CSSProperties = {
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: 400,
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            margin: 0,
            color: theme?.textColor,
            outline: 0,
            width: "100%",
        }

        if (theme) {
            style.border = `1px solid ${
                theme?.base === "dark" ? (this.state.isRecording ? theme.primaryColor : theme.secondaryBackgroundColor) : theme?.primaryColor
            }`
            style.background = theme?.base === "dark" ? (this.state.isRecording ? theme.primaryColor : theme.secondaryBackgroundColor) : theme?.primaryColor;
        }

        return (
            <button
                style={style}
                onClick={this._toggleRecording}
                disabled={this.props.disabled}
                onFocus={this._onFocus}
                onBlur={this._onBlur}
            >
                <img
                    src="microphone.svg"
                    alt=""
                    style={{
                        width: "24px",
                        height: "24px",
                        filter: "invert(100%)"
                    }}
                />
            </button>
        );
    }
}

export default withStreamlitConnection(MyComponent);
