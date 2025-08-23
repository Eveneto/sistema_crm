import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { googleLogin } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';

interface GoogleLoginButtonProps {
  disabled?: boolean;
  loading?: boolean;
}

declare global {
  interface Window {
    google: any;
    googleLoginCallback: (response: any) => void;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ 
  disabled = false, 
  loading = false 
}) => {
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: window.googleLoginCallback,
      });
    };

    // Define callback function
    window.googleLoginCallback = (response: any) => {
      if (response.credential) {
        // Dispatch Google login action
        dispatch(googleLogin({ token: response.credential }));
      }
    };

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [dispatch]);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <Button
      type="default"
      icon={<GoogleOutlined />}
      onClick={handleGoogleLogin}
      disabled={disabled}
      loading={loading}
      size="large"
      style={{
        width: '100%',
        height: '45px',
        borderColor: '#4285f4',
        color: '#4285f4',
        fontWeight: 500,
      }}
    >
      Continuar com Google
    </Button>
  );
};

export default GoogleLoginButton;
