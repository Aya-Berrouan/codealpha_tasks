import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { logout as logoutService } from '../services/auth';
import { toast } from 'react-hot-toast';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logoutService();
      logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navLinks = [
    ['Home', '/'],
    ['Games', '/games'],
    ['Stats', '/stats'],
    ['About', '/about'],
  ];

  return (
    <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${
      scrolled || isOpen ? 'bg-black/80 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex-shrink-0 group"
          >
            <span className="text-4xl font-bold bg-gradient-to-r from-[#FF5AAF] via-[#60B5FF] to-[#A1F55D] bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300 animate-gradient" style={{ fontFamily: "'Macondo Swash Caps', cursive" }}>
              VertuArena
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map(([name, path]) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) => `
                    group relative px-3 py-2 text-white transition-all duration-300
                    ${isActive ? 'text-[#FF5AAF]' : 'hover:text-[#FF5AAF]'}
                  `}
                >
                  <span className="relative z-10">{name}</span>
                  <span className={`
                    absolute inset-0 bg-gradient-to-r from-[#FF5AAF]/20 to-[#60B5FF]/20 rounded-lg 
                    transition-transform duration-300
                    ${location.pathname === path ? 'scale-100' : 'scale-0 group-hover:scale-100'}
                  `} />
                </NavLink>
              ))}
            </div>
          </div>

          {/* Login/Register/Profile Button */}
          <div className="hidden md:block">
            {user ? (
              <div className="flex items-center space-x-4">
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `
                    relative group inline-flex items-center px-6 py-2 
                    text-white font-semibold
                    transition-all duration-300 ease-in-out
                    border-2 border-transparent
                    hover:border-[#FF5AAF]/50
                    rounded-lg
                    overflow-hidden
                    ${isActive 
                      ? 'bg-[#FF5AAF] shadow-[0_0_15px_rgba(255,90,175,0.5)]' 
                      : 'bg-transparent hover:shadow-[0_0_15px_rgba(255,90,175,0.3)]'
                    }
                  `}
                >
                  <span className="relative z-10">Profile</span>
                  <div className="absolute inset-0 transform group-hover:translate-x-0 -translate-x-full transition-transform duration-500 bg-gradient-to-r from-[#FF5AAF] via-[#60B5FF] to-[#FF5AAF]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                    <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#FF5AAF] to-[#60B5FF]" />
                  </div>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="relative group inline-flex items-center px-6 py-2 
                    text-white font-semibold
                    transition-all duration-300 ease-in-out
                    border-2 border-transparent
                    hover:border-[#FF5AAF]/50
                    rounded-lg
                    overflow-hidden
                    bg-transparent hover:shadow-[0_0_15px_rgba(255,90,175,0.3)]"
                >
                  <span className="relative z-10">Logout</span>
                  <div className="absolute inset-0 transform group-hover:translate-x-0 -translate-x-full transition-transform duration-500 bg-gradient-to-r from-[#FF5AAF] via-[#60B5FF] to-[#FF5AAF]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                    <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#FF5AAF] to-[#60B5FF]" />
                  </div>
                </button>
              </div>
            ) : (
              <NavLink
                to="/auth"
                className={({ isActive }) => `
                  relative group inline-flex items-center px-6 py-2 
                  text-white font-semibold
                  transition-all duration-300 ease-in-out
                  border-2 border-transparent
                  hover:border-[#FF5AAF]/50
                  rounded-lg
                  overflow-hidden
                  ${isActive 
                    ? 'bg-[#FF5AAF] shadow-[0_0_15px_rgba(255,90,175,0.5)]' 
                    : 'bg-transparent hover:shadow-[0_0_15px_rgba(255,90,175,0.3)]'
                  }
                `}
              >
                <span className="relative z-10">Login / Register</span>
                <div className="absolute inset-0 transform group-hover:translate-x-0 -translate-x-full transition-transform duration-500 bg-gradient-to-r from-[#FF5AAF] via-[#60B5FF] to-[#FF5AAF]" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                  <div className="absolute inset-0 blur-xl bg-gradient-to-r from-[#FF5AAF] to-[#60B5FF]" />
                </div>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-[#FF5AAF] focus:outline-none transition-colors duration-300"
              aria-expanded={isOpen}
            >
              <span className="sr-only">{isOpen ? 'Close menu' : 'Open menu'}</span>
              {!isOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          md:hidden fixed top-16 left-0 right-0
          transition-all duration-300 ease-in-out
          ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-black/80 backdrop-blur-lg border-t border-white/10 shadow-lg">
          {navLinks.map(([name, path]) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) => `
                block px-3 py-2 rounded-md text-base font-medium
                transition-all duration-300
                ${isActive 
                  ? 'text-[#FF5AAF] bg-[#FF5AAF]/10' 
                  : 'text-white hover:text-[#FF5AAF] hover:bg-white/5'
                }
              `}
            >
              {name}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FF5AAF] hover:bg-white/5 transition-all duration-300"
              >
                Profile
              </NavLink>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FF5AAF] hover:bg-white/5 transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink
              to="/auth"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#FF5AAF] hover:bg-white/5 transition-all duration-300"
            >
              Login / Register
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
}; 