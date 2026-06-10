import React, { useState, useEffect } from 'react';
import { apiKeyService } from '../services/api';
import { Key, Copy, Check, Shield, Server, RefreshCw } from 'lucide-react';

const KeyGeneration = ({ onSelectKey }) => {
  const [name, setName] = useState('');
  const [keys, setKeys] = useState([]);
  const [generatedKey, setGeneratedKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  const fetchKeys = async () => {
    setFetching(true);
    try {
      const res = await apiKeyService.getKeys();
      if (res.success) {
        setKeys(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch keys', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a name for the API Key.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await apiKeyService.generateKey(name);
      if (res.success) {
        setGeneratedKey(res.data.apiKey);
        setName('');
        // Add new key to history
        setKeys((prevKeys) => [res.data, ...prevKeys]);
        // Store generated key in localStorage for convenience
        localStorage.setItem('last_api_key', res.data.apiKey);
        if (onSelectKey) {
          onSelectKey(res.data.apiKey);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (keyText) => {
    navigator.clipboard.writeText(keyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fadeIn">
      {/* Hero section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          Secure API Key Management
        </h1>
        <p className="text-slate-400 max-w-xl mx-auto text-base">
          Generate production-ready cryptographically secure API keys and experiment with MongoDB-backed TTL rate limiting.
        </p>
      </div>

      {/* Main Generator Form */}
      <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Generate a New Key</h2>
            <p className="text-xs text-slate-500">Provide an identifier to label your API credential.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="key-name" className="text-sm font-medium text-slate-300">
              API Key Name
            </label>
            <input
              id="key-name"
              type="text"
              placeholder="e.g. Production Application, Testing Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full glass-input"
              maxLength={40}
              required
            />
            {error && <p className="text-sm text-rose-500 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glow-btn bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Generate API Key</span>
              </>
            )}
          </button>
        </form>

        {/* Generated Key Result */}
        {generatedKey && (
          <div className="mt-8 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl animate-scaleUp">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Key Generated Successfully
              </span>
              <span className="text-xs text-slate-500">Copy this key now; you won't be able to see it again.</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 font-mono text-sm bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-slate-200 select-all overflow-x-auto whitespace-nowrap">
                {generatedKey}
              </div>
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Keys History Table */}
      <div className="glass-panel rounded-2xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-slate-400 rounded-lg">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Active Credentials</h2>
              <p className="text-xs text-slate-500">History of keys generated for testing.</p>
            </div>
          </div>
          <button
            onClick={fetchKeys}
            disabled={fetching}
            className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/50 rounded-lg transition-colors cursor-pointer"
            title="Refresh Key list"
          >
            <RefreshCw className={`w-5 h-5 ${fetching ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {keys.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Key className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No API keys generated yet.</p>
            <p className="text-xs text-slate-500 mt-1">Generate a key above to start testing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-4">Name</th>
                  <th className="py-4 px-4">API Key Preview</th>
                  <th className="py-4 px-4">Created At</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-sm">
                {keys.map((key) => (
                  <tr key={key._id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-4 px-4 font-semibold text-slate-200">{key.name}</td>
                    <td className="py-4 px-4 font-mono text-slate-400 text-xs">
                      {key.apiKey.substring(0, 15)}...{key.apiKey.substring(key.apiKey.length - 8)}
                    </td>
                    <td className="py-4 px-4 text-slate-500">
                      {new Date(key.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => copyToClipboard(key.apiKey)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 rounded transition-all cursor-pointer"
                          title="Copy Full Key"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            localStorage.setItem('last_api_key', key.apiKey);
                            if (onSelectKey) onSelectKey(key.apiKey);
                            // Highlight or notify the user
                          }}
                          className="px-2.5 py-1 text-xs font-medium text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-600 rounded transition-all cursor-pointer"
                        >
                          Use Key
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeyGeneration;
