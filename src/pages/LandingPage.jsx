import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, BarChart2, Shield, Wallet, PieChart, History,
  ChevronRight, Search, AlertCircle, ArrowRight, Loader,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import WalletConnectModal from '../components/WalletConnectModal';
import { DEMO_WALLETS } from '../data/mockData';

const FEATURES = [
  { icon: BarChart2, title: 'Live Portfolio Tracking', desc: 'Real-time SOL price via CoinGecko with historical performance charts.', color: '#00DC82' },
  { icon: PieChart, title: 'Allocation Breakdown', desc: 'Visual breakdown of SOL, SPL tokens, and other assets.', color: '#9945FF' },
  { icon: History, title: 'Transaction History', desc: 'Browse and filter your recent on-chain activity with Solscan links.', color: '#F0C040' },
  { icon: Shield, title: 'Read-Only Mode', desc: 'Watch any wallet by address — no signing or approvals needed.', color: '#EF4444' },
  { icon: Wallet, title: 'Multi-Wallet Support', desc: 'Phantom, Solflare, or paste any Solana address instantly.', color: '#45B7D1' },
  { icon: Zap, title: 'Real On-Chain Data', desc: 'Balances and tokens from Ankr RPC — no middleman needed.', color: '#F0C040' },
];

const STATS = [
  { value: 'Ankr RPC', label: 'Data source' },
  { value: '100%', label: 'Non-custodial' },
  { value: '$0', label: 'Always free' },
];

// Basic Solana address validation
function isValidSolanaAddress(addr) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

export default function LandingPage() {
  const { connectAddress, connectDemo, connectPhantom, connectSolflare } = useWallet();
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState('');
  const [inputError, setInputError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const handleAddressSubmit = (e) => {
    e?.preventDefault();
    const addr = addressInput.trim();
    setInputError('');
    if (!addr) { setInputError('Please enter a Solana wallet address.'); return; }
    if (!isValidSolanaAddress(addr)) {
      setInputError('Invalid Solana address. Should be 32–44 Base58 characters.');
      return;
    }
    try {
      setSubmitting(true);
      connectAddress(addr);
    } catch (err) {
      setInputError(err.message);
      setSubmitting(false);
    }
  };

  const handleDemo = (wallet) => {
    connectDemo(wallet);
  };

  return (
    <div className="min-h-screen bg-sol-bg text-sol-text">
      {/* Navbar */}
      <nav className="border-b border-sol-border bg-sol-bg/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-sol flex items-center justify-center shadow-lg shadow-sol-accent/20">
              <Zap size={16} className="text-sol-bg" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-sol-accent tracking-tight">SolScope</span>
          </div>
          <button
            onClick={() => setWalletModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sol-border bg-sol-card text-sm font-medium text-sol-subtext hover:text-sol-text hover:border-sol-accent/40 transition-all"
          >
            <Wallet size={14} />
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />
        <div className="absolute top-0 left-1/3 w-80 h-80 bg-sol-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-1/4 w-56 h-56 bg-sol-purple/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sol-card border border-sol-border text-xs text-sol-subtext mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-sol-accent animate-pulse" />
              Solana Mainnet · Live RPC data
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-5 tracking-tight">
              Your Solana wallet,{' '}
              <span className="text-sol-accent">instantly</span>
            </h1>
            <p className="text-base text-sol-subtext max-w-xl mx-auto mb-10 leading-relaxed">
              Paste any wallet address and see real balances, SPL tokens, prices, and
              transaction history in seconds. No login. No tracking. No nonsense.
            </p>

            {/* ── Address input — primary CTA ── */}
            <form onSubmit={handleAddressSubmit} className="flex flex-col gap-3 max-w-xl mx-auto mb-5">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-sol-subtext pointer-events-none"
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={addressInput}
                  onChange={e => { setAddressInput(e.target.value); setInputError(''); }}
                  placeholder="Paste any Solana wallet address…"
                  className="w-full pl-10 pr-4 py-4 rounded-xl bg-sol-card border border-sol-border text-sol-text placeholder-sol-muted text-sm font-mono focus:outline-none focus:border-sol-accent/60 focus:ring-1 focus:ring-sol-accent/20 transition-all"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>

              <AnimatePresence>
                {inputError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sol-red/10 border border-sol-red/30 text-sm text-sol-red"
                  >
                    <AlertCircle size={13} />
                    {inputError}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={submitting || !addressInput.trim()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-gradient-sol text-sol-bg font-bold text-sm shadow-lg shadow-sol-accent/20 hover:opacity-92 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><Loader size={15} className="animate-spin" /> Loading…</>
                  : <><ArrowRight size={15} /> View Portfolio</>}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 max-w-xl mx-auto mb-5">
              <div className="flex-1 h-px bg-sol-border" />
              <span className="text-xs text-sol-muted px-2">or try a demo</span>
              <div className="flex-1 h-px bg-sol-border" />
            </div>

            {/* Demo wallets row */}
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
              {DEMO_WALLETS.map(wallet => (
                <motion.button
                  key={wallet.id}
                  onClick={() => handleDemo(wallet)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-sol-card border border-sol-border hover:border-sol-accent/30 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-sol-accent/10 border border-sol-accent/20 flex items-center justify-center flex-shrink-0">
                    <BarChart2 size={14} className="text-sol-accent" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-sol-text truncate">{wallet.label}</div>
                    <div className="text-xs text-sol-accent font-mono">
                      ${wallet.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                  <ChevronRight size={13} className="text-sol-muted ml-auto flex-shrink-0" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-sol-border bg-sol-card/40">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-center gap-10 sm:gap-16">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-sm font-bold text-sol-accent font-mono">{s.value}</div>
              <div className="text-xs text-sol-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold text-sol-text">Everything you need, nothing you don't</h2>
          <p className="text-sol-subtext mt-2 text-sm">A complete Solana portfolio dashboard — open source, always free.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 * i }}
                className="rounded-xl bg-sol-card border border-sol-border p-5 hover:border-sol-accent/25 transition-all"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${f.color}18` }}
                >
                  <Icon size={17} style={{ color: f.color }} />
                </div>
                <h3 className="text-sm font-semibold text-sol-text mb-1.5">{f.title}</h3>
                <p className="text-xs text-sol-subtext leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sol-border py-7">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-sol flex items-center justify-center">
              <Zap size={11} className="text-sol-bg" strokeWidth={2.5} />
            </div>
            <span className="text-sm font-bold text-sol-accent">SolScope</span>
          </div>
          <p className="text-xs text-sol-muted">
            Read-only. No wallet signing. Your keys stay with you.
          </p>
        </div>
      </footer>

      <WalletConnectModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
    </div>
  );
}
