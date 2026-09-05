import { Room, RoomEvent, Track } from "livekit-client";

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL;
const LIVEKIT_TOKEN = import.meta.env.VITE_LIVEKIT_TOKEN;

export function createLiveKitClient({ onState, onTranscript, onParticipantChange }) {
  const room = new Room({ adaptiveStream: true, dynacast: true });
  const audioElements = new Set();

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
    setState(agentSpeaking ? "speaking" : room.localParticipant.isSpeaking ? "listening" : "connected");
  });

  room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
    if (track.kind === Track.Kind.Audio) {
      const element = track.attach();
      element.autoplay = true;
      element.setAttribute("data-livekit-audio", participant.identity);
      document.body.appendChild(element);
      audioElements.add(element);
    }
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

  room.on(RoomEvent.ConnectionStateChanged, (state) => {
    setState(state.toLowerCase());
  });

  return {
    room,
    async connect() {
      if (!LIVEKIT_URL || !LIVEKIT_TOKEN) {
        throw new Error("Missing VITE_LIVEKIT_URL or VITE_LIVEKIT_TOKEN in frontend/.env.local");
      }
      setState("connecting");
      await room.connect(LIVEKIT_URL, LIVEKIT_TOKEN);
      await room.localParticipant.setMicrophoneEnabled(true);
    },
    async setMicrophoneEnabled(enabled) {
      await room.localParticipant.setMicrophoneEnabled(enabled);
    },
    async disconnect() {
      await room.disconnect();
      audioElements.forEach((element) => element.remove());
      audioElements.clear();
    },
  };
}
