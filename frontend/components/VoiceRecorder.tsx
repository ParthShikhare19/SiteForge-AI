"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  onAudioReady: (blob: Blob) => void;
  onTranscriptReady?: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onAudioReady, disabled }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      onAudioReady(blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    recorder.start();
    mediaRef.current = recorder;
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }

  function stopRecording() {
    mediaRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        disabled={disabled}
        onClick={recording ? stopRecording : startRecording}
        className={cn(
          "w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg",
          recording
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-purple-600 hover:bg-purple-700",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {recording ? (
          <Square className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>
      <p className="text-sm text-muted-foreground">
        {recording ? (
          <span className="flex items-center gap-2 text-red-500 font-medium">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Recording {fmt(seconds)}
          </span>
        ) : (
          "Tap to start recording"
        )}
      </p>
    </div>
  );
}
