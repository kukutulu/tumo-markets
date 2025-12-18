'use client';

// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageTransition from 'src/components/PageTransition';
import { ArrowLeft, LogOut } from 'lucide-react';
import { axiosClient } from 'src/service/axios';
import { apiUrl } from 'src/service/api/apiUrl';
import { TMission, TUserMetadata } from 'src/types/global';
import { useUserValue } from 'src/states/user/hooks';
import SkeletonLine from 'src/components/Skeleton';
import TransactionHistory from 'src/views/profile/TransactionHistory';
import Missions from 'src/views/profile/Missions';
import { useState } from 'react';
import CustomTab from 'src/components/Tab/CustomTab';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState(0);

  // const { connected, publicKey, disconnect } = useWallet();
  // const { connection } = useConnection();
  // const router = useRouter();
  // const [balance, setBalance] = useState<number | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   if (!connected) {
  //     router.push('/');
  //   }
  // }, [connected, router]);

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     if (publicKey && connection) {
  //       try {
  //         const lamports = await connection.getBalance(publicKey);
  //         setBalance(lamports / LAMPORTS_PER_SOL);
  //       } catch (error) {
  //         console.error('Error fetching balance:', error);
  //         setBalance(0);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     }
  //   };

  //   fetchBalance();
  // }, [publicKey, connection]);

  // if (!connected || !publicKey) {
  //   return null;
  // }

  const { user_id } = useUserValue();

  const { data: userMetadata, isLoading: isLoadingUserMetadata } = useQuery({
    queryKey: ['userMetadata', user_id],
    queryFn: async () => {
      const response = await axiosClient.get<TUserMetadata>(apiUrl.getUserMetadata(user_id));
      return response.data;
    },
    enabled: !!user_id,
    staleTime: Infinity,
    refetchOnMount: true,
  });

  const { data: missions, isLoading: isLoadingMissions } = useQuery({
    queryKey: ['userMissions', user_id],
    queryFn: async () => {
      const response = await axiosClient.get<TMission>(apiUrl.getUserMissions(user_id, false));
      return response.data;
    },
    enabled: !!user_id,
    staleTime: 5 * 60 * 1000,
    retryOnMount: true,
  });

  const unclaimedMissions = missions
    ? Object.entries(missions)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, mission]) => !mission.is_claimed)
        .map(([id, mission]) => ({ id, ...mission }))
    : [];

  // Defensive/derived values to avoid "possible undefined" and divide-by-zero
  const currentExp = Number(userMetadata?.experience_points ?? 0);
  const requiredExp = Number(userMetadata?.level_up_required_experience ?? 0);
  const progressPercent = requiredExp > 0 ? Math.min(Math.max((currentExp / requiredExp) * 100, 0), 100) : 0;
  const userLevel = userMetadata?.user_level ?? 1;

  const handleDisconnect = async () => {
    // keep commented wallet disconnect logic for later use
    // try {
    //   await disconnect();
    //   // existing effect will redirect when `connected` becomes false
    // } catch (err) {
    //   console.error('Error disconnecting wallet:', err);
    // }

    // Mark the app as locked for demo purposes
    try {
      localStorage.setItem('appUnlocked', 'false');
      localStorage.removeItem('username');
    } catch (err) {
      console.error('Failed to update appUnlocked flag:', err);
    }

    // Redirect to the login/lock screen immediately
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  };

  return (
    <PageTransition direction="forward">
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <main className="flex-1 w-full px-4 py-6 flex flex-col gap-4">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-black dark:text-white hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-2xl font-bold text-black dark:text-white">Profile</h1>
          </div>

          {/* Account Balance Card */}
          <div className="bg-gray-100 dark:bg-[#1a1a1a] rounded-2xl p-6">
            <div className="flex justify-between items-center">
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-2">{userMetadata?.telegram_handle ?? ''}</p>
              <button
                onClick={handleDisconnect}
                aria-label="Disconnect wallet"
                className="ml-3 inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                // title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
            {/* {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 bg-gray-300 dark:bg-gray-800 rounded w-40 mb-6"></div>
              </div>
            ) : (
              <p className="text-4xl font-bold text-black dark:text-white mb-6">
                ${balance ? (balance * 100).toFixed(2) : '0.00'}
              </p>
            )} */}
            <div className="flex flex-col gap-3 mt-2">
              {/* Level Labels */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-black dark:text-white">LVL {userLevel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-medium">LVL {userLevel + 1}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full" style={{ height: 4 }}>
                  <div
                    className={`rounded-full bg-white dark:bg-white`}
                    style={{
                      width: `${progressPercent}%`,
                      height: 4,
                    }}
                  />
                </div>

                {/* Current EXP follows progress bar */}
                {!isLoadingUserMetadata && (
                  <div
                    className="absolute top-4 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    style={{
                      left: `${progressPercent}%`,
                    }}
                  >
                    {currentExp} XP
                  </div>
                )}
              </div>

              {/* Experience Points - Right side only */}
              <div className="flex justify-end items-center text-xs">
                <span className="text-gray-500 dark:text-gray-400">
                  {isLoadingUserMetadata ? <SkeletonLine className="w-15" /> : `${requiredExp} XP`}
                </span>
              </div>
            </div>
          </div>

          <CustomTab
            tabs={[
              'Transaction history',
              `${unclaimedMissions.length ? `Quests (${unclaimedMissions.length})` : `Quests (0)`}`,
            ]}
            defaultTab={0}
            onTabChange={setActiveTab}
          />

          {activeTab === 0 ? (
            <TransactionHistory userId={user_id} />
          ) : (
            <Missions userId={user_id} isLoading={isLoadingMissions} missions={missions} />
          )}
        </main>
      </div>
    </PageTransition>
  );
}
