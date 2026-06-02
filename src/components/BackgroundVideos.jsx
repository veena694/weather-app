import React, { useState, useEffect } from 'react';

const BackgroundVideos = ({ theme }) => {
  const [currentVideo, setCurrentVideo] = useState(theme.video);
  const [videoOpacity, setVideoOpacity] = useState(0.35);

  useEffect(() => {
    if (theme.video !== currentVideo) {
      // Trigger smooth fade transition
      setVideoOpacity(0);
      const timer = setTimeout(() => {
        setCurrentVideo(theme.video);
        setVideoOpacity(0.35);
      }, 500); // Mapped to transition duration
      return () => clearTimeout(timer);
    }
  }, [theme.video, currentVideo]);

  return (
    <div className={`fixed inset-0 w-full h-full overflow-hidden -z-30 bg-gradient-to-br ${theme.gradient} transition-all duration-1000 select-none pointer-events-none`}>
      {/* Dynamic Background Loop Video */}
      <video
        key={currentVideo}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full -translate-x-1/2 -translate-y-1/2 object-cover scale-[1.03] transition-opacity duration-1000 ease-out"
        style={{ opacity: videoOpacity }}
      >
        <source src={currentVideo} type="video/mp4" />
      </video>

      {/* Futuristic Glass Ambient Glow Circle */}
      <div 
        className="absolute top-[20%] right-[10%] w-[500px] h-[500px] rounded-full ambient-glow transition-all duration-1000"
        style={{
          backgroundColor: theme.accent + '2d',
        }}
      />
      
      {/* Dark Cinematic Vignette Overlay */}
      <div className="absolute inset-0 w-full h-full vignette-overlay opacity-80" />
      
      {/* Backdrop Fog Overlay */}
      <div className={`absolute inset-0 ${theme.isLight ? 'bg-white/10' : 'bg-[#06070a]/20'} backdrop-blur-[2px] pointer-events-none transition-colors duration-1000`} />
    </div>
  );
};

export default BackgroundVideos;
