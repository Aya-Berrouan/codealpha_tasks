export const OverlayPanel = ({ isLogin, onSwitch }) => (
  <div
    className={`absolute top-0 bottom-0 w-1/2 transition-all duration-700 ease-in-out transform
      ${isLogin ? 'translate-x-full' : 'translate-x-0'}
    `}
  >
    {/* Multiple background layers for complete opacity */}
    <div className="absolute inset-0 bg-black/90" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary-pink/20 to-primary-blue/20" />
    <div className="absolute inset-0 backdrop-blur-3xl" />
    
    {/* Content */}
    <div className="relative z-20 h-full flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-2xl font-bold text-white mb-4">
        {isLogin ? "Don't have an account?" : "Already have an account?"}
      </h3>
      <p className="text-gray-200 mb-8">
        {isLogin
          ? "Join our gaming community and start your journey today!"
          : "Welcome back! Login to continue your gaming adventure."}
      </p>
      <button
        onClick={onSwitch}
        className="px-8 py-3 text-lg font-semibold text-white rounded-lg border-2 border-white/50 hover:border-white transition-all duration-300 group"
      >
        <span className="bg-gradient-to-r from-primary-pink to-primary-blue bg-clip-text text-transparent group-hover:text-white transition-colors duration-300">
          {isLogin ? 'Register Now' : 'Login Here'}
        </span>
      </button>
    </div>
  </div>
); 