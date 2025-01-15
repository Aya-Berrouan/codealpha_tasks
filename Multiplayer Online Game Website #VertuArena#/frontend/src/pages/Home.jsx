import { Link } from 'react-router-dom';
import { ParticleBackground } from '../components/ParticleBackground';

// Main Home Component
export const Home = () => {
  return (
    <div className="absolute inset-0">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center px-4">
        {/* Particle Background */}
        <div className="absolute inset-0 overflow-hidden">
          <ParticleBackground />
        </div>

        {/* Content Wrapper */}
        <div className="relative text-center max-w-4xl mx-auto z-10">
          <h1 className="text-4xl md:text-6xl font-bold">
            <span className="block bg-gradient-to-r from-primary-pink via-primary-blue to-primary-green bg-clip-text text-transparent animate-gradient">
              Welcome to vertuArena
            </span>
            <div className="relative mt-2.5">
              <span className="block text-3xl md:text-5xl text-white animate-glow whitespace-nowrap overflow-hidden">
                Your Gateway to Real-Time Gaming
              </span>
              {/* Animated underline */}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-primary-pink via-primary-blue to-primary-green transform scale-x-0 animate-[expandWidth_3s_ease-in-out_forwards]" />
            </div>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 italic opacity-0 animate-[fadeIn_1s_ease-in-out_1s_forwards] mt-8">
            Compete, Connect, and Conquer in an immersive online experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeIn_1s_ease-in-out_1.5s_forwards]">
            <Link
              to="/games"
              className="relative group px-8 py-3 text-lg font-semibold text-white rounded-lg overflow-hidden bg-gradient-to-r from-primary-pink to-primary-blue hover:from-primary-blue hover:to-primary-pink transition-all duration-500"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300 bg-white" />
            </Link>
            <Link
              to="/about"
              className="group px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-primary-pink/50 hover:border-primary-pink transition-all duration-300"
            >
              <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
                Learn More
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
