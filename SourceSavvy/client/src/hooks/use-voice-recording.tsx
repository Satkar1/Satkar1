import { useState, useRef } from 'react';

export interface VoiceRecording {
  blob: Blob | null;
  url: string | null;
  duration: number;
  isRecording: boolean;
}

export function useVoiceRecording() {
  const [recording, setRecording] = useState<VoiceRecording>({
    blob: null,
    url: null,
    duration: 0,
    isRecording: false,
  });
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const startTimeRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Date.now() - startTimeRef.current;
        
        setRecording({
          blob,
          url,
          duration,
          isRecording: false,
        });

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(prev => ({ ...prev, isRecording: true }));
      setError(null);
    } catch (err) {
      setError('Microphone access denied or not available');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording.isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // Clean up
    if (recording.url) {
      URL.revokeObjectURL(recording.url);
    }
    
    setRecording({
      blob: null,
      url: null,
      duration: 0,
      isRecording: false,
    });
  };

  const clearRecording = () => {
    if (recording.url) {
      URL.revokeObjectURL(recording.url);
    }
    
    setRecording({
      blob: null,
      url: null,
      duration: 0,
      isRecording: false,
    });
  };

  return {
    recording,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearRecording,
  };
}
