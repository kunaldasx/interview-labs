import { useState, useRef, useCallback } from 'react';

/**
 * Captures audio from a MediaStream into a Blob.
 * Extracts audio tracks only (strips video) for smaller files and Whisper compatibility.
 */
export function useAudioCapture() {
  const [isCapturing, setIsCapturing] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCapture = useCallback((stream: MediaStream) => {
    chunksRef.current = [];

    // Extract audio tracks only — Whisper doesn't need video
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.error('useAudioCapture: No audio tracks found in stream');
      return;
    }
    const audioStream = new MediaStream(audioTracks);

    // Find a supported MIME type
    let mimeType: string | undefined;
    for (const type of ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        break;
      }
    }

    try {
      const recorder = new MediaRecorder(audioStream, {
        ...(mimeType ? { mimeType } : {}),
      });

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        setIsCapturing(false);
      };

      recorder.onerror = (e) => {
        console.error('useAudioCapture: MediaRecorder error', e);
        setIsCapturing(false);
      };

      recorderRef.current = recorder;
      // Use timeslice to get regular chunks (every 1 second)
      recorder.start(1000);
      setIsCapturing(true);
      console.log(`useAudioCapture: Started recording with ${mimeType || 'default'} MIME type`);
    } catch (err) {
      console.error('useAudioCapture: Failed to start MediaRecorder', err);
    }
  }, []);

  const stopCapture = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        console.log(`useAudioCapture: Stopped (was inactive), blob size: ${blob.size}`);
        resolve(blob);
        return;
      }

      recorder.onstop = () => {
        setIsCapturing(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        console.log(`useAudioCapture: Stopped, chunks: ${chunksRef.current.length}, blob size: ${blob.size}`);
        recorderRef.current = null;
        resolve(blob);
      };

      recorder.stop();
    });
  }, []);

  return { isCapturing, startCapture, stopCapture };
}
