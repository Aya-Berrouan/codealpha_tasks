import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useLoading } from '../contexts/LoadingContext';

const GalleryItem = ({ product }) => {
  const imageUrl = product.primary_image?.image_url || 
                  (product.images && product.images.length > 0 ? product.images[0].image_url : null) ||
                  product.image_url;

  if (!imageUrl) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative group overflow-hidden rounded-xl shadow-lg aspect-square"
    >
      <img
        src={imageUrl}
        alt={product.name}
        onError={(e) => {
          console.error('Image failed to load:', imageUrl);
          e.target.src = '/img/placeholder.jpg';
        }}
        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="font-medium text-sm mb-1">{product.name}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <FaInstagram className="w-4 h-4" />
              <span className="text-sm">@GloworaCandles</span>
            </div>
            <Link
              to={`/products/${product.id}`}
              className="text-xs bg-white/90 text-black px-3 py-1 rounded-full hover:bg-apricot transition-colors duration-300"
            >
              Shop This Look
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

GalleryItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    image_url: PropTypes.string,
    primary_image: PropTypes.shape({
      image_url: PropTypes.string
    }),
    images: PropTypes.arrayOf(PropTypes.shape({
      image_url: PropTypes.string
    }))
  }).isRequired
};

export default function SocialProofGallery() {
  const [products, setProducts] = useState([]);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      showLoading("Loading gallery...");
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      if (response.data && response.data.data) {
        const productsArray = [...response.data.data];
        const randomProducts = productsArray
          .sort(() => Math.random() - 0.5)
          .slice(0, 8);
        setProducts(randomProducts);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-thin mb-4 text-black font-montserrat"
          >
            Inspired by Our Candle Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito"
          >
            Discover how our customers bring warmth and elegance into their homes with our candles
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {products.map((product) => (
            <GalleryItem key={product.id} product={product} />
          ))}
        </div>

        {/* Social CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-lg text-gray-600 mb-6 font-nunito">
            Share your candle moments with us! Tag{' '}
            <span className="font-medium text-royal-purple">@GloworaCandles</span>{' '}
            with <span className="font-medium text-royal-purple">#GloworaMoments</span>{' '}
            for a chance to be featured.
          </p>
          <a
            href="https://www.instagram.com/glowora_candles"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-royal-purple hover:bg-slate-blue text-white px-8 py-3 rounded-full transition-colors duration-300"
          >
            <FaInstagram className="w-5 h-5" />
            <span>Follow Us on Instagram</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
} 