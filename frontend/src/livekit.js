import { Room, RoomEvent, Track } from "livekit-client";

async function getSessionToken() {
  const response = await fetch("/api/token");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to create LiveKit session");
  return data;
}

export function createLiveKitClient({ onState, onTranscript, onParticipantChange }) {
  const room = new Room({ adaptiveStream: true, dynacast: true });
  const audioElements = new Set();
  let session = null;

  const setState = (state, detail = "") => onState?.(state, detail);

  room.on(RoomEvent.Connected, () => {
    setState("connected", room.name);
    onParticipantChange?.(room.numParticipants);
  });
  room.on(RoomEvent.Reconnecting, () => setState("reconnecting"));
  room.on(RoomEvent.Reconnected, () => setState("connected", room.name));
  room.on(RoomEvent.Disconnected, () => setState("disconnected"));
  room.on(RoomEvent.ParticipantConnected, () => onParticipantChange?.(room.numParticipants));
  room.on(RoomEvent.ParticipantDisconnected, () => onParticipantChange?.(room.numParticipants));

  room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
    const agentSpeaking = speakers.some((participant) => !participant.isLocal);
    if (agentSpeaking) setState("speaking");
    else if (room.localParticipant.isSpeaking) setState("listening");
    else if (room.state === "connected") setState("connected");
  });

  room.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
    if (track.kind !== Track.Kind.Audio) return;
    const element = track.attach();
    element.autoplay = true;
    element.setAttribute("data-livekit-audio", participant.identity);
    document.body.appendChild(element);
    audioElements.add(element);
  });

  room.on(RoomEvent.TrackUnsubscribed, (track) => {
    track.detach().forEach((element) => {
      audioElements.delete(element);
      element.remove();
    });
  });

  room.on(RoomEvent.TranscriptionReceived, (segments, participant) => {
    for (const segment of segments) {
      const text = segment.text?.trim();
      if (!text) continue;
      onTranscript?.({
        role: participant?.isLocal ? "user" : "assistant",
        text,
        final: segment.final,
        participant: participant?.identity,
      });
    }
  });

  room.on(RoomEvent.ConnectionStateChanged, (state) => setState(state.toLowerCase()));

  return {
    room,
    async connect() {
      setState("connecting");
      session = await getSessionToken();
      await room.connect(session.serverUrl, session.participantToken);
      await room.localParticipant.setMicrophoneEnabled(true);
      return session;
    },
    async setMicrophoneEnabled(enabled) {
      await room.localParticipant.setMicrophoneEnabled(enabled);
      setState(enabled ? "listening" : "connected");
    },
    async disconnect() {
      await room.disconnect();
      audioElements.forEach((element) => element.remove());
      audioElements.clear();
      session = null;
    },
  };
}
