import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import LoadingScreen from '../components/LoadingScreen';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Loading...");

  const showLoading = (text = "Loading...") => {
    setLoadingText(text);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading, loadingText }}>
      {children}
      {isLoading && <LoadingScreen text={loadingText} />}
    </LoadingContext.Provider>
  );
}

LoadingProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 