import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { LoadingProvider } from './contexts/LoadingContext';
import ScrollToTop from './components/ScrollToTop';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import OrderList from './pages/dashboard/orders/OrderList';
import OrderDetails from './pages/dashboard/orders/OrderDetails';

const App = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <LoadingProvider>
                    <ThemeProvider>
                        <CartProvider>
                            <WishlistProvider>
                                <ScrollToTop />
                                <AppRoutes />
                            </WishlistProvider>
                        </CartProvider>
                    </ThemeProvider>
                </LoadingProvider>
            </BrowserRouter>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                toastClassName="!bg-white !rounded-2xl !shadow-lg !font-josefin !mt-20"
                progressClassName="!bg-iris"
                bodyClassName="!text-gray-700"
                closeButtonClassName="!text-gray-400 hover:!text-gray-600"
                style={{
                    '--toastify-color-progress-success': 'var(--color-iris)',
                    '--toastify-color-progress-error': '#ef4444',
                }}
            />
        </AuthProvider>
    );
};

export default App;
