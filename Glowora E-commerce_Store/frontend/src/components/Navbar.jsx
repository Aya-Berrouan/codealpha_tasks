import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  HeartIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Categories', href: '#', dropdown: true },
  { name: 'About Us', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
];

const defaultCategories = [
  { 
    name: 'Aromatherapy', 
    description: 'Candles designed to promote relaxation and wellness', 
    icon: '🧘' 
  },
  { 
    name: 'Scented', 
    description: 'Aromatic candles for every mood and occasion', 
    icon: '🌸' 
  },
  { 
    name: 'Seasonal', 
    description: 'Candles inspired by the beauty of the seasons', 
    icon: '🍂' 
  },
  { 
    name: 'Luxury', 
    description: 'Exquisite, handcrafted candles for a touch of elegance', 
    icon: '��' 
  },
  { 
    name: 'Decorative', 
    description: 'Beautiful candles to enhance your home decor', 
    icon: '🏡' 
  }
];


export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const location = useLocation();
  const { getCartCount } = useCart();
  const { wishlistItems } = useWishlist();
  const wishlistCount = wishlistItems.length;
  const dropdownTimeout = useRef(null);
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchTimeout = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDropdownEnter = () => {
    if (dropdownTimeout.current) {
      clearTimeout(dropdownTimeout.current);
    }
    setIsCategoryDropdownOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 150); // 150ms delay before closing
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.data.success) {
        const transformedCategories = response.data.data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || `Explore our ${category.name} collection`,
          icon: category.icon_url
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Error loading categories');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce the search
    searchTimeout.current = setTimeout(async () => {
      try {
        if (query.trim()) {
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?search=${query}`);
          if (response.data.success) {
            setSearchResults(response.data.data.slice(0, 5)); // Show only first 5 results
          }
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Error searching products');
      } finally {
        setIsSearching(false);
      }
    }, 300); // Wait 300ms after user stops typing
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md shadow-lg mt-0'
            : 'bg-white/60 mt-2 sm:mt-4 mx-2 sm:mx-4 rounded-xl shadow-md backdrop-blur-sm'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <img 
                src="/img/logo.png" 
                alt="Glowora" 
                className="h-12 w-auto object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`text-sm lg:text-base text-black hover:text-slate-blue transition-colors font-josefin ${
                      location.pathname === item.href ? 'text-royal-purple' : ''
                    }`}
                    onMouseEnter={() => item.dropdown && handleDropdownEnter()}
                    onMouseLeave={() => item.dropdown && handleDropdownLeave()}
                  >
                    {item.name}
                  </Link>
                  
                  {/* Category Dropdown */}
                  {item.dropdown && isCategoryDropdownOpen && (
                    <div 
                      className="absolute top-full left-0 w-72 py-3 mt-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 animate-fade-in"
                      onMouseEnter={handleDropdownEnter}
                      onMouseLeave={handleDropdownLeave}
                    >
                      <div className="py-1">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            to={`/category/${category.id}`}
                            className="block px-3 py-2.5 hover:bg-misty-rose/30 transition-colors group"
                            onClick={() => setIsCategoryDropdownOpen(false)}
                          >
                            <div className="px-3">
                              <div className="flex items-center gap-3">
                                {category.icon ? (
                                  <img 
                                    src={category.icon}
                                    alt={category.name}
                                    className="w-8 h-8 object-contain"
                                  />
                                ) : (
                                  <span className="text-xl">🕯️</span>
                                )}
                                <div>
                                  <p className="text-gray-900 font-medium group-hover:text-royal-purple transition-colors">
                                    {category.name}
                                  </p>
                                  <p className="text-sm text-gray-500 group-hover:text-royal-purple/70 transition-colors">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Utility Icons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-6">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-black hover:text-slate-blue transition-colors"
              >
                <MagnifyingGlassIcon className="h-5 lg:h-6 w-5 lg:w-6" />
              </button>
              
              <Link to="/wishlist" className="text-black hover:text-slate-blue transition-colors relative">
                <HeartIcon className="h-5 lg:h-6 w-5 lg:w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link to="/cart" className="text-black hover:text-slate-blue transition-colors relative">
                <ShoppingBagIcon className="h-5 lg:h-6 w-5 lg:w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 text-gray-700 hover:text-iris transition-colors"
                  >
                    {user?.avatar ? (
                      <img 
                        src={`/storage/${user.avatar}`}
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `http://localhost:8000/storage/${user.avatar}`;
                        }}
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-iris/10 text-iris flex items-center justify-center">
                        {user?.first_name?.charAt(0)}
                      </div>
                    )}
                    <span className="hidden md:block">
                      {user?.first_name} {user?.last_name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                    >
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-gray-700 hover:bg-iris/10 hover:text-iris transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-gray-700 hover:bg-iris/10 hover:text-iris transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Account
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-gray-700 hover:bg-iris/10 hover:text-iris transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-iris/10 hover:text-iris transition-colors"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-gray-700 hover:text-iris transition-colors"
                >
                  <UserIcon className="w-6 h-6" />
                  <span className="hidden md:block">Login</span>
                </Link>
              )}

              <Link 
                to="/products" 
                className="btn-primary text-sm lg:text-base hidden lg:block"
              >
                Shop Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center space-x-4 md:hidden">
              <Link to="/wishlist" className="text-black relative">
                <HeartIcon className="h-6 w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="text-black relative">
                <ShoppingBagIcon className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-black p-1"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        <div className="navbar-glow-line"></div>
      </nav>

      {/* Mobile menu */}
      <Transition.Root show={isMobileMenuOpen} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-50" 
          onClose={setIsMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-[280px] sm:w-[350px]">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                          <img 
                            src="/img/logo.png" 
                            alt="Glowora" 
                            className="h-9 w-auto object-contain"
                          />
                        </Link>
                        <button
                          className="text-gray-400 hover:text-gray-500 p-1"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="flex-1 px-4 py-4">
                        <div className="flex flex-col space-y-3">
                          {navigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              className="text-base font-medium text-gray-900 hover:text-royal-purple font-josefin
                                relative w-fit after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-royal-purple
                                after:transition-all after:duration-300 hover:after:w-full"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                        <div className="mt-6 flex flex-col space-y-3">
                          <Link
                            to="/wishlist"
                            className="flex items-center space-x-2 text-gray-900 hover:text-royal-purple font-nunito
                              relative w-fit after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-royal-purple
                              after:transition-all after:duration-300 hover:after:w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="relative">
                              <HeartIcon className="h-5 w-5" />
                              {wishlistCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                  {wishlistCount}
                                </span>
                              )}
                            </div>
                            <span>Wishlist</span>
                          </Link>
                          <Link
                            to="/cart"
                            className="flex items-center space-x-2 text-gray-900 hover:text-royal-purple font-nunito
                              relative w-fit after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-royal-purple
                              after:transition-all after:duration-300 hover:after:w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <div className="relative">
                              <ShoppingBagIcon className="h-5 w-5" />
                              {getCartCount() > 0 && (
                                <span className="absolute -top-2 -right-2 bg-iris text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                  {getCartCount()}
                                </span>
                              )}
                            </div>
                            <span>Cart</span>
                          </Link>
                          <Link
                            to={isAuthenticated ? "/account" : "/login"}
                            className="flex items-center space-x-2 text-gray-900 hover:text-royal-purple font-nunito
                              relative w-fit after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-royal-purple
                              after:transition-all after:duration-300 hover:after:w-full"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <UserIcon className="h-5 w-5" />
                            <span>{isAuthenticated ? "Account" : "Login"}</span>
                          </Link>
                        </div>
                        <div className="mt-6">
                          <Link
                            to="/products"
                            className="w-full btn-primary text-center block"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Shop Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Search Overlay */}
      <Transition.Root show={isSearchOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsSearchOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="mx-auto max-w-2xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative">
                    <MagnifyingGlassIcon
                      className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      type="text"
                      className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm font-nunito"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                </form>

                {/* Search Results */}
                {searchQuery.trim() && (
                  <div className="max-h-96 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-iris mx-auto"></div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="p-2">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            to={`/products/${product.id}`}
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <img
                              src={product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            <div>
                              <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.category.name}</p>
                              <p className="text-sm font-medium text-iris">${Number(product.price).toFixed(2)}</p>
                            </div>
                          </Link>
                        ))}
                        <div className="p-4 text-center border-t">
                          <button
                            onClick={handleSearchSubmit}
                            className="text-sm text-iris hover:text-iris/80 font-medium"
                          >
                            View all results
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No products found
                      </div>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
} 