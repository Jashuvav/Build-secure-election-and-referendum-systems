import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Components
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { LostFoundTabs } from "@/components/LostFoundTabs";
import { AuthModal } from "@/components/AuthModal";
import { NavigationTabs } from "@/components/NavigationTabs";

// Services
import { authService } from "@/utils/authService";
import { User } from "@/types/LostFound";

const queryClient = new QueryClient();

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'lost-found' | 'collaboration' | 'messages'>('lost-found');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Header 
        user={user} 
        onLogin={() => setShowAuthModal(true)} 
        onLogout={handleLogout} 
      />
      
      <main className="container mx-auto px-4 py-6">
        {user ? (
          <>
            <NavigationTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            <div className="mt-6">
              {activeTab === 'lost-found' && <LostFoundTabs user={user} />}
              {activeTab === 'collaboration' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-600 mb-4">
                    Collaboration Features Coming Soon!
                  </h2>
                  <p className="text-gray-500">
                    Connect with like-minded individuals and build amazing projects together.
                  </p>
                </div>
              )}
              {activeTab === 'messages' && (
                <div className="text-center py-12">
                  <h2 className="text-2xl font-bold text-gray-600 mb-4">
                    Messaging System Coming Soon!
                  </h2>
                  <p className="text-gray-500">
                    Secure in-app messaging for item claims and collaboration.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Welcome to Lost & Found
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A secure platform to reunite people with their belongings and foster collaboration
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
      
      <Toaster />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
