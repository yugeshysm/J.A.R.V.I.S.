The frontend connects to the existing LiveKit Agents service without modifying `src/agent.py`.

Flow: browser -> `/api/token` -> LiveKit Cloud -> room -> `my-agent`; microphone audio is published to the room, agent audio is subscribed by the browser, and LiveKit transcription events update the transcript panel.
