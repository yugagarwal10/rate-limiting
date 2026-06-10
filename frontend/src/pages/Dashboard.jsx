import React, { useState, useEffect, useRef } from 'react';
import { apiKeyService, dashboardService } from '../services/api';
import { Activity, Clock, Key, Globe, RefreshCw } from 'lucide-react';

const Dashboard = ({ defaultApiKey }) => {
  const [keys, setKeys] = useState([]);
  const [selectedApiKey, setSelectedApiKey] = useState(defaultApiKey || '');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(true);
  const timerRef = useRef(null);

  // Fetch all keys for selection dropdown
  const loadKeys = async () => {
    try {
      const res = await apiKeyService.getKeys();
      if (res.success) {
        setKeys(res.data);
        
        // If no selected key yet, try to use cache or first key in list
        const cachedKey = localStorage.getItem('last_api_key');
        if (!selectedApiKey) {
          if (cachedKey && res.data.some(k => k.apiKey === cachedKey)) {
            setSelectedApiKey(cachedKey);
          } else if (res.data.length > 0) {
            setSelectedApiKey(res.data[0].apiKey);
            localStorage.setItem('last_api_key', res.data[0].apiKey);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load keys', err);
    }
  };

  // Fetch dashboard statistics for selected API Key
  const loadStats = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const res = await dashboardService.getStats(selectedApiKey);
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, []);

  // Sync default API key if changed by parent
  useEffect(() => {
    if (defaultApiKey) {
      setSelectedApiKey(defaultApiKey);
    }
  }, [defaultApiKey]);

  // Load stats when key changes
  useEffect(() => {
    loadStats(true);
  }, [selectedApiKey]);

  // Auto-polling effect (every 3 seconds)
  useEffect(() => {
    if (autoPoll) {
      timerRef.current = setInterval(() => {
        loadStats(false);
      }, 3000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoPoll, selectedApiKey]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 font-display">System Dashboard</h1>
            <p className="text-slate-400 text-xs mt-0.5">Real-time visualization of TTL indexes and IP quotas in MongoDB.</p>
          </div>
        </div>

        {/* Dropdown Select Key & Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex-1 md:flex-none flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-400 whitespace-nowrap">ACTIVE KEY:</label>
            <select
              value={selectedApiKey}
              onChange={(e) => {
                setSelectedApiKey(e.target.value);
                localStorage.setItem('last_api_key', e.target.value);
              }}
              className="glass-input text-xs pr-8 py-2 w-full md:w-64"
            >
              <option value="">-- Select API Key --</option>
              {keys.map((k) => (
                <option key={k._id} value={k.apiKey}>
                  {k.name} ({k.apiKey.substring(0, 12)}...)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800 rounded-lg px-3 py-1.5 shrink-0">
            <input
              id="auto-poll-checkbox"
              type="checkbox"
              checked={autoPoll}
              onChange={(e) => setAutoPoll(e.target.checked)}
              className="accent-indigo-500 rounded text-indigo-500 h-4 w-4 bg-slate-950 border-slate-800"
            />
            <label htmlFor="auto-poll-checkbox" className="text-xs text-slate-400 select-none cursor-pointer">
              Auto-poll (3s)
            </label>
          </div>

          <button
            onClick={() => loadStats(true)}
            disabled={loading}
            className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
            title="Force refresh stats"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* IP Quota Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[185px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">IP Rate Limit (3 Mins)</span>
                <h3 className="text-lg font-bold font-mono text-slate-200 select-all">
                  {stats.ipStats.ip}
                </h3>
              </div>
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <Globe className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline">
                <div className="text-3xl font-extrabold font-mono text-slate-100">
                  {stats.ipStats.remaining}
                  <span className="text-sm font-normal text-slate-500 font-sans ml-1">left</span>
                </div>
                <span className="text-xs text-slate-400">Limit: 10 reqs / 3 mins</span>
              </div>

              <div className="space-y-1">
                <div className="w-full bg-slate-850 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-300 rounded-full ${
                      stats.ipStats.remaining <= 2 ? 'bg-rose-500' : stats.ipStats.remaining <= 5 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${(stats.ipStats.remaining / 10) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>{stats.ipStats.used} requests used</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    Resets in: {stats.ipStats.resetTimer}s
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key & System Metadata Card */}
          <div className="glass-panel rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[185px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">Key Context</span>
                <h3 className="text-lg font-bold text-slate-200">
                  {stats.apiKey ? stats.apiKey.name : 'No Active Key Selected'}
                </h3>
              </div>
              <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                <Key className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3.5">
              <div className="text-xs text-slate-400 space-y-2">
                <div className="flex justify-between">
                  <span>MongoDB TTL index status:</span>
                  <span className="text-indigo-400 font-semibold">Enabled (180s)</span>
                </div>
                <div className="flex justify-between">
                  <span>Active IP tracking:</span>
                  <span className="text-slate-200 font-mono font-semibold">Enabled</span>
                </div>
                <div className="flex justify-between">
                  <span>API Gateway Status:</span>
                  <span className="flex items-center gap-1 text-emerald-500 font-semibold uppercase text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>TTL Target:</span>
                <span className="text-slate-400">ip_rate_limits (createdAt)</span>
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-24">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
          <p className="text-slate-500 text-xs">Aggregating dashboard analytics from MongoDB...</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
