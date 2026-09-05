import "dotenv/config";
import http from "node:http";
import { randomUUID } from "node:crypto";
import { AccessToken } from "livekit-server-sdk";
import { RoomAgentDispatch, RoomConfiguration } from "@livekit/protocol";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "127.0.0.1";
const livekitUrl = process.env.LIVEKIT_URL;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

function json(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    });
    return res.end();
  }

  if (req.method !== "GET" || req.url !== "/api/token") return json(res, 404, { error: "Not found" });
  if (!livekitUrl || !apiKey || !apiSecret) {
    return json(res, 500, { error: "LIVEKIT_URL, LIVEKIT_API_KEY and LIVEKIT_API_SECRET are required." });
  }

  try {
    const room = `jarvis-${randomUUID().slice(0, 8)}`;
    const identity = `user-${randomUUID().slice(0, 8)}`;
    const token = new AccessToken(apiKey, apiSecret, { identity, name: "J.A.R.V.I.S. User", ttl: "1h" });
    token.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true });
    token.roomConfig = new RoomConfiguration({ agents: [new RoomAgentDispatch({ agentName: "my-agent" })] });
    return json(res, 200, { serverUrl: livekitUrl, participantToken: await token.toJwt(), room, identity });
  } catch (error) {
    console.error("Token generation failed:", error);
    return json(res, 500, { error: "Unable to create a LiveKit session." });
  }
});

server.listen(port, host, () => console.log(`J.A.R.V.I.S. token server listening on http://${host}:${port}`));
