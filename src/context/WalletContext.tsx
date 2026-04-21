import React, { createContext, useContext } from 'react';
import { useWeb3, Web3State } from '@/hooks/useWeb3';

const WalletContext = createContext<Web3State | null>(null);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const web3 = useWeb3();
  return <WalletContext.Provider value={web3}>{children}</WalletContext.Provider>;
};

export const useWallet = (): Web3State => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used inside <WalletProvider>');
  return ctx;
};
