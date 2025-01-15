import { Link } from 'react-router-dom';
import {
  FaInstagram,
  FaFacebookF,
  FaPinterestP,
} from 'react-icons/fa';

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'FAQs', href: '/faqs' },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Returns & Shipping', href: '/shipping' },
];

const socialLinks = [
  { name: 'Instagram', icon: FaInstagram, href: '#' },
  { name: 'Facebook', icon: FaFacebookF, href: '#' },
  { name: 'Pinterest', icon: FaPinterestP, href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-periwinkle/5 border-t border-periwinkle/10">
      <div className="container-custom pt-16 pb-12">
        {/* Top Section - Quick Navigation */}
        <nav className="flex flex-wrap justify-center gap-6 md:gap-12">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className="text-black/80 hover:text-royal-purple transition-all duration-300 font-josefin 
                transform hover:scale-105 hover:opacity-100 opacity-80"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Middle Section - Brand Info & Newsletter */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
          {/* Brand Description */}
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-6">
              <div className="footer-logo w-20 h-20 md:w-24 md:h-24">
                <img 
                  src="/img/favicon.png" 
                  alt="Glowora" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-josefin font-semibold mb-4">About Glowora</h3>
                <p className="text-gray-600 font-nunito leading-relaxed">
                  Discover premium candles crafted to illuminate your space with warmth, elegance, and relaxation. 
                  Each piece is meticulously created to bring luxury and tranquility to your everyday moments.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="text-center md:text-left">
            <h3 className="text-xl font-josefin font-semibold mb-4">Join Our Community</h3>
            <p className="text-gray-600 font-nunito mb-6">
              Join our candle community and enjoy exclusive offers, updates, and inspirations.
            </p>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2.5 rounded-md border border-periwinkle/20 focus:outline-none focus:border-slate-blue font-nunito"
              />
              <button
                type="submit"
                className="btn-primary whitespace-nowrap px-6"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="mt-16 flex justify-center space-x-8">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tekhelet hover:text-slate-blue transition-colors"
              aria-label={social.name}
            >
              <social.icon className="h-6 w-6" />
            </a>
          ))}
        </div>

        {/* Bottom Section - Legal & Copyright */}
        <div className="mt-16 pt-8 border-t border-periwinkle/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {legalLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-gray-600/90 hover:text-royal-purple transition-all duration-300 font-nunito
                    transform hover:scale-105 hover:opacity-100 opacity-80"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-600 font-nunito">
              © {new Date().getFullYear()} Glowora. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 