import { useWebcam } from '../../hooks/useWebcam';
import Button from '../ui/Button';

interface VideoPanelProps {
  disabled?: boolean;
}

export default function VideoPanel({ disabled }: VideoPanelProps) {
  const { videoRef, isActive, error, startCamera, stopCamera } = useWebcam();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col">
      <h3 className="font-semibold text-gray-900 mb-3">Camera</h3>

      <div className="relative flex-1 min-h-[200px] bg-gray-900 rounded-lg overflow-hidden mb-3">
        {isActive ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: 'scaleX(-1)' }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm">Camera off</span>
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mb-2">{error}</p>
      )}

      <div className="flex justify-center">
        {!isActive ? (
          <Button onClick={startCamera} disabled={disabled} variant="outline" size="sm">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Start Camera
          </Button>
        ) : (
          <Button onClick={stopCamera} variant="danger" size="sm">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
            Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
}
