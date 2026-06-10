import React, { useState, useEffect } from 'react';
import KeyGeneration from './pages/KeyGeneration';
import Playground from './pages/Playground';
import Dashboard from './pages/Dashboard';
import { Key, Terminal, Activity, Zap, Server, Shield } from 'lucide-react';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [selectedApiKey, setSelectedApiKey] = useState('');

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    
    // Load last used key from local storage
    const cachedKey = localStorage.getItem('last_api_key');
    if (cachedKey) {
      setSelectedApiKey(cachedKey);
    }

    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Callback to propagate generated key across pages
  const handleKeySelected = (key) => {
    setSelectedApiKey(key);
  };

  const renderPage = () => {
    switch (currentPath) {
      case '/':
        return <KeyGeneration onSelectKey={handleKeySelected} />;
      case '/playground':
        return <Playground defaultApiKey={selectedApiKey} />;
      case '/dashboard':
        return <Dashboard defaultApiKey={selectedApiKey} />;
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-300">Page Not Found</h2>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded text-sm text-white transition-colors"
            >
              Back to Home
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-900 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg text-white group-hover:scale-105 transition-transform duration-200 shadow-lg shadow-indigo-500/10">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Limitless<span className="text-indigo-400 font-medium">API</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => navigate('/')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                currentPath === '/' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              Credentials
            </button>
            
            <button
              onClick={() => navigate('/playground')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                currentPath === '/playground' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Playground
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer ${
                currentPath === '/dashboard' 
                  ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Dashboard
            </button>
          </nav>

          {/* Gateway Status Badge */}
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/10 px-3 py-1 rounded-full text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Gateway Online
            </div>
            
            <div className="sm:hidden flex items-center gap-1.5">
              {/* Simple Mobile Nav Toggle Icons */}
              <button 
                onClick={() => navigate('/')} 
                className={`p-2 rounded-lg ${currentPath === '/' ? 'text-indigo-400' : 'text-slate-400'}`}
                title="Credentials"
              >
                <Key className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/playground')} 
                className={`p-2 rounded-lg ${currentPath === '/playground' ? 'text-indigo-400' : 'text-slate-400'}`}
                title="Playground"
              >
                <Terminal className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/dashboard')} 
                className={`p-2 rounded-lg ${currentPath === '/dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}
                title="Dashboard"
              >
                <Activity className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderPage()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>&copy; 2026 LimitlessAPI Rate Limiting System. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Server className="w-3.5 h-3.5" /> MongoDB TTL Driven</span>
            <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Layer-7 Protection</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
