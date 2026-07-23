import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser as useClerkUser, useAuth as useClerkAuth } from '@clerk/react';
import { useLocation } from '@tanstack/react-router';

type AuthProviderType = 'clerk' | 'supabase' | 'none';

interface AuthContextValue {
  provider: AuthProviderType;
  user: any | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProviderWrapper');
  }
  return context;
};

const ClerkAuthAdapter = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  
  return (
    <AuthContext.Provider value={{
      provider: 'clerk',
      user,
      isLoading: !isLoaded,
      isSignedIn: !!isSignedIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const FallbackAuthAdapter = ({ children, provider }: { children: React.ReactNode, provider: AuthProviderType }) => {
  return (
    <AuthContext.Provider value={{
      provider,
      user: { id: 'mock_user', name: 'Admin User' },
      isLoading: false,
      isSignedIn: true
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProviderWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isSetupRoute = location.pathname === '/setup';

  const [provider, setProvider] = useState<AuthProviderType | null>(isSetupRoute ? 'none' : null);
  const [clerkKey, setClerkKey] = useState<string>('');

  useEffect(() => {
    if (isSetupRoute) return;
    
    const fetchAuth = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/config/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.value?.provider === 'clerk') {
            setClerkKey(data.value?.key || '');
            setProvider('clerk');
          } else if (data.value?.provider === 'supabase') {
            setProvider('supabase');
          } else {
            setProvider('none');
          }
        } else {
          setProvider('none');
        }
      } catch (e) {
        setProvider('none');
      }
    };
    fetchAuth();
  }, [isSetupRoute]);

  if (provider === null) {
    return <div className="flex items-center justify-center h-screen bg-background text-muted-foreground">Loading Authentication...</div>;
  }

  if (provider === 'clerk' && clerkKey) {
    return (
      <ClerkProvider publishableKey={clerkKey}>
        <ClerkAuthAdapter>
          {children}
        </ClerkAuthAdapter>
      </ClerkProvider>
    );
  }

  return (
    <FallbackAuthAdapter provider={provider}>
      {children}
    </FallbackAuthAdapter>
  );
};
