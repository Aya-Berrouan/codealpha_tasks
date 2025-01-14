import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center min-h-screen">
      {/* Animated Candle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-32 h-48 flex items-center justify-center"
      >
        {/* Candle Body */}
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-20 h-32 bg-gradient-to-b from-misty-rose to-apricot rounded-lg shadow-lg"
          style={{ bottom: '0px' }}
        >
          {/* Wick */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 w-0.5 h-3 bg-gray-800" />
        </motion.div>

        {/* Flame */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
            filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute"
          style={{ bottom: '128px' }}
        >
          <div className="w-4 h-8 bg-gradient-to-t from-royal-purple via-iris to-periwinkle rounded-full blur-[2px]" />
          <div className="absolute inset-0 w-4 h-8 bg-gradient-to-t from-royal-purple/50 via-iris/50 to-transparent rounded-full blur-[4px]" />
        </motion.div>

        {/* Light Glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-12 h-12 bg-iris/20 rounded-full blur-xl"
          style={{ bottom: '128px' }}
        />
      </motion.div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mt-8"
      >
        <h2 className="text-2xl font-light text-gray-800 font-montserrat mb-2">{text}</h2>
        
        {/* Loading Bar */}
        <div className="w-48 h-1 mx-auto bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            animate={{
              x: ["-100%", "100%"]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-full bg-gradient-to-r from-royal-purple via-iris to-royal-purple"
          />
        </div>
      </motion.div>
    </div>
  );
}

LoadingScreen.propTypes = {
  text: PropTypes.string
}; 