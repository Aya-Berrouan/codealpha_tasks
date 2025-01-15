import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
    BeakerIcon, 
    HeartIcon, 
    SparklesIcon, 
    StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import LoadingScreen from '../components/LoadingScreen';

const missionPoints = [
    {
        title: 'Craftsmanship',
        description: 'Hand-poured perfection in every candle.',
        icon: BeakerIcon,
        color: 'from-iris/20 to-iris/5'
    },
    {
        title: 'Sustainability',
        description: 'Committed to eco-friendly practices and materials.',
        icon: HeartIcon,
        color: 'from-apricot/20 to-apricot/5'
    },
    {
        title: 'Elegance',
        description: 'Timeless designs that enhance any space.',
        icon: SparklesIcon,
        color: 'from-royal-purple/20 to-royal-purple/5'
    }
];

const timeline = [
    {
        year: '2018',
        title: 'Brand Founded',
        description: 'Started with a vision to create luxury candles.',
        icon: '🌱',
        image: '/img/About/Journey/brand_founded.png'
    },
    {
        year: '2019',
        title: 'First Collection',
        description: 'Launched our signature luxury scented line.',
        icon: '✨',
        image: '/img/About/Journey/first_collection.png'
    },
    {
        year: '2021',
        title: 'Eco Revolution',
        description: 'Transitioned to 100% sustainable materials.',
        icon: '🌿',
        image: '/img/About/Journey/eco_revolution.png'
    },
    {
        year: '2023',
        title: 'Global Presence',
        description: 'Expanded to international markets.',
        icon: '🌍',
        image: '/img/About/Journey/global_presence.png'
    }
];

const team = [
    {
        name: 'Sarah Johnson',
        role: 'Founder & Creative Director',
        bio: 'Combines her love for design and nature to create beautiful, eco-friendly candles that inspire tranquility.',
        image: '/img/About/Team/Founder.png',
        favoriteCandle: 'Lavender Dreams',
        inspiration: 'Nature\'s serene moments'
    },
    {
        name: 'Michael Chen',
        role: 'Master Chandler',
        bio: 'With over a decade of experience in candle making, Michael ensures every product meets our high standards.',
        image: '/img/About/Team/Master_Chandler.png',
        favoriteCandle: 'Ocean Breeze',
        inspiration: 'Traditional craftsmanship'
    },
    {
        name: 'Emma Davis',
        role: 'Fragrance Designer',
        bio: 'Creates unique scent combinations that transport you to different worlds and emotions.',
        image: '/img/About/Team/Fragrance_Designer.png',
        favoriteCandle: 'Midnight Jasmine',
        inspiration: 'World travels'
    }
];

const process = [
    {
        title: 'Premium Materials',
        description: 'Selecting the finest sustainable wax and materials.',
        icon: '🌟'
    },
    {
        title: 'Fragrance Blending',
        description: 'Crafting unique and captivating scent combinations.',
        icon: '🌺'
    },
    {
        title: 'Hand Pouring',
        description: 'Each candle is carefully hand-poured with precision.',
        icon: '✨'
    },
    {
        title: 'Eco Packaging',
        description: 'Wrapped in sustainable, beautiful packaging.',
        icon: '🌿'
    }
];

const testimonials = [
    {
        name: 'Emily R.',
        location: 'New York, NY',
        rating: 5,
        text: 'These candles have transformed my living space. The scents are divine and long-lasting!',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3'
    },
    {
        name: 'James M.',
        location: 'London, UK',
        rating: 5,
        text: 'Exceptional quality and beautiful packaging. Perfect for gifts!',
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3'
    },
    {
        name: 'Sophie L.',
        location: 'Paris, France',
        rating: 5,
        text: 'The attention to detail and eco-friendly approach makes these candles special.',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3'
    }
];

const ParallaxSection = ({ children, offset = 100 }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

    return (
        <motion.div ref={ref} style={{ y, position: 'relative' }} className="relative">
            {children}
        </motion.div>
    );
};

ParallaxSection.propTypes = {
    children: PropTypes.node.isRequired,
    offset: PropTypes.number
};

const TeamMemberCard = ({ member }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            className="relative"
            whileHover={{ y: -10 }}
            onClick={() => setIsExpanded(!isExpanded)}
        >
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden cursor-pointer group">
                <div className="h-[450px] relative overflow-hidden">
                    <img 
                        src={member.image} 
                        alt={member.name}
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="p-6 text-center">
                    <h3 className="text-2xl font-medium text-gray-900 mb-2">{member.name}</h3>
                    <p className="text-lg text-iris mb-4">{member.role}</p>
                    <p className="text-gray-600 line-clamp-2">{member.bio}</p>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-xl z-10"
                    >
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                        >
                            ×
                        </button>
                        <div className="h-full flex flex-col justify-center">
                            <h4 className="text-xl font-medium text-gray-900 mb-4">More About {member.name}</h4>
                            <p className="text-gray-600 mb-4">{member.bio}</p>
                            <div className="space-y-2">
                                <p className="text-gray-900">
                                    <span className="font-medium">Favorite Candle:</span> {member.favoriteCandle}
                                </p>
                                <p className="text-gray-900">
                                    <span className="font-medium">Inspiration:</span> {member.inspiration}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

TeamMemberCard.propTypes = {
    member: PropTypes.shape({
        name: PropTypes.string.isRequired,
        role: PropTypes.string.isRequired,
        bio: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        favoriteCandle: PropTypes.string.isRequired,
        inspiration: PropTypes.string.isRequired
    }).isRequired
};

const TestimonialCard = ({ testimonial }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-3xl shadow-lg p-6 relative"
    >
        <div className="flex items-center gap-4 mb-4">
            <img 
                src={testimonial.image} 
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
            />
            <div>
                <h4 className="font-medium text-gray-900">{testimonial.name}</h4>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
            </div>
        </div>
        <div className="flex gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
                i < testimonial.rating ? (
                    <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" />
                ) : (
                    <StarIcon key={i} className="w-5 h-5 text-gray-300" />
                )
            ))}
        </div>
        <p className="text-gray-600">{testimonial.text}</p>
    </motion.div>
);

TestimonialCard.propTypes = {
    testimonial: PropTypes.shape({
        name: PropTypes.string.isRequired,
        location: PropTypes.string.isRequired,
        rating: PropTypes.number.isRequired,
        text: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired
    }).isRequired
};

const VideoCarousel = () => {
    const [currentVideo, setCurrentVideo] = useState(0);
    const videoRefs = useRef([]);
    
    const videos = [
        '/videos/handcrafted_about_1.mp4',
        '/videos/handcrafted_about_2.mp4',
        '/videos/handcrafted_about_3.mp4',
        '/videos/handcrafted_about_4.mp4'
    ];

    useEffect(() => {
        const handleVideoEnd = () => {
            const nextVideo = (currentVideo + 1) % videos.length;
            setCurrentVideo(nextVideo);
        };

        const currentVideoElement = videoRefs.current[currentVideo];
        if (currentVideoElement) {
            currentVideoElement.play();
            currentVideoElement.addEventListener('ended', handleVideoEnd);
        }

        return () => {
            if (currentVideoElement) {
                currentVideoElement.removeEventListener('ended', handleVideoEnd);
            }
        };
    }, [currentVideo]);

    return (
        <div className="aspect-video rounded-3xl overflow-hidden shadow-lg relative">
            {videos.map((video, index) => (
                <motion.div
                    key={video}
                    initial={{ opacity: 0 }}
                    animate={{ 
                        opacity: index === currentVideo ? 1 : 0,
                        scale: index === currentVideo ? 1 : 1.05,
                    }}
                    transition={{ 
                        duration: 1.2,
                        ease: [0.4, 0, 0.2, 1],
                        opacity: { duration: 1 },
                        scale: { duration: 1.2 }
                    }}
                    className="absolute inset-0"
                >
                    <video
                        ref={(el) => (videoRefs.current[index] = el)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                    >
                        <source src={video} type="video/mp4" />
                    </video>
                </motion.div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-50" />
        </div>
    );
};

const About = () => {
    const containerRef = useRef(null);
    const missionRef = useRef(null);
    const craftsmanshipRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    useEffect(() => {
        // Simulate loading time
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const scrollToSection = (ref) => {
        const startPosition = window.pageYOffset;
        const targetPosition = ref.current.offsetTop;
        const distance = targetPosition - startPosition;
        const duration = 2000; // Increased duration for slower scroll
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
        <>
            {loading && <LoadingScreen text="Loading About Page..." />}
        <div ref={containerRef} className="relative min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-misty-rose/30 to-periwinkle/20">
                {/* Left Side - Image */}
                <div className="w-full lg:w-1/2 relative h-screen">
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <img 
                            src="/img/About/store.png"
                            alt="Our Candle Store" 
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                    </motion.div>
                </div>

                {/* Right Side - Content */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 relative">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <motion.h1 
                                    className="text-4xl lg:text-5xl xl:text-6xl font-thin text-gray-900 font-montserrat leading-tight"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.4 }}
                                >
                                    Our Story: Crafting Warmth, One Candle at a Time
                                </motion.h1>
                                <motion.p 
                                    className="text-lg lg:text-xl text-gray-600 font-nunito leading-relaxed"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.8, delay: 0.6 }}
                                >
                                    Since our inception, we&apos;ve been dedicated to creating candles that blend luxury, 
                                    sustainability, and heartfelt artistry. Discover the story behind our brand.
                                </motion.p>
                            </div>

                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.8 }}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(156, 160, 162, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => scrollToSection(missionRef)}
                                    className="px-8 py-4 bg-iris text-white rounded-full text-lg font-medium transition-all duration-300"
                                >
                                    Learn More About Us
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(156, 160, 162, 0.4)" }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => scrollToSection(craftsmanshipRef)}
                                    className="px-8 py-4 border-2 border-iris text-iris rounded-full text-lg font-medium hover:bg-iris/5 transition-all duration-300"
                                >
                                    Our Craftsmanship
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1, delay: 1 }}
                                className="absolute bottom-8 left-16 hidden lg:block"
                            >
                                <div className="flex items-center gap-4 text-gray-500">
                                    <div className="w-12 h-px bg-gray-300" />
                                    <p className="text-sm uppercase tracking-wider">Scroll to explore</p>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section ref={missionRef} className="relative py-32 bg-white overflow-hidden" style={{ position: 'relative' }}>
                <ParallaxSection>
                    <div className="container-custom">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    viewport={{ once: true }}
                                    className="aspect-square rounded-3xl overflow-hidden group relative"
                                >
                                    <motion.img 
                                        src="/img/About/our_purpose.png"
                                        alt="Our Purpose" 
                                        className="w-full h-full object-cover transition-all duration-700"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                    />
                                    {/* Glass brilliance effect - Moving highlight */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(105deg, transparent 20%, rgba(255, 255, 255, 0) 25%, rgba(255, 255, 255, 0.9) 27%, rgba(255, 255, 255, 1) 30%, rgba(255, 255, 255, 0.9) 33%, rgba(255, 255, 255, 0) 35%, transparent 40%)',
                                            mixBlendMode: 'soft-light',
                                            pointerEvents: 'none',
                                            transform: 'skewX(-15deg)'
                                        }}
                                        animate={{
                                            x: ['-100%', '200%'],
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatDelay: 0.3
                                        }}
                                    />
                                    {/* Additional diagonal shine */}
                                    <motion.div
                                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        style={{
                                            background: 'linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.8) 45%, transparent 50%)',
                                            mixBlendMode: 'soft-light',
                                            pointerEvents: 'none',
                                            transform: 'skewX(-20deg) scale(2)'
                                        }}
                                        animate={{
                                            x: ['-100%', '200%'],
                                        }}
                                        transition={{
                                            duration: 2,
                                            ease: "easeInOut",
                                            repeat: Infinity,
                                            repeatDelay: 0.5,
                                            delay: 0.3
                                        }}
                                    />
                                    {/* Edge highlight */}
                                    <div
                                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        style={{
                                            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                                            boxShadow: 'inset 0 0 50px rgba(255,255,255,0.8)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                </motion.div>
                            </div>
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-4xl md:text-5xl font-thin mb-6 text-gray-900 font-montserrat">
                                        Our Purpose
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-8">
                                        At our core, we aim to elevate everyday moments with premium handcrafted candles. 
                                        Our commitment to sustainability and elegance defines everything we do.
                                    </p>
                                </motion.div>
                                <div className="space-y-6">
                                    {missionPoints.map((point, index) => (
                                        <motion.div
                                            key={point.title}
                                            initial={{ opacity: 0, x: 50, y: 20 }}
                                            whileInView={{ opacity: 1, x: 0, y: 0 }}
                                            transition={{ 
                                                duration: 0.8, 
                                                delay: index * 0.2,
                                                ease: "easeOut"
                                            }}
                                            whileHover={{ 
                                                scale: 1.02,
                                                boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.1)"
                                            }}
                                            viewport={{ once: true }}
                                            className={`bg-gradient-to-br ${point.color} p-6 rounded-2xl transform transition-all duration-300 hover:shadow-lg`}
                                        >
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                whileInView={{ scale: 1 }}
                                                transition={{ delay: index * 0.2 + 0.3 }}
                                                viewport={{ once: true }}
                                            >
                                                <point.icon className="w-8 h-8 text-iris mb-4" />
                                            </motion.div>
                                            <motion.h3 
                                                className="text-xl font-medium text-gray-900 mb-2"
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.2 + 0.4 }}
                                                viewport={{ once: true }}
                                            >
                                                {point.title}
                                            </motion.h3>
                                            <motion.p 
                                                className="text-gray-600"
                                                initial={{ opacity: 0, y: 10 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.2 + 0.5 }}
                                                viewport={{ once: true }}
                                            >
                                                {point.description}
                                            </motion.p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Timeline Section */}
            <section className="relative py-32 bg-gradient-to-br from-white to-misty-rose/20 overflow-hidden">
                <ParallaxSection>
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-thin mb-6 text-gray-900 font-montserrat">
                                Our Journey
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                From humble beginnings to becoming a beloved brand.
                            </p>
                        </motion.div>
                        <div className="relative">
                            <div className="space-y-24">
                                {timeline.map((milestone, index) => (
                                    <motion.div
                                        key={milestone.year}
                                        initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8 }}
                                        viewport={{ once: true }}
                                        className={`flex flex-col ${
                                            index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                                        } gap-12 items-center relative`}
                                    >
                                        <div className="w-full md:w-1/2">
                                            <div className="relative overflow-hidden rounded-3xl group">
                                                <img 
                                                    src={milestone.image} 
                                                    alt={milestone.title}
                                                    className="w-full h-80 object-cover transition-all duration-700 transform group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
                                            </div>
                                        </div>
                                        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-iris/50 to-royal-purple/50 transform -translate-x-1/2" />
                                        <div className="w-full md:w-1/2 text-center md:text-left relative">
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                viewport={{ once: true }}
                                            >
                                                <div className="text-5xl font-thin text-iris mb-6">
                                                    {milestone.year}
                                                </div>
                                                <h3 className="text-3xl font-medium text-gray-900 mb-4">
                                                    {milestone.title}
                                                </h3>
                                                <p className="text-lg text-gray-600">
                                                    {milestone.description}
                                                </p>
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Team Section */}
            <section className="relative py-32 bg-white overflow-hidden" style={{ position: 'relative' }}>
                <ParallaxSection>
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-thin mb-6 text-gray-900 font-montserrat">
                                Meet Our Team
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                The passionate individuals behind our beautiful candles.
                            </p>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {team.map(member => (
                                <TeamMemberCard key={member.name} member={member} />
                            ))}
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Craftsmanship Section */}
            <section ref={craftsmanshipRef} className="relative py-32 bg-gradient-to-br from-white to-misty-rose/20 overflow-hidden" style={{ position: 'relative' }}>
                <ParallaxSection>
                    <div className="container-custom">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div className="relative">
                                <VideoCarousel />
                            </div>
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8 }}
                                    viewport={{ once: true }}
                                >
                                    <h2 className="text-4xl md:text-5xl font-thin mb-6 text-gray-900 font-montserrat">
                                        Handcrafted with Love
                                    </h2>
                                    <p className="text-lg text-gray-600 mb-8">
                                        Every candle is hand-poured with precision, using sustainable materials 
                                        and carefully chosen fragrances.
                                    </p>
                                </motion.div>
                                <div className="space-y-6">
                                    {process.map((step, index) => (
                                        <motion.div
                                            key={step.title}
                                            initial={{ opacity: 0, x: 50 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.2 }}
                                            viewport={{ once: true }}
                                            className="flex items-start gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl"
                                        >
                                            <span className="text-2xl">{step.icon}</span>
                                            <div>
                                                <h3 className="text-xl font-medium text-gray-900 mb-2">
                                                    {step.title}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {step.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Testimonials Section */}
            <section className="relative py-32 bg-gradient-to-br from-iris/5 to-royal-purple/5 overflow-hidden" style={{ position: 'relative' }}>
                <ParallaxSection>
                    <div className="container-custom">
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="text-center mb-20"
                        >
                            <h2 className="text-4xl md:text-5xl font-thin mb-6 text-gray-900 font-montserrat">
                                Loved by Our Customers
                            </h2>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                See what our customers have to say about their experience.
                            </p>
                        </motion.div>
                        <div className="relative">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {testimonials.map((testimonial, index) => (
                                    <TestimonialCard key={index} testimonial={testimonial} />
                                ))}
                            </div>
                        </div>
                    </div>
                </ParallaxSection>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 bg-gradient-to-br from-iris to-royal-purple overflow-hidden" style={{ position: 'relative' }}>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1602874801007-bd458bb1b8b6?ixlib=rb-4.0.3')] opacity-10" />
                <ParallaxSection>
                    <div className="container-custom text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            viewport={{ once: true }}
                            className="max-w-3xl mx-auto"
                        >
                            <h2 className="text-4xl md:text-5xl font-thin mb-8 text-white font-montserrat">
                                Bring Warmth and Elegance to Your Space
                            </h2>
                            <p className="text-xl text-white/90 mb-12 font-nunito">
                                Discover our collection of handcrafted candles and let them inspire your moments.
                            </p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <motion.a 
                                    href="/products" 
                                    className="px-8 py-4 bg-white text-iris rounded-full text-lg font-medium hover:bg-opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Shop Now
                                </motion.a>
                                <motion.a 
                                    href="https://instagram.com" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full text-lg font-medium hover:bg-white/10 transition-all duration-300"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Follow Us on Instagram
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>
                </ParallaxSection>
            </section>

            {/* Progress Bar */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 h-1 bg-iris origin-left z-50"
                style={{ scaleX: scrollYProgress, position: 'fixed' }}
            />
        </div>
        </>
    );
};

export default About; 