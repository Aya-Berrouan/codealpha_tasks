import { Link } from 'react-router-dom';

export const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Matchmaking', path: '/matchmaking' },
    { name: 'Stats', path: '/stats' },
    { name: 'About', path: '/about' },
  ];

  const socialLinks = [
    { name: 'Discord', icon: '󰙯', url: '#discord' },
    { name: 'Twitter', icon: '𝕏', url: '#twitter' },
    { name: 'GitHub', icon: '', url: '#github' },
    { name: 'YouTube', icon: '󰗃', url: '#youtube' },
  ];

  const legalLinks = [
    { name: 'Privacy Policy', path: '/privacy' },
    { name: 'Terms of Service', path: '/terms' },
    { name: 'Cookie Policy', path: '/cookies' },
  ];

  return (
    <footer className="relative mt-20 border-t border-white/10">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Main Footer Content */}
      <div className="relative">
        {/* Top Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo & Description */}
            <div className="space-y-4">
              <Link to="/" className="inline-block">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-pink via-primary-blue to-primary-green bg-clip-text text-transparent">
                  vertuArena
                </span>
              </Link>
              <p className="text-gray-400">
                Your gateway to competitive online gaming. Join our community and experience
                the future of multiplayer gaming today.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-400 hover:text-primary-pink transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-primary-pink hover:bg-white/10 transition-all duration-300 transform hover:scale-110 hover:rotate-6"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Stay Updated</h3>
              <form className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-pink/50 transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-primary-pink to-primary-blue text-white rounded-md hover:from-primary-blue hover:to-primary-pink transition-all duration-300"
                  >
                    Subscribe
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              {/* Copyright */}
              <p className="text-gray-400 text-sm">
                © 2024 vertuArena. All rights reserved.
              </p>

              {/* Legal Links */}
              <div className="flex flex-wrap gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="text-sm text-gray-400 hover:text-primary-pink transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}; 