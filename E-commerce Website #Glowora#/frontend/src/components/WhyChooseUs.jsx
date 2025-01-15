import { motion } from 'framer-motion';
import { FaHands, FaLeaf, FaFire, FaRecycle, FaStar, FaHeart } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// Color mapping for Tailwind classes
const colorClasses = {
  iris: {
    bg: 'bg-iris',
    text: 'text-iris',
    light: 'bg-iris/10',
  },
  apricot: {
    bg: 'bg-apricot',
    text: 'text-apricot',
    light: 'bg-apricot/10',
  },
  'slate-blue': {
    bg: 'bg-slate-blue',
    text: 'text-slate-blue',
    light: 'bg-slate-blue/10',
  },
  'royal-purple': {
    bg: 'bg-royal-purple',
    text: 'text-royal-purple',
    light: 'bg-royal-purple/10',
  },
  'misty-rose': {
    bg: 'bg-misty-rose',
    text: 'text-misty-rose',
    light: 'bg-misty-rose/10',
  },
  periwinkle: {
    bg: 'bg-periwinkle',
    text: 'text-periwinkle',
    light: 'bg-periwinkle/10',
  },
};

const features = [
  {
    icon: FaHands,
    title: "Handcrafted with Care",
    description: "Every candle is carefully hand-poured to ensure premium quality and attention to detail.",
    color: "iris",
    delay: 0.1
  },
  {
    icon: FaLeaf,
    title: "Natural Ingredients",
    description: "Made with eco-friendly soy wax and natural fragrances for a clean, healthy burn.",
    color: "apricot",
    delay: 0.2
  },
  {
    icon: FaFire,
    title: "Long-Lasting Burn",
    description: "Designed to burn longer and evenly, filling your space with fragrance.",
    color: "slate-blue",
    delay: 0.3
  },
  {
    icon: FaRecycle,
    title: "Sustainable Packaging",
    description: "We prioritize the planet with 100% recyclable and reusable packaging.",
    color: "royal-purple",
    delay: 0.4
  },
  {
    icon: FaStar,
    title: "Luxury Design",
    description: "Minimalist and elegant designs that complement any decor style.",
    color: "misty-rose",
    delay: 0.5
  },
  {
    icon: FaHeart,
    title: "Customer Satisfaction",
    description: "Join thousands of happy customers who trust our brand for quality and beauty.",
    color: "periwinkle",
    delay: 0.6
  }
];

const FeatureCard = ({ feature }) => {
  const colors = colorClasses[feature.color];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: feature.delay, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="group relative bg-white backdrop-blur-lg p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-75 overflow-hidden dark:bg-white"
    >
      {/* Accent border */}
      <div className={`absolute inset-x-0 h-1 top-0 ${colors.bg} rounded-t-2xl transform origin-left transition-transform duration-75 scale-x-0 group-hover:scale-x-100 dark:${colors.bg}`} />
      
      {/* Icon container */}
      <div className={`w-16 h-16 ${colors.light} rounded-2xl flex items-center justify-center mb-6 transform transition-transform duration-75 group-hover:rotate-6 dark:${colors.light}`}>
        <feature.icon className={`${colors.text} text-2xl transform transition-transform duration-75 group-hover:scale-110 dark:${colors.text}`} />
      </div>
      
      {/* Title */}
      <div className="relative h-[28px] mb-4">
        <h3 className="text-xl font-medium text-gray-900 dark:text-gray-900 absolute inset-0 transition-opacity duration-75 group-hover:opacity-0">
          {feature.title}
        </h3>
        <h3 className={`text-xl font-medium ${colors.text} dark:${colors.text} absolute inset-0 transition-opacity duration-75 opacity-0 group-hover:opacity-100`}>
          {feature.title}
        </h3>
      </div>
      
      {/* Description */}
      <p className="text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors duration-75 dark:text-gray-600 dark:group-hover:text-gray-800">
        {feature.description}
      </p>
    </motion.div>
  );
};

FeatureCard.propTypes = {
  feature: PropTypes.shape({
    icon: PropTypes.elementType.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    delay: PropTypes.number.isRequired
  }).isRequired
};

export default function WhyChooseUs() {
  return (
    <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-iris/5 relative overflow-hidden">
      {/* Modern geometric decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-gradient-to-br from-iris/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-apricot/10 to-transparent rounded-full blur-2xl translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-royal-purple/5 to-transparent rounded-full blur-xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="container-custom relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-24"
        >
          <h2 className="text-5xl md:text-6xl font-thin mb-6 text-gray-900 font-montserrat tracking-tight">
            Why Choose <span className="text-iris">Glowora</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-nunito leading-relaxed">
            Experience the perfect blend of artistry and luxury in every handcrafted candle
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 mb-24">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          <Link to="/products">
            <motion.button 
              className="bg-gradient-to-r from-iris to-slate-blue text-white font-medium py-5 px-10 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Discover Our Collection
            </motion.button>
          </Link>
          
          <p className="mt-6 text-gray-500 font-light">
            Join our community of candle enthusiasts
          </p>
        </motion.div>
      </div>
    </section>
  );
} 