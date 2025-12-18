'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';
import Dialog from '../Dialog/Dialog';
import Image from 'next/image';
import RotateHourGlass from 'src/animation/RotateHourGlass';
import { Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import { Adapter } from '@solana/wallet-adapter-base';

export default function SolanaConnectButton() {
  const { wallets, select, wallet, connect, connecting, disconnect } = useWallet();
  const [showWallets, setShowWallets] = useState(false);

  const handleSelectWallet = async (adapter: Adapter) => {
    try {
      if (wallet) {
        await disconnect();
        await wallet.adapter.disconnect();
      }

      // Select the adapter and close the dialog
      select(adapter.name);
      setShowWallets(false);

      // Try to connect immediately and notify the user
      try {
        await connect();
        toast.success('Wallet connected');
      } catch (connectError) {
        console.error('Failed to connect wallet:', connectError);
      }
    } catch (error) {
      console.error(error);
      const message = (error as { message?: string })?.message || 'Failed to select wallet';
      toast.error(message);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowWallets(true)}
        disabled={connecting}
        className="bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] text-white dark:text-black font-semibold rounded-[50%] shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed p-2"
      >
        {connecting ? <RotateHourGlass /> : <Wallet />}
      </button>

      <Dialog isOpen={showWallets} onClose={() => setShowWallets(false)} title="Connect Wallet">
        <div className="flex flex-col gap-4">
          {wallets.map(w => (
            <button
              key={w.adapter.name}
              onClick={() => handleSelectWallet(w.adapter)}
              className="flex items-center gap-3 px-6 py-4 bg-linear-to-r from-[#1c54ff] to-[#001a61] dark:from-[#e4e9ff] dark:to-[#4c5061] hover:from-[#163fbf] hover:to-[#001244] dark:hover:from-[#d4d9e9] dark:hover:to-[#3c4051] text-white dark:text-black font-semibold rounded-lg shadow-lg transition-all duration-200"
            >
              {w.adapter.icon && (
                <Image
                  src={w.adapter.icon}
                  alt={`${w.adapter.name} icon`}
                  width={32}
                  height={32}
                  className="rounded-lg shrink-0"
                />
              )}
              <span className="text-left">{w.adapter.name}</span>
            </button>
          ))}
        </div>
      </Dialog>
    </>
  );
}
