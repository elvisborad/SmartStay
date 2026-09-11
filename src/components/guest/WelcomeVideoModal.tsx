'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, X, Sparkles, CheckCircle2, Film } from 'lucide-react';

interface WelcomeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestName?: string;
  roomNumber?: string;
}

export default function WelcomeVideoModal({
  isOpen,
  onClose,
  guestName = 'Valued Guest',
  roomNumber = '204',
}: WelcomeVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-[#171717] text-white rounded-3xl max-w-2xl w-full border border-[#C6A15B]/40 shadow-2xl overflow-hidden relative my-auto flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#C6A15B]/20 flex items-center justify-between bg-[#171717]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#292724] border border-[#C6A15B]/40 p-1 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-1.5">
                Welcome to Grand Horizon Hotel <Sparkles className="w-4 h-4 text-[#C6A15B]" />
              </h3>
              <p className="text-[11px] text-[#C6A15B] font-semibold">
                Room {roomNumber} • Welcome Guest {guestName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition"
            title="Close video"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Box */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {!videoError ? (
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted={isMuted}
              loop
              onError={() => setVideoError(true)}
              className="w-full h-full object-cover"
            >
              <source
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                type="video/mp4"
              />
            </video>
          ) : (
            /* Fallback luxury resort video preview card if video stream is blocked */
            <div className="relative w-full h-full bg-gradient-to-tr from-[#171717] via-[#292724] to-[#171717] flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] flex items-center justify-center text-[#C6A15B] animate-pulse">
                <Film className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-lg font-bold text-white">Grand Horizon Luxury Experience</h4>
              <p className="text-xs text-white/70 max-w-sm">
                Enjoy your 5-star stay with 24/7 AI Concierge, 1-tap room service, and instant hotel amenities.
              </p>
            </div>
          )}

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4 opacity-100 sm:opacity-90 sm:group-hover:opacity-100 transition-opacity">
            {/* Top Overlay Badge */}
            <div className="flex justify-between items-center">
              <div className="bg-black/60 backdrop-blur-md border border-[#C6A15B]/40 px-3 py-1 rounded-full text-[10px] font-bold text-[#C6A15B] uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#C6A15B] animate-pulse" /> Official Resort Tour
              </div>

              {/* Sound Toggle Button */}
              <button
                onClick={toggleMute}
                className="bg-black/70 hover:bg-black/90 text-white p-2 rounded-full border border-white/20 backdrop-blur-md transition flex items-center gap-1.5 text-xs font-bold px-3"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-[#C6A15B]" /> <span>Unmute Sound</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-[#16A34A]" /> <span>Sound On</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Overlay Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={togglePlay}
                className="bg-[#C6A15B] hover:bg-[#A88544] text-white p-3 rounded-2xl shadow-lg transition flex items-center gap-2 font-bold text-xs"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                <span>{isPlaying ? 'Pause Video' : 'Play Video'}</span>
              </button>

              <div className="text-right text-xs text-white/80 font-serif italic">
                "Hospitality crafted for excellence."
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-[#171717] border-t border-[#C6A15B]/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-white/70">
            <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
            <span>QR Session Verified • Accessing Room {roomNumber} Portal</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-[#C6A15B] hover:bg-[#A88544] text-white font-bold text-xs px-6 py-3 rounded-2xl transition shadow-lg shadow-[#C6A15B]/20 flex items-center justify-center gap-2"
          >
            <span>Enter Guest Portal Now &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
