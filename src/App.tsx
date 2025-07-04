import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useSearchParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AuthCallback from './components/Auth/AuthCallback';
import Dashboard from './components/Dashboard/Dashboard';
import CreatePost from './components/CreatePost/CreatePost';
import Schedule from './components/Schedule/Schedule';
import ConnectedAccounts from './components/ConnectedAccounts/ConnectedAccounts';
import Sidebar from './components/Layout/Sidebar';
import TopBar from './components/Layout/TopBar';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 w-full max-w-md">
        {isLogin ? (
          <Login onToggleMode={() => setIsLogin(false)} />
        ) : (
          <Register onToggleMode={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
};

const MainApp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';
  const [activeTab, setActiveTab] = useState(initialTab);
  const { currentUser } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'create':
        return <CreatePost />;
      case 'schedule':
        return <Schedule />;
      case 'accounts':
        return <ConnectedAccounts />;
      case 'analytics':
        return <div className="p-6 text-white">Analytics component coming soon...</div>;
      case 'settings':
        return <div className="p-6 text-white">Settings component coming soon...</div>;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <TopBar setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/auth/facebook" element={<AuthCallback />} />
          <Route path="/auth/twitter" element={<AuthCallback />} />
          <Route path="/auth/instagram" element={<AuthCallback />} />
          <Route path="/auth/linkedin" element={<AuthCallback />} />
          <Route path="/*" element={<MainApp />} />
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;