'use client';

import { use, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getPlayerProfileAction, getSimilarPlayersAction } from '@/lib/actions/scoutActions';
import { addPlayerToShortlistCookie } from '@/lib/cookie';
import RadarChart from '@/components/RadarChart';
import { PageLoader } from '@/components/LoadingSkeleton';
import {
  ArrowLeft,
  UserPlus,
  Check,
  Zap,
  TrendingUp,
  Calendar,
  CircleDollarSign,
  Clock,
  Crosshair,
  Target,
  MapPin,
  Activity,
  Trophy,
  History,
} from 'lucide-react';
import Link from 'next/link';

export default function PlayerDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params);
  const playerName = decodeURIComponent(resolvedParams.name);

  const [profile, setProfile] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(false);

  const formatLeagueName = (slug: string) =>
    slug?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) || '';

  useEffect(() => {
    Promise.all([
      getPlayerProfileAction('2024-2025', 'la-liga', 'Real Madrid', playerName),
      getSimilarPlayersAction('2024-2025', 'la-liga', 'Real Madrid', playerName),
    ]).then(([profRes, simRes]) => {
      setProfile(profRes);
      setSimilar(simRes?.similar_players || []);
      setLoading(false);
    });
  }, [playerName]);

  const handleShortlist = () => {
    addPlayerToShortlistCookie(playerName);
    setShortlisted(true);
    setTimeout(() => setShortlisted(false), 3000);
  };

  if (loading) return <PageLoader />;

  if (!profile || !profile.player_info) {
    return (
      <div className="card p-12 text-center space-y-4">
        <Target className="w-10 h-10 text-carbon-300 dark:text-carbon-700 mx-auto" />
        <p className="text-sm font-semibold text-carbon-500">
          Player &quot;{playerName}&quot; not found in the database.
        </p>
        <Link href="/" className="btn-secondary inline-flex no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const info = profile.player_info;
  const metrics = profile.key_metrics || {};
  const radar = profile.radar_chart || {};

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-carbon-500 dark:text-carbon-400 hover:text-carbon-900 dark:hover:text-white transition-colors no-underline">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </motion.div>

      {/* Player Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge-green">{info.position}</span>
              <span className="text-xs font-semibold text-carbon-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {info.season}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-carbon-900 dark:text-white">
              {info.player}
            </h1>
            <p className="text-sm font-medium text-carbon-500 dark:text-carbon-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {info.team} · {formatLeagueName(info.league)}
            </p>
          </div>

          <button
            onClick={handleShortlist}
            className={shortlisted ? 'btn-secondary' : 'btn-primary'}
          >
            {shortlisted ? (
              <><Check className="w-4 h-4 text-pitch-500" /> Shortlisted</>
            ) : (
              <><UserPlus className="w-4 h-4" /> Add to Shortlist</>
            )}
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-pitch-500" />
              <span className="metric-label">Matches (MP)</span>
            </div>
            <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
              {info.matches || 0}
              <span className="text-xs font-semibold text-carbon-400 ml-1">({info.starts || 0} Starts)</span>
            </span>
          </div>

          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Crosshair className="w-3.5 h-3.5 text-purple-500" />
              <span className="metric-label">Goals / Assists</span>
            </div>
            <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
              {metrics.goals ?? '—'} <span className="text-carbon-400">/</span> {metrics.assists ?? '—'}
            </span>
          </div>

          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              <span className="metric-label">Expected (xG)</span>
            </div>
            <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
              {metrics.xg ?? '—'}
            </span>
          </div>

          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="metric-label">Minutes</span>
            </div>
            <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
              {info.minutes?.toLocaleString() || '—'}
            </span>
          </div>

          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <CircleDollarSign className="w-3.5 h-3.5 text-pitch-500" />
              <span className="metric-label">Market Value</span>
            </div>
            <span className="text-lg font-extrabold text-pitch-600 dark:text-pitch-400">
              {info.market_value || 'N/A'}
            </span>
          </div>

          <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5 text-carbon-400" />
              <span className="metric-label">Age</span>
            </div>
            <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
              {info.age} <span className="text-xs font-semibold text-carbon-400 ml-1">yrs</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* Radar Chart */}
      {Object.keys(radar).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <Zap className="w-5 h-5 text-amber-500" />
              Skill Radar
            </h2>
            <span className="badge-purple">Percentile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <RadarChart data={radar} size={260} />

            <div className="space-y-3">
              {Object.entries(radar).map(([key, val]: [string, any], idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-carbon-500 dark:text-carbon-400 uppercase tracking-wide">
                      {key}
                    </span>
                    <span className="text-xs font-extrabold text-pitch-600 dark:text-pitch-400 tabular-nums">
                      {val}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-carbon-100 dark:bg-carbon-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${val}%` }}
                      transition={{ duration: 0.8, delay: 0.4 + idx * 0.05, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-pitch-500 to-pitch-400"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Career Progression History */}
      {profile.career_history && profile.career_history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="card p-6 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="section-title">
              <History className="w-5 h-5 text-amber-500" />
              Multi-Season Career Progression History
            </h2>
            {profile.career_totals && (
              <span className="badge-purple text-xs font-bold">
                {profile.career_totals.total_seasons} Seasons Tracked
              </span>
            )}
          </div>

          {/* Career Overview Totals Banner */}
          {profile.career_totals && (
            <div className="bg-carbon-50 dark:bg-carbon-950/60 rounded-2xl p-4 border border-carbon-100 dark:border-carbon-800 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pitch-600 dark:text-pitch-400">
                <Trophy className="w-4 h-4 text-amber-500" />
                Career Totals Overview
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-1">
                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Career Matches</span>
                  <span className="text-base sm:text-lg font-extrabold text-carbon-900 dark:text-white">
                    {profile.career_totals.total_matches}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">
                    {profile.career_totals.total_starts} Starts
                  </span>
                </div>

                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Career Goals</span>
                  <span className="text-base sm:text-lg font-extrabold text-pitch-600 dark:text-pitch-400">
                    {profile.career_totals.total_goals}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">Total Scored</span>
                </div>

                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Career Assists</span>
                  <span className="text-base sm:text-lg font-extrabold text-blue-600 dark:text-blue-400">
                    {profile.career_totals.total_assists}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">Key Passes</span>
                </div>

                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Career Minutes</span>
                  <span className="text-base sm:text-lg font-extrabold text-carbon-900 dark:text-white">
                    {profile.career_totals.total_minutes?.toLocaleString() || '0'}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">On Pitch</span>
                </div>

                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Career xG</span>
                  <span className="text-base sm:text-lg font-extrabold text-purple-600 dark:text-purple-400">
                    {profile.career_totals.total_xg}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">Expected Goals</span>
                </div>

                <div className="bg-white dark:bg-carbon-850/80 rounded-xl p-3 border border-carbon-100 dark:border-carbon-800">
                  <span className="text-[10px] font-bold text-carbon-500 dark:text-carbon-400 uppercase block">Seasons</span>
                  <span className="text-base sm:text-lg font-extrabold text-amber-500">
                    {profile.career_totals.total_seasons}
                  </span>
                  <span className="text-[10px] font-semibold text-carbon-400 block">Active Years</span>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Season</th>
                  <th>Team</th>
                  <th>League</th>
                  <th className="text-right">MP</th>
                  <th className="text-right">Starts</th>
                  <th className="text-right">Minutes</th>
                  <th className="text-right">Goals</th>
                  <th className="text-right">Assists</th>
                  <th className="text-right">xG</th>
                </tr>
              </thead>
              <tbody>
                {profile.career_history.map((c: any, idx: number) => (
                  <tr key={`${c.season}-${c.team}-${idx}`}>
                    <td className="font-extrabold text-carbon-900 dark:text-white">{c.season}</td>
                    <td className="text-carbon-600 dark:text-carbon-400">{c.team}</td>
                    <td className="text-carbon-400 dark:text-carbon-500 text-xs">{formatLeagueName(c.league)}</td>
                    <td className="text-right font-extrabold text-carbon-900 dark:text-white tabular-nums">{c.matches ?? '—'}</td>
                    <td className="text-right text-carbon-500 tabular-nums">{c.starts ?? '—'}</td>
                    <td className="text-right tabular-nums">{c.minutes?.toLocaleString() || '—'}</td>
                    <td className="text-right font-bold text-pitch-600 dark:text-pitch-400 tabular-nums">{c.goals}</td>
                    <td className="text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">{c.assists}</td>
                    <td className="text-right tabular-nums text-carbon-500">{c.xg}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Similar Players */}
      {similar.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="card p-6"
        >
          <h2 className="section-title mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Similar Players
          </h2>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Team</th>
                  <th>League</th>
                  <th className="text-right">Similarity</th>
                </tr>
              </thead>
              <tbody>
                {similar.map((s, idx) => (
                  <motion.tr
                    key={s.player}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + idx * 0.04 }}
                  >
                    <td className="font-bold text-carbon-900 dark:text-white">{s.player}</td>
                    <td>{s.team}</td>
                    <td className="text-carbon-400 dark:text-carbon-500">{formatLeagueName(s.league)}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-carbon-100 dark:bg-carbon-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${s.similarity_score}%` }}
                            transition={{ duration: 0.6, delay: 0.5 + idx * 0.04 }}
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400"
                          />
                        </div>
                        <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tabular-nums w-10 text-right">
                          {s.similarity_score}%
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
