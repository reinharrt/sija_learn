// src/app/leaderboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LeaderboardTable from '@/components/gamification/LeaderboardTable';
import { Trophy, Users, TrendingUp, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalXP: 0,
    averageLevel: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSync = async () => {
    if (!user) return;

    setIsSyncing(true);
    try {
      const response = await fetch('/api/gamification/sync-progress', {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Synced:', result);
        // Reload stats and table
        loadStats();
        setRefreshKey(prev => prev + 1);
      }
    } catch (error) {
      console.error('Failed to sync progress:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-sija-primary">
            <Trophy size={32} strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-sija-text uppercase mb-4">
            Leaderboard
          </h1>
          <p className="text-lg text-sija-text/70 font-medium max-w-2xl mx-auto mb-6">
            See how you rank against other learners in the SIJA community
          </p>

          {user && (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sija-surface border-2 border-sija-primary text-sija-primary font-bold hover:bg-sija-primary hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing...' : 'Sync My Stats'}
            </button>
          )}
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center">
            <Users className="w-8 h-8 text-sija-primary mx-auto mb-2" />
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">
              Active Learners
            </p>
            <p className="font-display text-4xl font-black text-sija-primary">
              {stats.totalUsers.toLocaleString()}
            </p>
          </div>

          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center">
            <TrendingUp className="w-8 h-8 text-sija-primary mx-auto mb-2" />
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">
              Total XP Earned
            </p>
            <p className="font-display text-4xl font-black text-sija-primary">
              {stats.totalXP.toLocaleString()}
            </p>
          </div>

          <div className="bg-sija-surface border-2 border-sija-primary p-6 text-center">
            <Trophy className="w-8 h-8 text-sija-primary mx-auto mb-2" />
            <p className="text-sm text-sija-text/60 uppercase tracking-wider mb-1">
              Average Level
            </p>
            <p className="font-display text-4xl font-black text-sija-primary">
              {stats.averageLevel}
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable
          key={refreshKey}
          limit={50}
          currentUserId={user?.id}
          showCurrentUserRank
        />
      </div>
    </div>
  );
}