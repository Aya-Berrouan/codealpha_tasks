import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck } from 'react-icons/fa';
import axios from 'axios';
import PropTypes from 'prop-types';
import WhyChooseUs from './WhyChooseUs';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

const scents = [
  { id: 1, name: 'Lavender Dreams', description: 'Calming lavender with hints of vanilla', color: '#E6E6FA' },
  { id: 2, name: 'Vanilla Bliss', description: 'Rich vanilla with warm undertones', color: '#FFF8DC' },
  { id: 3, name: 'Sandalwood Luxury', description: 'Exotic sandalwood with amber notes', color: '#DEB887' },
  { id: 4, name: 'Citrus Garden', description: 'Fresh citrus blend with bergamot', color: '#FFD700' },
  { id: 5, name: 'Ocean Breeze', description: 'Fresh marine scent with coastal notes', color: '#B0E0E6' },
  { id: 6, name: 'Rose Garden', description: 'Delicate rose with jasmine undertones', color: '#FFB6C1' },
];

const jarStyles = [
  { 
    id: 1, 
    name: 'Minimalist White', 
    image: '/img/Jars/Minimalist_White.png',
    description: 'Clean, modern design in pure white',
    price: 39.99
  },
  { 
    id: 2, 
    name: 'Rustic Glass', 
    image: '/img/Jars/Rustic_Glass.png',
    description: 'A single traditional clear glass with texture',
    price: 29.99
  },
  { 
    id: 3, 
    name: 'Royal Purple', 
    image: '/img/Jars/Royal_Purple.png',
    description: 'A single elegant purple tinted glass',
    price: 49.99
  },
  { 
    id: 4, 
    name: 'Matte Black', 
    image: '/img/Jars/Matte_Black.png',
    description: 'A single sophisticated matte black finish',
    price: 44.99
  },
];

const OptionButton = ({ 
  selected, 
  onClick, 
  children, 
  className = '', 
  disabled = false 
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative p-4 rounded-lg transition-all duration-300 ${
      selected
        ? 'border-2 border-royal-purple bg-white shadow-md'
        : 'border border-gray-200 bg-white hover:border-royal-purple/50'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {selected && (
      <div className="absolute top-2 right-2">
        <FaCheck className="text-royal-purple" />
      </div>
    )}
    {children}
  </button>
);

OptionButton.propTypes = {
  selected: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

const LoadingSpinner = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="relative">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-iris border-t-transparent"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-6 w-6 rounded-full bg-white"></div>
      </div>
    </div>
  </div>
);

const ImagePreview = ({ 
  src, 
  alt, 
  isLoading = false, 
  onLoad = () => {}, 
  onError = () => {} 
}) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
    if (onError) onError();
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (imageError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
        <p className="text-gray-500 text-center mb-2">
          Unable to load image
        </p>
        <img
          src="/img/Candles/LuxuryLine/luxury_1 (1).png"
          alt="Fallback Candle"
          className="w-1/2 h-auto opacity-50"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onLoad={onLoad}
      onError={handleError}
    />
  );
};

ImagePreview.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

// Add axios instance with default config for Laravel
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // Increase timeout to 2 minutes for image generation
  withCredentials: true, // Required for Laravel Sanctum
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Add request interceptor for debugging and CSRF
apiClient.interceptors.request.use(async request => {
  // For POST, PUT, DELETE requests, ensure CSRF token is set
  if (['post', 'put', 'delete'].includes(request.method.toLowerCase())) {
    try {
      // Get CSRF cookie if not already set
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      
      // Get the CSRF token from the cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      if (token) {
        // Decode the token as it's stored encoded in the cookie
        request.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
      }
    } catch (error) {
      console.warn('Failed to get CSRF token:', error);
    }
  }

  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response,
      request: error.request
    });
    return Promise.reject(error);
  }
);

export default function CustomizationSection() {
  const [selectedScent, setSelectedScent] = useState(scents[0]);
  const [selectedJar, setSelectedJar] = useState(jarStyles[0]);
  const [customLabel, setCustomLabel] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const maxLabelLength = 30;
  const { addToCart } = useCart();

  const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        // Try each available health check endpoint from api.php
        const healthEndpoints = [
          '/api/simple-test',    // Simple test endpoint that should always work
          '/api/routes-check',   // Route listing endpoint
          '/api/test',           // Basic test route
          '/api/debug'           // Debug endpoint
        ];

        for (const endpoint of healthEndpoints) {
          try {
            console.log(`Attempting to connect to ${endpoint}...`);
            const response = await apiClient.get(endpoint);
            if (response.status === 200) {
              console.log('Connection successful using endpoint:', endpoint, response.data);
              return true;
            }
          } catch (endpointError) {
            console.warn(`Endpoint ${endpoint} failed:`, endpointError.message);
            // Log more details about the error
            if (endpointError.response) {
              console.warn('Error response:', {
                status: endpointError.response.status,
                data: endpointError.response.data,
                headers: endpointError.response.headers
              });
            }
          }
        }

        // If we get here, none of the endpoints worked
        throw new Error('All health check endpoints failed');
      } catch (error) {
        console.warn(`Connection attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) {
          throw error;
        }
        // Wait 1 second before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return false;
  };

  const generateCustomCandle = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // Test connection first
      await testConnection();

      // Get CSRF token before making the request
      await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, { withCredentials: true });
      
      // Get the CSRF token from the cookie
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      // Create a specific client for the generate-candle endpoint with a longer timeout
      const generateClient = axios.create({
        ...apiClient.defaults,
        timeout: 180000, // 3 minutes timeout for this specific request
        headers: {
          ...apiClient.defaults.headers,
          'X-XSRF-TOKEN': token ? decodeURIComponent(token) : '',
        }
      });

      // Log the request payload for debugging
      const requestPayload = {
        prompt: `A single luxury candle in ${selectedJar.name} style with ${selectedScent.name} scent, professional product photography, detailed, 8k, ${customLabel ? `with a personal message in a ticket: "${customLabel}"` : ''}`,
        scent: selectedScent.name,
        style: selectedJar.name,
        label: customLabel || null,
        negative_prompt: "low quality, blurry, text, watermark, signature, distorted, unrealistic"
      };
      console.log('Sending request with payload:', requestPayload);

      const response = await generateClient.post('/api/generate-candle', requestPayload);

      if (response.data?.success) {
        setGeneratedImage(response.data.image_url);
      } else {
        throw new Error(response.data?.message || 'Failed to generate image');
      }
    } catch (err) {
      console.error('API Error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack,
        validationErrors: err.response?.data?.errors,
        csrf: document.cookie.includes('XSRF-TOKEN') ? 'Present' : 'Missing' // Debug CSRF token
      });
      
      let errorMessage;
      if (err.response?.status === 419) {
        // Specific handling for CSRF token issues
        errorMessage = 'Session expired. Please refresh the page and try again. If the problem persists, clear your browser cookies.';
        console.error('CSRF Token Debug:', {
          cookies: document.cookie,
          headers: err.response?.config?.headers
        });
      } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout') || err.response?.status === 504) {
        errorMessage = 'The image generation is taking longer than expected. Please try again with a simpler prompt or try again later.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
      } else if (err.message === 'All health check endpoints failed') {
        errorMessage = 'Unable to establish connection with the server. Please ensure the backend server is running and accessible.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'API endpoint not found. Please check the server configuration.';
      } else if (err.response?.status === 422) {
        // Handle validation errors
        const validationErrors = err.response?.data?.errors;
        if (validationErrors) {
          errorMessage = Object.entries(validationErrors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('\n');
        } else {
          errorMessage = err.response?.data?.message || 'Invalid input data. Please check your inputs and try again.';
        }
      } else if (err.response?.status === 500) {
        errorMessage = err.response?.data?.message || 'Internal server error occurred. Please try again later.';
      } else {
        errorMessage = err.response?.data?.message || err.message || 
          'An error occurred while generating your custom candle. Please try again.';
      }
      
      setError(errorMessage);
      setGeneratedImage(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLabelChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLabelLength) {
      setCustomLabel(value);
    }
  };

  const resetCustomization = () => {
    setSelectedScent(scents[0]);
    setSelectedJar(jarStyles[0]);
    setCustomLabel('');
    setGeneratedImage(null);
    setError(null);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setError('Failed to load the generated image. Please try again.');
  };

  const handleAddToCart = () => {
    if (!generatedImage) {
      toast.error('Please generate a preview first');
      return;
    }

    const customCandle = {
      id: `custom-${Date.now()}`, // Generate a unique ID
      name: `Custom ${selectedJar.name} Candle - ${selectedScent.name}`,
      price: selectedJar.price,
      image_url: generatedImage,
      description: `Custom candle with ${selectedScent.name} scent in ${selectedJar.name} jar${customLabel ? `. Personal message: "${customLabel}"` : ''}`,
      category: { name: 'Custom Candles' },
      is_custom: true,
      custom_details: {
        scent: selectedScent,
        jar: selectedJar,
        label: customLabel,
        generated_image: generatedImage
      }
    };

    addToCart(customCandle, 1);
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container-custom">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-thin mb-4 text-black font-montserrat">
              Make It Your Own
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-nunito">
              Choose your favorite scent, jar style, and add a personal touch to create a candle as unique as you are.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Customization Options */}
            <div className="space-y-8">
              {/* Scent Selection */}
              <div>
                <h3 className="text-2xl font-light mb-4">Choose Your Scent</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scents.map((scent) => (
                    <OptionButton
                      key={scent.id}
                      selected={selectedScent.id === scent.id}
                      onClick={() => setSelectedScent(scent)}
                      disabled={isGenerating}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className="w-6 h-6 rounded-full mt-1"
                          style={{ backgroundColor: scent.color }}
                        />
                        <div className="text-left">
                          <p className="font-medium">{scent.name}</p>
                          <p className="text-sm text-gray-600">{scent.description}</p>
                        </div>
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Jar Style Selection */}
              <div>
                <h3 className="text-2xl font-light mb-4">Select Your Jar</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {jarStyles.map((jar) => (
                    <OptionButton
                      key={jar.id}
                      selected={selectedJar.id === jar.id}
                      onClick={() => setSelectedJar(jar)}
                      disabled={isGenerating}
                    >
                      <div className="text-left">
                        <div className="h-40 mb-3 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          <img
                            src={jar.image}
                            alt={jar.name}
                            className="w-auto h-full object-contain p-2"
                          />
                        </div>
                        <p className="font-medium">{jar.name}</p>
                        <p className="text-sm text-gray-600">{jar.description}</p>
                      </div>
                    </OptionButton>
                  ))}
                </div>
              </div>

              {/* Custom Label */}
              <div>
                <h3 className="text-2xl font-light mb-4">Add Your Personal Message</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customLabel}
                    onChange={handleLabelChange}
                    placeholder="Enter your message (optional)"
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-royal-purple focus:border-transparent outline-none transition-all"
                    disabled={isGenerating}
                    maxLength={maxLabelLength}
                  />
                  <p className="text-sm text-gray-500 text-right">
                    {customLabel.length}/{maxLabelLength} characters
                  </p>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateCustomCandle}
                disabled={isGenerating}
                className="w-full bg-iris hover:bg-slate-blue text-white font-medium py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating Your Custom Candle...' : 'Generate Preview'}
              </button>

              {/* Add Reset Button */}
              {(generatedImage || error) && (
                <button
                  onClick={resetCustomization}
                  className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-full transition-all duration-300"
                >
                  Start Over
                </button>
              )}

              {/* Update error display */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-light mb-6">Your Custom Candle</h3>
                
                {/* Preview Display */}
                <div className="aspect-square rounded-lg bg-gray-100 mb-6 overflow-hidden">
                  <ImagePreview
                    src={generatedImage || selectedJar.image}
                    alt={generatedImage ? "Generated Custom Candle" : "Custom Candle Preview"}
                    isLoading={isGenerating || imageLoading}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </div>

                {/* Selected Options Summary */}
                <div className="space-y-4 mb-8">
                  <div>
                    <p className="text-sm text-gray-600">Selected Scent</p>
                    <p className="font-medium">{selectedScent.name}</p>
                    <p className="text-sm text-gray-500">{selectedScent.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jar Style</p>
                    <p className="font-medium">{selectedJar.name}</p>
                    <p className="text-sm text-gray-500">Price: ${selectedJar.price}</p>
                  </div>
                  {customLabel && (
                    <div>
                      <p className="text-sm text-gray-600">Your Message</p>
                      <p className="font-medium italic">&ldquo;{customLabel}&rdquo;</p>
                    </div>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  className="w-full bg-apricot hover:bg-misty-rose text-black font-medium py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isGenerating || !generatedImage}
                >
                  {isGenerating ? 'Generating...' : `Add to Cart - $${selectedJar.price}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <WhyChooseUs />
    </>
  );
} 