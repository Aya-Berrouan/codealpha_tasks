import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(error => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleScrollClick = () => {
    const startPosition = window.pageYOffset;
    const targetPosition = window.innerHeight;
    const distance = targetPosition - startPosition;
    const duration = 1000; // Duration in milliseconds
    let start = null;

    function animation(currentTime) {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function for smooth acceleration and deceleration
      const ease = t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      
      window.scrollTo(0, startPosition + distance * ease(progress));

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }

    requestAnimationFrame(animation);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/videos/hero-section.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20"></div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        {/* Hero Text - Using animation classes */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-thin mb-6 animate-fade-in font-montserrat">
          Illuminate Your Space with Elegance
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 font-light mb-8 max-w-2xl animate-fade-in-delay font-nunito tracking-wide">
          Luxury candles crafted to inspire peace, warmth, and timeless beauty.
        </p>

        {/* CTA Button */}
        <Link 
          to="/products"
          className="group relative inline-flex items-center justify-center px-8 py-3 text-lg font-medium
            bg-[#FFB4A2] hover:bg-[#FFD6CC] text-black transition-all duration-300 rounded-full
            transform hover:scale-105 animate-fade-in-delay-2 shadow-lg hover:shadow-xl
            overflow-hidden dark:bg-[#FFB4A2] dark:hover:bg-[#FFD6CC] dark:text-black"
        >
          <span className="relative z-10 text-black dark:text-black">Shop Now</span>
          {/* Button Glow Effect */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FFB4A2] via-[#FFD6CC] to-[#FFB4A2]
            opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"></div>
        </Link>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 w-full flex justify-center">
          <button 
            onClick={handleScrollClick}
            className="animate-bounce hover:text-slate-blue transition-colors duration-300 cursor-pointer p-2 group"
            aria-label="Scroll to next section"
          >
            <ChevronDownIcon className="h-8 w-8 text-white opacity-80 group-hover:opacity-100 group-hover:text-slate-blue transition-all duration-300" />
          </button>
        </div>
      </div>
    </section>
  );
} 