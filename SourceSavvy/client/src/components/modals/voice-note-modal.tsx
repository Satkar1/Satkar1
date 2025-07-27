import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause } from "lucide-react";
import { useVoiceRecording } from "@/hooks/use-voice-recording";

interface VoiceNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transcript: string) => void;
}

export default function VoiceNoteModal({ isOpen, onClose, onSave }: VoiceNoteModalProps) {
  const { recording, error, startRecording, stopRecording, cancelRecording } = useVoiceRecording();
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");

  const handleStartRecording = async () => {
    setTranscript("");
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // Simulate speech-to-text conversion
    setTimeout(() => {
      setTranscript("onions tomatoes spices");
    }, 1000);
  };

  const handlePlayback = () => {
    if (!recording.url) return;
    
    const audio = new Audio(recording.url);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
    }
  };

  const handleSave = () => {
    if (transcript) {
      onSave(transcript);
    }
    handleCancel();
  };

  const handleCancel = () => {
    cancelRecording();
    setTranscript("");
    setIsPlaying(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Voice Note</DialogTitle>
        </DialogHeader>
        
        <div className="text-center py-6">
          {!recording.blob ? (
            <div className="space-y-4">
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
                recording.isRecording 
                  ? 'bg-red-500 pulse-ring' 
                  : 'bg-red-50 hover:bg-red-100 cursor-pointer'
              }`}>
                <Mic className={`h-8 w-8 ${recording.isRecording ? 'text-white' : 'text-red-500'}`} />
              </div>
              
              <div>
                {recording.isRecording ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Recording... Speak now</p>
                    <Button
                      onClick={handleStopRecording}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      {error ? error : "Tap to start voice search"}
                    </p>
                    <Button
                      onClick={handleStartRecording}
                      disabled={!!error}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Recording complete!</p>
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handlePlayback}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  <span className="text-xs text-gray-500">
                    {Math.round(recording.duration / 1000)}s
                  </span>
                </div>
              </div>
              
              {transcript && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Detected:</p>
                  <p className="text-sm text-blue-700">"{transcript}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90" 
            onClick={handleSave}
            disabled={!transcript}
          >
            Search
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
