import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [connectedWallet, setConnectedWallet] = useState(null); // { address, type: 'phantom'|'solflare'|'pasted'|'demo' }
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('solscope_wallet');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.address) {
          setConnectedWallet(parsed);
        }
      }
    } catch (_) {}
  }, []);

  const connectPhantom = useCallback(async () => {
    setConnecting(true);
    setConnectionError(null);
    try {
      const phantom = window?.phantom?.solana ?? window?.solana;
      if (!phantom || !phantom.isPhantom) {
        throw new Error('Phantom wallet not detected. Please install Phantom extension.');
      }
      const resp = await phantom.connect();
      const address = resp.publicKey.toString();
      const wallet = { address, type: 'phantom' };
      setConnectedWallet(wallet);
      localStorage.setItem('solscope_wallet', JSON.stringify(wallet));
      return address;
    } catch (err) {
      const msg = err.message || 'Failed to connect Phantom wallet';
      setConnectionError(msg);
      throw new Error(msg);
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectSolflare = useCallback(async () => {
    setConnecting(true);
    setConnectionError(null);
    try {
      const solflare = window?.solflare;
      if (!solflare || !solflare.isSolflare) {
        throw new Error('Solflare wallet not detected. Please install Solflare extension.');
      }
      await solflare.connect();
      const address = solflare.publicKey.toString();
      const wallet = { address, type: 'solflare' };
      setConnectedWallet(wallet);
      localStorage.setItem('solscope_wallet', JSON.stringify(wallet));
      return address;
    } catch (err) {
      const msg = err.message || 'Failed to connect Solflare wallet';
      setConnectionError(msg);
      throw new Error(msg);
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectAddress = useCallback((address) => {
    const trimmed = address.trim();
    if (!isValidSolanaAddress(trimmed)) {
      const msg = 'Invalid Solana address. Must be 32–44 base58 characters.';
      setConnectionError(msg);
      throw new Error(msg);
    }
    const wallet = { address: trimmed, type: 'pasted' };
    setConnectedWallet(wallet);
    setConnectionError(null);
    localStorage.setItem('solscope_wallet', JSON.stringify(wallet));
    return trimmed;
  }, []);

  const connectDemo = useCallback((demoWallet) => {
    const wallet = { address: demoWallet.address, type: 'demo', label: demoWallet.label, tag: demoWallet.tag };
    setConnectedWallet(wallet);
    setConnectionError(null);
    localStorage.setItem('solscope_wallet', JSON.stringify(wallet));
  }, []);

  const disconnect = useCallback(() => {
    setConnectedWallet(null);
    setConnectionError(null);
    localStorage.removeItem('solscope_wallet');
    try {
      const phantom = window?.phantom?.solana ?? window?.solana;
      if (phantom?.disconnect) phantom.disconnect();
      const solflare = window?.solflare;
      if (solflare?.disconnect) solflare.disconnect();
    } catch (_) {}
  }, []);

  return (
    <WalletContext.Provider value={{
      connectedWallet,
      connecting,
      connectionError,
      setConnectionError,
      connectPhantom,
      connectSolflare,
      connectAddress,
      connectDemo,
      disconnect,
      isConnected: !!connectedWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside WalletProvider');
  return ctx;
}

function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') return false;
  if (address.length < 32 || address.length > 44) return false;
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}
