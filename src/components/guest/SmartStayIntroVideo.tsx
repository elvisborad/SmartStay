'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface SmartStayIntroVideoProps {
  onComplete: () => void;
  videoSrc?: string;
}

export default function SmartStayIntroVideo({
  onComplete,
  videoSrc = '/videos/smartstay-intro.mp4',
}: SmartStayIntroVideoProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const completedRef = useRef(false);

  const triggerComplete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  useEffect(() => {
    // Safety fallback timer: Video is ~3 seconds. If loading or playback stutters, auto-proceed after 6 seconds.
    const safetyTimer = setTimeout(() => {
      if (!completedRef.current) {
        console.warn('SmartStay intro video safety timeout reached, proceeding to portal.');
        triggerComplete();
      }
    }, 6000);

    // Attempt UNMUTED video playback on mount
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current
        .play()
        .then(() => {
          setIsVideoLoaded(true);
        })
        .catch((err) => {
          console.warn('Unmuted autoplay blocked by browser policy, attempting muted playback fallback:', err);
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current
              .play()
              .then(() => {
                setIsVideoLoaded(true);
              })
              .catch((e) => {
                console.error('Video autoplay failed completely:', e);
                setVideoError(true);
                setTimeout(triggerComplete, 800);
              });
          }
        });
    }

    return () => {
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      role="region"
      aria-label="SmartStay introduction"
      className={`fixed inset-0 z-[100] bg-[#0A0A0C] text-white flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 selection:bg-[#C6A15B] ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Controls Bar (Sound Toggle & Skip Intro) */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center gap-2">
        {/* Sound Toggle Button */}
        <button
          onClick={toggleMute}
          className="bg-black/60 hover:bg-black/80 text-white/90 hover:text-white p-2 sm:px-3 sm:py-2 rounded-full text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C6A15B]"
          aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-[#DC2626]" />
              <span className="hidden sm:inline">Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#C6A15B]" />
              <span className="hidden sm:inline">Sound On</span>
            </>
          )}
        </button>

        {/* Skip Intro Button */}
        <button
          onClick={triggerComplete}
          className="bg-black/60 hover:bg-black/80 text-white/90 hover:text-white px-3.5 py-2 rounded-full text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 shadow-xl backdrop-blur-md hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#C6A15B]"
          aria-label="Skip introduction video"
        >
          <span>Skip Intro</span>
          <SkipForward className="w-3.5 h-3.5 text-[#C6A15B]" />
        </button>
      </div>

      {/* Fallback Loading Background */}
      {!isVideoLoaded && !videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0A0C] space-y-4 z-10 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-[#171717] border border-[#C6A15B]/40 flex items-center justify-center p-2 shadow-2xl shadow-[#C6A15B]/20">
            <img src="/logo.png" alt="SmartStay Logo" className="w-full h-full object-contain" />
          </div>
          <div className="text-center space-y-1">
            <h2 className="text-lg font-extrabold tracking-tight text-white">SmartStay AI</h2>
            <p className="text-xs text-[#C6A15B] font-bold flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin" /> Preparing Welcome Experience...
            </p>
          </div>
        </div>
      )}

      {/* Video Container (16:9 responsive presentation) */}
      <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center p-0 sm:p-4">
        <video
          ref={videoRef}
          src={videoSrc}
          autoPlay
          playsInline
          onLoadedData={() => setIsVideoLoaded(true)}
          onEnded={triggerComplete}
          onError={() => {
            console.error('Intro video failed to load asset:', videoSrc);
            setVideoError(true);
            triggerComplete();
          }}
          className={`w-full h-full object-contain max-h-screen transition-opacity duration-300 ${
            isVideoLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>

      {/* Subtle Bottom Branding Bar */}
      <div className="absolute bottom-4 inset-x-0 text-center pointer-events-none">
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
          Grand Horizon Hotel • SmartStay Digital Concierge
        </span>
      </div>
    </div>
  );
}
