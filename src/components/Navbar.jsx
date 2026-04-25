import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Wallet, ChevronDown, LogOut, RefreshCw, Copy, Check,
  ExternalLink, Search, Radio,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnectModal from './WalletConnectModal';

function shortAddress(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function isValidSolanaAddress(addr) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test((addr || '').trim());
}

export default function Navbar({ onRefresh, loading, refreshing }) {
  const { connectedWallet, disconnect, connectAddress } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [copied, setCopied] = useState(false);

  const address = connectedWallet?.address;
  const isRefreshing = loading || refreshing;

  const copyAddress = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const addr = searchInput.trim();
    setSearchError('');
    if (!addr) { setSearchError('Enter a Solana address.'); return; }
    if (!isValidSolanaAddress(addr)) { setSearchError('Invalid address format.'); return; }
    connectAddress(addr);
    setSearchInput('');
    setSearchOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-40 border-b border-sol-border bg-sol-bg/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-sol flex items-center justify-center shadow-lg shadow-sol-accent/25">
              <Zap size={15} className="text-sol-bg" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-sol-accent tracking-tight">SolScope</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Refresh */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="w-9 h-9 rounded-lg border border-sol-border bg-sol-card flex items-center justify-center text-sol-subtext hover:text-sol-text hover:border-sol-accent/30 transition-all disabled:opacity-50"
                title="Refresh portfolio"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              </button>
            )}

            {/* Track wallet dropdown */}
            <div className="relative">
              <button
                onClick={() => { setSearchOpen(v => !v); setSearchError(''); }}
                className={`w-9 h-9 rounded-lg border border-sol-border bg-sol-card flex items-center justify-center transition-all ${searchOpen ? 'border-sol-accent/50 text-sol-accent' : 'text-sol-subtext hover:text-sol-accent hover:border-sol-accent/30'}`}
                title="Track a wallet"
              >
                <Search size={14} />
              </button>

              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    onSubmit={handleSearchSubmit}
                    initial={{ opacity: 0, scale: 0.95, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 4 }}
                    transition={{ duration: 0.13 }}
                    className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-sol-card border border-sol-border shadow-2xl p-3 z-50"
                  >
                    <p className="text-xs font-medium text-sol-text mb-1">Track any wallet</p>
                    <p className="text-xs text-sol-subtext mb-2.5">Paste a Solana public key to view its portfolio</p>
                    <input
                      autoFocus
                      type="text"
                      value={searchInput}
                      onChange={e => { setSearchInput(e.target.value); setSearchError(''); }}
                      placeholder="e.g. GThUX1At…"
                      className="w-full px-3 py-2.5 rounded-lg bg-sol-surface border border-sol-border text-sol-text text-xs font-mono placeholder-sol-muted focus:outline-none focus:border-sol-accent/60 mb-2"
                    />
                    {searchError && (
                      <p className="text-xs text-sol-red mb-2">{searchError}</p>
                    )}
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-lg bg-gradient-sol text-sol-bg text-xs font-bold hover:opacity-90 transition-opacity"
                    >
                      View Portfolio
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Wallet pill or connect button */}
            {address ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sol-card border border-sol-border hover:border-sol-accent/40 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-sol-accent/15 flex items-center justify-center flex-shrink-0">
                    {connectedWallet?.type === 'demo'
                      ? <Radio size={10} className="text-sol-accent" />
                      : <Wallet size={10} className="text-sol-accent" />}
                  </div>
                  <span className="text-xs font-mono text-sol-text hidden sm:block">{shortAddress(address)}</span>
                  {connectedWallet?.type === 'demo' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-sol-accent/15 text-sol-accent font-semibold leading-none">DEMO</span>
                  )}
                  <ChevronDown size={12} className={`text-sol-muted transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.13 }}
                      className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-sol-card border border-sol-border shadow-2xl overflow-hidden z-50"
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-sol-border">
                        <div className="text-xs text-sol-muted mb-1.5">
                          {connectedWallet?.type === 'demo' ? 'Demo wallet' :
                           connectedWallet?.type === 'address' ? 'Read-only address' :
                           connectedWallet?.type === 'phantom' ? 'Phantom wallet' :
                           connectedWallet?.type === 'solflare' ? 'Solflare wallet' :
                           'Connected'}
                        </div>
                        <div className="text-xs font-mono text-sol-text break-all leading-relaxed">{address}</div>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={copyAddress}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sol-text hover:bg-sol-surface transition-colors"
                        >
                          {copied ? <Check size={13} className="text-sol-green" /> : <Copy size={13} className="text-sol-subtext" />}
                          {copied ? 'Copied!' : 'Copy address'}
                        </button>
                        <a
                          href={`https://solscan.io/account/${address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sol-text hover:bg-sol-surface transition-colors"
                          onClick={() => setMenuOpen(false)}
                        >
                          <ExternalLink size={13} className="text-sol-subtext" />
                          View on Solscan
                        </a>
                        <button
                          onClick={() => { disconnect(); setMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-sol-red hover:bg-sol-surface transition-colors"
                        >
                          <LogOut size={13} />
                          Disconnect
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setWalletModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-sol-border bg-sol-card text-sm font-medium text-sol-subtext hover:text-sol-text hover:border-sol-accent/30 transition-all"
              >
                <Wallet size={13} />
                <span className="hidden sm:block">Connect</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <WalletConnectModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </>
  );
}
