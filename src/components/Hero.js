import React from "react";

const Hero = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="relative">
        {/* MapArena Text with Shadow & 3D Effect */}
        <h1 className="text-6xl font-extrabold tracking-wide relative">
          <span className="text-yellow-400 drop-shadow-[3px_3px_0px_rgba(0,0,0,0.2)]">MAP</span>
          <br />
          <span className="text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.4)]">ARENA</span>
        </h1>
      </div>

      {/* Subtitle */}
      <p className="text-lg text-gray-200 mt-4 max-w-lg leading-relaxed">
        🌍 Explore the world through clues! Test your knowledge and guess famous destinations.
      </p>
    </section>
  );
};

export default Hero;
