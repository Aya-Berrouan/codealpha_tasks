import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import DashboardLayout from '../components/dashboard/DashboardLayout';

// Auth Components
import PrivateRoute from '../components/auth/PrivateRoute';
import AdminRoute from '../components/auth/AdminRoute';
import ResetPassword from '../components/auth/ResetPassword';

// Dashboard Pages
import DashboardHome from '../pages/dashboard/DashboardHome';
import ProductList from '../pages/dashboard/products/ProductList';
import ProductForm from '../pages/dashboard/products/ProductForm';
import CategoryList from '../pages/dashboard/categories/CategoryList';
import CategoryForm from '../pages/dashboard/categories/CategoryForm';
import OrderList from '../pages/dashboard/orders/OrderList';
import OrderDetails from '../pages/dashboard/orders/OrderDetails';
import OrderStatistics from '../pages/dashboard/orders/OrderStatistics';
import ReviewList from '../pages/dashboard/reviews/ReviewList';
import ReviewDetails from '../pages/dashboard/reviews/ReviewDetails';
import ReviewStatistics from '../pages/dashboard/reviews/ReviewStatistics';
import CustomerList from '../pages/dashboard/customers/CustomerList';
import CustomerForm from '../pages/dashboard/customers/CustomerForm';
import CustomerDetails from '../pages/dashboard/customers/CustomerDetails';
import CustomerStatistics from '../pages/dashboard/customers/CustomerStatistics';
import AnalyticsDashboard from '../pages/dashboard/analytics/AnalyticsDashboard';
import SalesReport from '../pages/dashboard/analytics/SalesReport';
import AdminProfile from '../pages/dashboard/profile/AdminProfile';
import CouponList from '../pages/dashboard/coupons/CouponList';
import CouponForm from '../pages/dashboard/coupons/CouponForm';
import NotificationsPage from '../pages/dashboard/notifications/NotificationsPage';

// Main Website Pages
import Products from '../pages/Products';
import ProductDetails from '../pages/products/ProductDetails';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Wishlist from '../pages/Wishlist';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import OrderConfirmation from '../pages/OrderConfirmation';
import Account from '../pages/Account';
import Orders from '../pages/Orders';
import FAQs from '../pages/FAQs';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Shipping from '../pages/Shipping';
import Auth from '../pages/Auth';

// Main Website Components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import SocialProofGallery from '../components/SocialProofGallery';
import CustomizationSection from '../components/CustomizationSection';

// Main website pages
const Home = () => (
    <main>
        <HeroSection />
        <SocialProofGallery />
        <CustomizationSection />
    </main>
);

// Admin Routes
const adminRoutes = [
    { path: '/admin/notifications', element: <NotificationsPage /> },
];

const AppRoutes = () => {
    return (
        <Routes>
            {/* Admin Dashboard Routes */}
            <Route path="/admin/*" element={
                <AdminRoute>
                    <DashboardLayout>
                        <Routes>
                            <Route index element={<DashboardHome />} />
                            <Route path="profile" element={<AdminProfile />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="products/create" element={<ProductForm />} />
                            <Route path="products/edit/:id" element={<ProductForm />} />
                            <Route path="categories" element={<CategoryList />} />
                            <Route path="categories/create" element={<CategoryForm />} />
                            <Route path="categories/edit/:id" element={<CategoryForm />} />
                            <Route path="coupons" element={<CouponList />} />
                            <Route path="coupons/create" element={<CouponForm />} />
                            <Route path="coupons/edit/:id" element={<CouponForm />} />
                            <Route path="orders" element={<OrderList />} />
                            <Route path="orders/:id" element={<OrderDetails />} />
                            <Route path="order-statistics" element={<OrderStatistics />} />
                            <Route path="reviews" element={<ReviewList />} />
                            <Route path="reviews/:id" element={<ReviewDetails />} />
                            <Route path="review-statistics" element={<ReviewStatistics />} />
                            <Route path="customers" element={<CustomerList />} />
                            <Route path="customers/create" element={<CustomerForm />} />
                            <Route path="customers/edit/:id" element={<CustomerForm />} />
                            <Route path="customers/:id" element={<CustomerDetails />} />
                            <Route path="customer-statistics" element={<CustomerStatistics />} />
                            <Route path="analytics" element={<AnalyticsDashboard />} />
                            <Route path="sales-report" element={<SalesReport />} />
                            <Route path="notifications" element={<NotificationsPage />} />
                        </Routes>
                    </DashboardLayout>
                </AdminRoute>
            } />

            {/* Auth Routes */}
            <Route path="login" element={
                <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Auth />
                    </main>
                </div>
            } />
            <Route path="register" element={
                <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Auth />
                    </main>
                </div>
            } />
            <Route path="reset-password" element={
                <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <ResetPassword />
                    </main>
                </div>
            } />

            {/* Main Website Layout */}
            <Route element={
                <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
                    <Navbar />
                    <main className="flex-grow">
                        <Outlet />
                    </main>
                    <Footer />
                </div>
            }>
                {/* Main Website Routes */}
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:productId" element={<ProductDetails />} />
                <Route path="category/:categoryId" element={<Products />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="wishlist" element={
                    <PrivateRoute>
                        <Wishlist />
                    </PrivateRoute>
                } />
                <Route path="cart" element={
                    <PrivateRoute>
                        <Cart />
                    </PrivateRoute>
                } />
                <Route path="checkout" element={
                    <PrivateRoute>
                        <Checkout />
                    </PrivateRoute>
                } />
                <Route path="order-confirmation" element={
                    <PrivateRoute>
                        <OrderConfirmation />
                    </PrivateRoute>
                } />
                <Route path="orders" element={
                    <PrivateRoute>
                        <Orders />
                    </PrivateRoute>
                } />
                <Route path="account" element={
                    <PrivateRoute>
                        <Account />
                    </PrivateRoute>
                } />
                <Route path="faqs" element={<FAQs />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="terms" element={<Terms />} />
                <Route path="shipping" element={<Shipping />} />
            </Route>
        </Routes>
    );
};

export default AppRoutes; 