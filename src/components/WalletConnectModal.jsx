import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Wallet, Search, AlertCircle, Loader, ChevronRight,
  Zap, BarChart2, Link,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { DEMO_WALLETS } from '../data/mockData';

// Phantom SVG icon
function PhantomIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width={size} height={size}>
      <rect width="128" height="128" rx="26" fill="#AB9FF2" />
      <path
        d="M110.5 64.5c0 25.4-20.7 46-46.5 46S17.5 89.9 17.5 64.5 38.2 18.5 64 18.5s46.5 20.7 46.5 46Z"
        fill="white"
      />
      <ellipse cx="52" cy="62" rx="7" ry="8" fill="#1a1a2e" />
      <ellipse cx="76" cy="62" rx="7" ry="8" fill="#1a1a2e" />
      <path d="M44 78c5 6 35 6 40 0" stroke="#1a1a2e" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Solflare SVG icon
function SolflareIcon({ size = 24 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width={size} height={size}>
      <rect width="128" height="128" rx="26" fill="#FC7227" />
      <path d="M64 20 L108 108 H20 Z" fill="white" opacity="0.9" />
      <path d="M64 40 L95 100 H33 Z" fill="#FC7227" />
      <circle cx="64" cy="75" r="10" fill="white" />
    </svg>
  );
}

const TABS = [
  { id: 'wallets', label: 'Wallets', icon: Wallet },
  { id: 'address', label: 'Address', icon: Link },
  { id: 'demo', label: 'Demo', icon: BarChart2 },
];

export default function WalletConnectModal({ open, onClose }) {
  const {
    connectPhantom, connectSolflare, connectAddress,
    connectDemo, connectionError, setConnectionError, connecting,
  } = useWallet();
  const [tab, setTab] = useState('wallets');
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [loadingWallet, setLoadingWallet] = useState(null);

  const handleClose = () => {
    setInputError('');
    setConnectionError(null);
    setAddressInput('');
    setLoadingWallet(null);
    onClose();
  };

  const handlePhantom = async () => {
    setLoadingWallet('phantom');
    try {
      await connectPhantom();
      handleClose();
    } catch { /* error in context */ } finally {
      setLoadingWallet(null);
    }
  };

  const handleSolflare = async () => {
    setLoadingWallet('solflare');
    try {
      await connectSolflare();
      handleClose();
    } catch { /* error in context */ } finally {
      setLoadingWallet(null);
    }
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setInputError('');
    try {
      connectAddress(addressInput);
      handleClose();
    } catch (err) {
      setInputError(err.message);
    }
  };

  const handleDemo = (wallet) => {
    connectDemo(wallet);
    handleClose();
  };

  const activeError = connectionError || inputError;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className="relative w-full max-w-sm bg-sol-surface border border-sol-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-sol-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-sol flex items-center justify-center">
                    <Zap size={15} className="text-sol-bg" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-sol-text leading-tight">Connect to SolScope</h2>
                    <p className="text-xs text-sol-muted">View your Solana portfolio</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg text-sol-muted hover:text-sol-text hover:bg-sol-card transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-sol-card rounded-xl p-1">
                {TABS.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => { setTab(t.id); setInputError(''); setConnectionError(null); }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                        tab === t.id
                          ? 'bg-sol-surface text-sol-text shadow-sm'
                          : 'text-sol-muted hover:text-sol-text'
                      }`}
                    >
                      <Icon size={11} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Body */}
            <div className="p-5">
              {activeError && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-sol-red/10 border border-sol-red/25 mb-4 text-xs text-sol-red">
                  <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                  {activeError}
                </div>
              )}

              <AnimatePresence mode="wait">
                {tab === 'wallets' && (
                  <motion.div
                    key="wallets"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="space-y-2.5"
                  >
                    <p className="text-xs text-sol-subtext mb-3">Connect your browser wallet to view your on-chain portfolio.</p>
                    <WalletButton
                      name="Phantom"
                      description="Most popular Solana wallet"
                      icon={<PhantomIcon size={22} />}
                      loading={loadingWallet === 'phantom'}
                      onClick={handlePhantom}
                      disabled={connecting}
                    />
                    <WalletButton
                      name="Solflare"
                      description="Feature-rich Solana wallet"
                      icon={<SolflareIcon size={22} />}
                      loading={loadingWallet === 'solflare'}
                      onClick={handleSolflare}
                      disabled={connecting}
                    />
                    <p className="text-xs text-sol-muted text-center pt-1">
                      No wallet?{' '}
                      <button onClick={() => setTab('address')} className="text-sol-accent hover:underline">Paste an address</button>
                      {' '}or{' '}
                      <button onClick={() => setTab('demo')} className="text-sol-accent hover:underline">try a demo</button>.
                    </p>
                  </motion.div>
                )}

                {tab === 'address' && (
                  <motion.div
                    key="address"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                  >
                    <p className="text-xs text-sol-subtext mb-3">Paste any Solana address to view it in read-only mode.</p>
                    <form onSubmit={handleAddressSubmit} className="space-y-3">
                      <div className="relative">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-sol-muted" />
                        <input
                          type="text"
                          value={addressInput}
                          onChange={e => { setAddressInput(e.target.value); setInputError(''); }}
                          placeholder="e.g. GThUX1Atug7EEg2…"
                          className="w-full pl-9 pr-3 py-3 text-xs bg-sol-card border border-sol-border rounded-xl text-sol-text placeholder-sol-muted focus:outline-none focus:border-sol-accent/60 font-mono"
                          autoComplete="off"
                          spellCheck={false}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!addressInput.trim()}
                        className="w-full py-3 rounded-xl bg-gradient-sol text-sol-bg font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Search size={14} />
                        View Portfolio
                      </button>
                    </form>
                  </motion.div>
                )}

                {tab === 'demo' && (
                  <motion.div
                    key="demo"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="space-y-2.5"
                  >
                    <p className="text-xs text-sol-subtext mb-3">Explore SolScope with a pre-loaded example wallet.</p>
                    {DEMO_WALLETS.map(wallet => (
                      <button
                        key={wallet.id}
                        onClick={() => handleDemo(wallet)}
                        className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-sol-card border border-sol-border hover:border-sol-accent/40 transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-sol-accent/10 border border-sol-accent/20 flex items-center justify-center flex-shrink-0">
                          <BarChart2 size={15} className="text-sol-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-sol-text">{wallet.label}</div>
                          <div className="text-xs text-sol-subtext">{wallet.description}</div>
                          <div className="text-xs text-sol-accent font-mono mt-0.5">
                            ${wallet.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })} est. value
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-sol-muted group-hover:text-sol-text transition-colors flex-shrink-0" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function WalletButton({ name, description, icon, loading, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full flex items-center gap-3.5 p-3.5 rounded-xl bg-sol-card border border-sol-border hover:border-sol-accent/40 transition-all disabled:opacity-60 disabled:cursor-not-allowed group"
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {loading ? (
          <Loader size={18} className="animate-spin text-sol-subtext" />
        ) : (
          icon
        )}
      </div>
      <div className="flex-1 text-left">
        <div className="text-sm font-semibold text-sol-text">{name}</div>
        <div className="text-xs text-sol-subtext">{description}</div>
      </div>
      <ChevronRight size={14} className="text-sol-muted group-hover:text-sol-text transition-colors" />
    </button>
  );
}
