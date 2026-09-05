## Quick start

From the repository root:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with your LiveKit Cloud credentials:

```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_api_secret
```

Run both processes in separate terminals:

```bash
npm run server
```

```bash
npm run dev
```

Then open the local Vite URL. Click **Connect J.A.R.V.I.S.** and allow microphone access.

The browser receives only a short-lived participant token. The LiveKit API secret stays in the local token server. The token includes the existing `my-agent` dispatch configuration so the Python agent can join the new room.
