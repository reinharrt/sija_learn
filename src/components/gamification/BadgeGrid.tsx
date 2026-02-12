// src/components/gamification/BadgeGrid.tsx

'use client';

import { useState } from 'react';
import BadgeCard from './BadgeCard';
import { type BadgeDefinition, type BadgeRarity, type BadgeCategory } from '@/lib/badge-definitions';
import { Filter } from 'lucide-react';

interface BadgeGridProps {
  badges: BadgeDefinition[];
  earnedBadgeIds?: string[];
  progress?: Record<string, number>;
  onBadgeClick?: (badge: BadgeDefinition) => void;
  showFilters?: boolean;
}

export default function BadgeGrid({
  badges,
  earnedBadgeIds = [],
  progress = {},
  onBadgeClick,
  showFilters = true
}: BadgeGridProps) {
  const [rarityFilter, setRarityFilter] = useState<BadgeRarity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | 'all'>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (rarityFilter !== 'all' && badge.rarity !== rarityFilter) return false;
    if (categoryFilter !== 'all' && badge.category !== categoryFilter) return false;
    if (showEarnedOnly && !earnedBadgeIds.includes(badge.id)) return false;
    return true;
  });

  const earnedCount = badges.filter(b => earnedBadgeIds.includes(b.id)).length;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-sija-text/10 pb-4">
        <div>
          <h2 className="font-display text-2xl font-black text-sija-text uppercase mb-1">
            Badge Collection
          </h2>
          <p className="text-sija-text/60 font-medium">
            {earnedCount} of {badges.length} earned
          </p>
        </div>

        {showFilters && (
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-sija-text/60" />
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value as BadgeRarity | 'all')}
              className="px-3 py-1.5 border-2 border-sija-primary bg-sija-surface text-sija-text font-bold text-sm"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as BadgeCategory | 'all')}
              className="px-3 py-1.5 border-2 border-sija-primary bg-sija-surface text-sija-text font-bold text-sm"
            >
              <option value="all">All Categories</option>
              <option value="progress">Progress</option>
              <option value="streak">Streak</option>
              <option value="social">Social</option>
              <option value="speed">Speed</option>
              <option value="special">Special</option>
            </select>

            <button
              onClick={() => setShowEarnedOnly(!showEarnedOnly)}
              className={`
                px-3 py-1.5 border-2 font-bold text-sm transition-all
                ${showEarnedOnly
                  ? 'bg-sija-primary text-white border-sija-primary'
                  : 'bg-sija-surface text-sija-text border-sija-primary'
                }
              `}
            >
              Earned Only
            </button>
          </div>
        )}
      </div>

      {/* Badge Grid */}
      {filteredBadges.length === 0 ? (
        <div className="text-center py-12 border-2 border-sija-primary bg-sija-surface">
          <p className="text-sija-text font-bold uppercase tracking-wider">
            No badges found
          </p>
          <p className="text-sija-text/60 mt-2">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBadges.map(badge => (
            <BadgeCard
              key={badge.id}
              badge={badge}
              earned={earnedBadgeIds.includes(badge.id)}
              progress={progress[badge.id]}
              onClick={() => onBadgeClick?.(badge)}
            />
          ))}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['common', 'rare', 'epic', 'legendary'] as BadgeRarity[]).map(rarity => {
          const total = badges.filter(b => b.rarity === rarity).length;
          const earned = badges.filter(b =>
            b.rarity === rarity && earnedBadgeIds.includes(b.id)
          ).length;

          return (
            <div key={rarity} className="border-2 border-sija-primary bg-sija-surface p-4">
              <p className="text-xs text-sija-text/60 uppercase tracking-wider mb-1">
                {rarity}
              </p>
              <p className="font-display text-2xl font-black text-sija-primary">
                {earned}/{total}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}