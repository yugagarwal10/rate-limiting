import React, { useState, useEffect } from 'react';
import { publicApiService } from '../services/api';
import { Play, AlertCircle, CheckCircle, HelpCircle, Layers, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

const Playground = ({ defaultApiKey }) => {
  const [apiKey, setApiKey] = useState(defaultApiKey || '');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusText, setStatusText] = useState('');
  const [limits, setLimits] = useState({
    ipLimit: 10,
    ipRemaining: 10,
    ipReset: null,
  });

  useEffect(() => {
    const cachedKey = localStorage.getItem('last_api_key');
    if (!apiKey && cachedKey) {
      setApiKey(cachedKey);
    }
  }, []);

  useEffect(() => {
    if (defaultApiKey) {
      setApiKey(defaultApiKey);
    }
  }, [defaultApiKey]);

  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setHeaders(null);
    setStatus(null);
    
    try {
      const res = await publicApiService.callPublicApi(apiKey);
      
      // Axios successful response
      setStatus(res.status);
      setStatusText(res.statusText || 'OK');
      setResponse(res.data);
      
      // Capture headers
      const ipLimit = res.headers['x-ratelimit-limit-ip'];
      const ipRemaining = res.headers['x-ratelimit-remaining-ip'];
      const ipReset = res.headers['x-ratelimit-reset-ip'];

      setLimits({
        ipLimit: ipLimit ? parseInt(ipLimit) : 10,
        ipRemaining: ipRemaining ? parseInt(ipRemaining) : 0,
        ipReset: ipReset ? parseInt(ipReset) : null,
      });

      // Update response headers
      setHeaders(res.headers);
    } catch (err) {
      // Axios error handling (4xx or 5xx)
      const errorResponse = err.response;
      if (errorResponse) {
        setStatus(errorResponse.status);
        setStatusText(errorResponse.statusText || 'Error');
        setResponse(errorResponse.data);
        setHeaders(errorResponse.headers);

        const ipLimit = errorResponse.headers['x-ratelimit-limit-ip'];
        const ipRemaining = errorResponse.headers['x-ratelimit-remaining-ip'];
        const ipReset = errorResponse.headers['x-ratelimit-reset-ip'];

        setLimits({
          ipLimit: ipLimit ? parseInt(ipLimit) : 10,
          ipRemaining: ipRemaining ? parseInt(ipRemaining) : 0,
          ipReset: ipReset ? parseInt(ipReset) : null,
        });
      } else {
        // Network errors
        setStatus(500);
        setStatusText('Network Error');
        setResponse({ success: false, message: 'Could not connect to the backend server. Ensure MongoDB and Node are running.' });
      }
    } finally {
      const cachedKey = localStorage.getItem('last_api_key');
      if (apiKey && apiKey !== cachedKey) {
        localStorage.setItem('last_api_key', apiKey);
      }
      setLoading(false);
    }
  };

  const getStatusColor = (code) => {
    if (!code) return 'text-slate-400 border-slate-800 bg-slate-900/30';
    if (code >= 200 && code < 300) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (code === 401) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    if (code === 429) return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
    return 'text-rose-500 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
          <Terminal className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">API Playground</h1>
          <p className="text-slate-400 text-xs mt-0.5">Test the API Key validation and observe the IP-based rate limiter (10 requests per 3 minutes).</p>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side - Input Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Request Config
            </h2>

            {/* HTTP Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">ENDPOINT</label>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                    POST
                  </span>
                  <input
                    type="text"
                    value="http://localhost:5000/api/public"
                    className="flex-1 font-mono text-xs bg-slate-950/50 border border-slate-800 rounded-md px-3 py-2 text-slate-400 select-all outline-none"
                    disabled
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2">X-API-KEY HEADER</label>
                <input
                  type="text"
                  placeholder="Paste your sk_live_... key here"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full glass-input font-mono text-xs"
                />
              </div>

              <button
                onClick={handleSendRequest}
                disabled={loading}
                className="w-full glow-btn bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Executing...' : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rate Limit Indicator */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Rate Limit Status
            </h2>

            {/* IP Box */}
            <div className="p-5 bg-slate-900/30 border border-slate-800/80 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">IP-Based Quota (3 Mins)</span>
                <span className="text-xs font-semibold text-indigo-400">Limit: 10 reqs</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold font-mono text-slate-100">{limits.ipRemaining}</span>
                <span className="text-xs text-slate-500">/ {limits.ipLimit} remaining</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full transition-all duration-300 ${
                    limits.ipRemaining <= 2 
                      ? 'bg-rose-500' 
                      : limits.ipRemaining <= 5 
                      ? 'bg-amber-500' 
                      : 'bg-indigo-500'
                  }`}
                  style={{ width: `${(limits.ipRemaining / limits.ipLimit) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Response Panel */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-2xl p-6 min-h-[460px] flex flex-col space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Response Console
              </h2>
              
              {status && (
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full font-mono flex items-center gap-1.5 ${getStatusColor(status)}`}>
                    {status === 200 ? <CheckCircle className="w-3.5 h-3.5" /> : status === 401 || status === 429 ? <ShieldAlert className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    {status} {statusText}
                  </span>
                </div>
              )}
            </div>

            {/* Body console */}
            <div className="flex-1 flex flex-col min-h-0">
              {response === null && !loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-slate-800 rounded-xl">
                  <HelpCircle className="w-12 h-12 text-slate-700 mb-3" />
                  <p className="text-slate-400 font-medium">No request executed yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Configure your API Key and click "Send Request" to invoke the API.</p>
                </div>
              ) : loading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                  <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
                  <p className="text-xs text-slate-500">Waiting for API gateway response...</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  
                  {/* Response headers preview */}
                  {headers && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Rate Limiting Response Headers</span>
                      <div className="grid grid-cols-3 gap-2 font-mono text-[10px] bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500">X-RateLimit-Limit-Ip:</span> <span className="text-emerald-400">{headers['x-ratelimit-limit-ip'] || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">X-RateLimit-Remaining-Ip:</span> <span className="text-emerald-400">{headers['x-ratelimit-remaining-ip'] || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">X-RateLimit-Reset-Ip:</span> <span className="text-emerald-400">{headers['x-ratelimit-reset-ip'] || 'N/A'}s</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* JSON Response Body */}
                  <div className="flex-1 min-h-[220px] bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-y-auto relative">
                    <span className="absolute right-3 top-3 text-[10px] bg-slate-900 border border-slate-800 text-slate-500 px-2 py-1 rounded">JSON</span>
                    <pre className="text-xs font-mono text-indigo-300 leading-relaxed whitespace-pre-wrap">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Playground;
