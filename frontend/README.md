# J.A.R.V.I.S. Frontend

React/Vite command-center UI for the existing LiveKit Agents Python service.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in your LiveKit Cloud values.
2. From `frontend/`, install dependencies:

```bash
npm install
```

3. Start the token server in one terminal:

```bash
npm run server
```

4. Start the React app in another terminal:

```bash
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

The token server keeps `LIVEKIT_API_SECRET` on the server and creates a short-lived participant token. The token also requests dispatch of the existing `my-agent` into the newly created room.

## Architecture

```text
Browser (React/Vite)
       |
       | GET /api/token
       v
Local token server
       |
       | short-lived access token
       v
LiveKit Cloud room <----> existing Python agent (`my-agent`)
       |
       +---- microphone audio -> agent
       +---- agent audio -> browser
       +---- transcription events -> UI
```

The existing Python agent code is intentionally not modified by the frontend work.
