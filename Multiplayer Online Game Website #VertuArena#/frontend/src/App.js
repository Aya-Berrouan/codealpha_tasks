import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Games } from './pages/Games';
import { Auth } from './pages/Auth';
import { Stats } from './pages/Stats';
import { About } from './pages/About';
import { Profile } from './pages/Profile';
import Game from './pages/Game';
import { PrivateRoute } from './components/PrivateRoute';
import TicTacToeMatchmaking from './pages/matchmaking/TicTacToeMatchmaking';
import { ResetPassword } from './pages/ResetPassword';
import CustomCursor from './components/CustomCursor';
import './App.css';
import './bootstrap';

const pageTransition = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3, ease: "easeInOut" }
};

function App() {
  const location = useLocation();

  return (
    <div className="fixed inset-0 overflow-hidden">
      <CustomCursor />
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="relative h-full flex flex-col">
        <Navbar />
        <main className="flex-1 relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <Home />
                </motion.div>
              } />
              <Route path="/games" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <Games />
                </motion.div>
              } />
              <Route path="/matchmaking/tic-tac-toe" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <TicTacToeMatchmaking />
                </motion.div>
              } />
              <Route path="/auth" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <Auth />
                </motion.div>
              } />
              <Route path="/reset-password" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <ResetPassword />
                </motion.div>
              } />
              <Route path="/stats" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <Stats />
                </motion.div>
              } />
              <Route path="/about" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <About />
                </motion.div>
              } />
              <Route path="/profile" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <Profile />
                </motion.div>
              } />
              <Route path="/game" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <PrivateRoute>
                    <Game />
                  </PrivateRoute>
                </motion.div>
              } />
              <Route path="/game/:gameId" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <PrivateRoute>
                    <Game />
                  </PrivateRoute>
                </motion.div>
              } />
              <Route path="/leaderboard" element={
                <motion.div {...pageTransition} className="absolute inset-0">
                  <div className="pt-20 text-center text-white">Leaderboard Page</div>
                </motion.div>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
