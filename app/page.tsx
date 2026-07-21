'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getLeaguesAction,
  getTeamsAction,
  getPlayersAction,
  getPlayerProfileAction,
  getSimilarPlayersAction,
  predictFutureAction,
} from '@/lib/actions/scoutActions';
import { addPlayerToShortlistCookie } from '@/lib/cookie';
import RadarChart from '@/components/RadarChart';
import PlayerAvatar from '@/components/PlayerAvatar';
import TypewriterText from '@/components/TypewriterText';
import AnimatedNumber from '@/components/AnimatedNumber';
import { CardSkeleton, TableSkeleton, RadarSkeleton } from '@/components/LoadingSkeleton';
import {
  Search,
  UserPlus,
  Check,
  Zap,
  TrendingUp,
  SlidersHorizontal,
  Users,
  Trophy,
  Calendar,
  Target,
  Clock,
  CircleDollarSign,
  Crosshair,
  Sparkles,
  Layers,
  SplitSquareHorizontal,
  Activity,
  Shield,
  Send,
  History,
} from 'lucide-react';

export default function DashboardPage() {
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [leagues, setLeagues] = useState<string[]>([]);
  const [selectedLeague, setSelectedLeague] = useState('');
  const [teams, setTeams] = useState<string[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [players, setPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');

  const [profile, setProfile] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shortlisted, setShortlisted] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Prediction State
  const [prediction, setPrediction] = useState<any>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isMerged, setIsMerged] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load leagues on mount
  useEffect(() => {
    getLeaguesAction().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setSeasons(res);
        const first = res[0];
        setSelectedSeason(first.season);
        setLeagues(first.leagues);
        const defaultLg = first.leagues.includes('premier-league') ? 'premier-league' : first.leagues[0];
        setSelectedLeague(defaultLg);
      }
      setInitialLoading(false);
    });
  }, []);

  // Load teams when season/league changes
  useEffect(() => {
    if (selectedSeason && selectedLeague) {
      getTeamsAction(selectedSeason, selectedLeague).then((tmList) => {
        setTeams(tmList || []);
        if (tmList && tmList.length > 0) {
          const defaultTm = tmList.includes('Real Madrid') ? 'Real Madrid' : tmList[0];
          setSelectedTeam(defaultTm);
        }
      });
    }
  }, [selectedSeason, selectedLeague]);

  // Load players when team changes
  useEffect(() => {
    if (selectedSeason && selectedLeague && selectedTeam) {
      getPlayersAction(selectedSeason, selectedLeague, selectedTeam).then((pList) => {
        setPlayers(pList || []);
        if (pList && pList.length > 0) {
          const defaultP = pList.includes('Jude Bellingham') ? 'Jude Bellingham' : pList[0];
          setSelectedPlayer(defaultP);
        }
      });
    }
  }, [selectedSeason, selectedLeague, selectedTeam]);

  // Load profile when player changes
  useEffect(() => {
    if (selectedSeason && selectedLeague && selectedTeam && selectedPlayer) {
      Promise.all([
        getPlayerProfileAction(selectedSeason, selectedLeague, selectedTeam, selectedPlayer),
        getSimilarPlayersAction(selectedSeason, selectedLeague, selectedTeam, selectedPlayer),
      ]).then(([profRes, simRes]) => {
        setProfile(profRes);
        setSimilar(simRes?.similar_players || []);
        setShortlisted(false);
        setPrediction(null);
        setIsPredicting(false);
        setIsMerged(false);
      });
    }
  }, [selectedSeason, selectedLeague, selectedTeam, selectedPlayer]);

  const handleShortlist = (name: string) => {
    addPlayerToShortlistCookie(name);
    setShortlisted(true);
    setTimeout(() => setShortlisted(false), 3000);
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    // Simulate AI training time for UI purposes
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const res = await predictFutureAction(selectedSeason, selectedLeague, selectedTeam, selectedPlayer);
    setPrediction(res);
    setIsPredicting(false);
  };

  const handleSeasonChange = (season: string) => {
    setSelectedSeason(season);
    const found = seasons.find((s) => s.season === season);
    if (found) {
      setLeagues(found.leagues);
      const defaultLg = found.leagues.includes('premier-league') ? 'premier-league' : found.leagues[0];
      setSelectedLeague(defaultLg);
    }
  };

  const formatLeagueName = (slug: string) =>
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-carbon-900 dark:text-white">
            Scouting Dashboard
          </h1>
          <p className="text-sm text-carbon-500 dark:text-carbon-400 font-medium mt-1">
            Analyze player performance, compare attributes, and discover transfer targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="stat-pill bg-pitch-500/10 text-pitch-600 dark:text-pitch-400 border border-pitch-500/15">
            <Users className="w-3.5 h-3.5" />
            <span>170K+ Players</span>
          </div>
          <div className="stat-pill bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/15">
            <Trophy className="w-3.5 h-3.5" />
            <span>14 Leagues</span>
          </div>
        </div>
      </motion.div>

      {/* Filter Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="card p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-pitch-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-carbon-500 dark:text-carbon-400">
            Scout Filters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="metric-label mb-1.5 block">Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="input-field"
            >
              {seasons.map((s) => (
                <option key={s.season} value={s.season}>
                  {s.season}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="metric-label mb-1.5 block">League</label>
            <select
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
              className="input-field"
            >
              {leagues.map((lg) => (
                <option key={lg} value={lg}>
                  {formatLeagueName(lg)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="metric-label mb-1.5 block">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="input-field"
            >
              {teams.map((tm) => (
                <option key={tm} value={tm}>
                  {tm}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="metric-label mb-1.5 block">Player</label>
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="input-field"
            >
              {players.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {initialLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6"
          >
            <CardSkeleton />
            <div className="space-y-6">
              <RadarSkeleton />
            </div>
          </motion.div>
        ) : profile && profile.player_info ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6"
          >
            {/* Player Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.45 }}
              className="card p-6 flex flex-col justify-between"
            >
              <div className="space-y-5">
                {/* Position & Season */}
                <div className="flex items-center justify-between">
                  <span className="badge-green">
                    {profile.player_info.position}
                  </span>
                  <span className="text-xs font-semibold text-carbon-400 dark:text-carbon-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {profile.player_info.season}
                  </span>
                </div>

                {/* Big Top Hero Avatar & Player Details Below */}
                <div className="flex flex-col items-center text-center py-2 space-y-3">
                  <PlayerAvatar name={profile.player_info.player} team={profile.player_info.team} position={profile.player_info.position} avatarUrl={profile.player_info.avatar_url} size="hero" />
                  <div className="space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-carbon-900 dark:text-white leading-tight min-h-[36px]">
                      <TypewriterText key={profile.player_info.player} text={profile.player_info.player} speed={30} />
                    </h2>
                    <p className="text-sm font-semibold text-carbon-500 dark:text-carbon-400 min-h-[20px]">
                      <TypewriterText key={`${profile.player_info.team}-${profile.player_info.league}`} text={`${profile.player_info.team} · ${formatLeagueName(profile.player_info.league)}`} speed={20} />
                    </p>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CircleDollarSign className="w-3 h-3 text-pitch-500" />
                      <span className="metric-label">Market Value</span>
                    </div>
                    <span className="text-lg font-extrabold text-pitch-600 dark:text-pitch-400">
                      <TypewriterText key={profile.player_info.market_value} text={profile.player_info.market_value || 'N/A'} speed={35} />
                    </span>
                  </div>

                  <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3 h-3 text-blue-500" />
                      <span className="metric-label">Age</span>
                    </div>
                    <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
                      <AnimatedNumber value={profile.player_info.age} formatAsLocale={false} />
                      <span className="text-xs font-semibold text-carbon-400 ml-1">yrs</span>
                    </span>
                  </div>

                  <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="metric-label">Minutes</span>
                    </div>
                    <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
                      <AnimatedNumber value={profile.player_info.minutes || 0} />
                    </span>
                  </div>

                  <div className="bg-carbon-50 dark:bg-carbon-850 rounded-xl p-3.5 border border-carbon-100 dark:border-carbon-800">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Crosshair className="w-3 h-3 text-purple-500" />
                      <span className="metric-label">G / A</span>
                    </div>
                    <span className="text-lg font-extrabold text-carbon-900 dark:text-carbon-100">
                      <AnimatedNumber value={profile.key_metrics?.goals ?? 0} formatAsLocale={false} />
                      <span className="text-carbon-400 mx-0.5">/</span>
                      <AnimatedNumber value={profile.key_metrics?.assists ?? 0} formatAsLocale={false} />
                    </span>
                  </div>
                </div>
              </div>

              {/* Shortlist Button */}
              <button
                onClick={() => handleShortlist(profile.player_info.player)}
                className={`mt-5 w-full ${shortlisted ? 'btn-secondary' : 'btn-primary'}`}
              >
                {shortlisted ? (
                  <>
                    <Check className="w-4 h-4 text-pitch-500" />
                    <span>Added to Shortlist</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Add to Shortlist</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Right Column — Radar + Similar */}
            <div className="space-y-6">
              {/* Radar Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="section-title">
                    <Zap className="w-5 h-5 text-amber-500" />
                    Skill Radar
                  </h3>
                  <span className="badge-purple">Percentile</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <RadarChart data={profile.radar_chart} />

                  <div className="space-y-3">
                    {Object.entries(profile.radar_chart).map(([key, val]: [string, any], idx) => (
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
                            <AnimatedNumber value={Math.round(val)} formatAsLocale={false} />
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

                {/* Prediction Section */}
                <div className="mt-8 pt-6 border-t border-carbon-200 dark:border-carbon-800">
                  {!prediction && !isPredicting && (
                    <button onClick={handlePredict} className="w-full btn-secondary py-3 flex items-center justify-center gap-2 border border-blue-500/20 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 transition-colors">
                      <Sparkles className="w-4 h-4" />
                      <span>See Future Prediction</span>
                    </button>
                  )}

                  {isPredicting && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                      <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      <span className="text-sm font-semibold text-carbon-500 dark:text-carbon-400 animate-pulse">
                        Training predictive AI model...
                      </span>
                    </div>
                  )}

                  {prediction && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                        <div>
                          <h4 className="text-base font-extrabold text-carbon-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-blue-500" />
                            Next Season Projection
                          </h4>
                          <p className="text-xs text-carbon-500 dark:text-carbon-400 mt-0.5">
                            AI-simulated performance forecasting & skill growth
                          </p>
                        </div>
                        
                        <button
                          onClick={() => setIsMerged(!isMerged)}
                          className={`btn-sm flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            isMerged
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                              : 'bg-carbon-100 dark:bg-carbon-800 text-carbon-700 dark:text-carbon-200 border-carbon-200 dark:border-carbon-700 hover:bg-carbon-200 dark:hover:bg-carbon-700'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>{isMerged ? 'Split Charts' : 'Merge Charts'}</span>
                        </button>
                      </div>

                      {/* ═══ Radar Charts — Smooth Physical Merge & Split Animation ═══ */}
                      <div className="bg-carbon-50 dark:bg-carbon-950/50 rounded-2xl border border-carbon-100 dark:border-carbon-800 mb-4 overflow-hidden">
                        {/* Legend header */}
                        <div className="flex flex-col sm:flex-row items-center justify-between p-4 pb-0 gap-2">
                          <AnimatePresence mode="wait">
                            <motion.span
                              key={isMerged ? 'merged-lbl' : 'split-lbl'}
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 6 }}
                              transition={{ duration: 0.25 }}
                              className="text-[11px] font-extrabold tracking-wider text-carbon-500 uppercase"
                            >
                              {isMerged ? 'MERGED RADAR OVERLAY' : 'SIDE-BY-SIDE COMPARISON'}
                            </motion.span>
                          </AnimatePresence>
                          <div className="flex items-center gap-4 text-xs font-bold">
                            <span className="flex items-center gap-1.5 text-pitch-600 dark:text-pitch-400">
                              <div className="w-2.5 h-2.5 rounded-full bg-pitch-500" /> Current (Solid)
                            </span>
                            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                              <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-500 border-dashed" /> Projected (Dashed)
                            </span>
                          </div>
                        </div>

                        {/* Stage area for continuous physical chart merging */}
                        <div className={`relative transition-all duration-700 flex items-center justify-center p-4 ${
                          isMobile ? (isMerged ? 'min-h-[320px]' : 'min-h-[580px]') : 'min-h-[360px]'
                        }`}>
                          {/* Background glow aura that intensifies on merge */}
                          <motion.div
                            className="absolute w-64 h-64 rounded-full blur-3xl pointer-events-none"
                            animate={{
                              opacity: isMerged ? 0.4 : 0.1,
                              scale: isMerged ? 1.1 : 0.8,
                            }}
                            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
                            style={{
                              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.3) 60%, transparent 100%)',
                            }}
                          />

                          {/* Stage Container holding both Green & Blue Charts */}
                          <div className={`relative w-full max-w-2xl transition-all duration-700 flex items-center justify-center ${
                            isMobile ? (isMerged ? 'h-[280px]' : 'h-[520px]') : 'h-[280px]'
                          }`}>

                            {/* ── Left / Top Chart: Current Skill Radar ── */}
                            <motion.div
                              className="absolute flex flex-col items-center justify-center"
                              initial={{ opacity: 0, x: isMobile ? 0 : -350, y: isMobile ? -350 : 0 }}
                              animate={{
                                opacity: 1,
                                x: isMerged ? 0 : (isMobile ? 0 : -160),
                                y: isMerged ? 0 : (isMobile ? -130 : 0),
                              }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <motion.span
                                animate={{ opacity: isMerged ? 0 : 1, y: isMerged ? -10 : 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-xs font-extrabold text-pitch-500 mb-2 uppercase tracking-wide"
                              >
                                Current Skill Radar
                              </motion.span>
                              <RadarChart
                                data={prediction.current_radar}
                                color="green"
                                size={isMobile ? 220 : 260}
                              />
                            </motion.div>

                            {/* ── Right / Bottom Chart: Projected Skill Radar ── */}
                            <motion.div
                              className="absolute flex flex-col items-center justify-center"
                              initial={{ opacity: 0, x: isMobile ? 0 : 350, y: isMobile ? 350 : 0 }}
                              animate={{
                                opacity: 1,
                                x: isMerged ? 0 : (isMobile ? 0 : 160),
                                y: isMerged ? 0 : (isMobile ? 130 : 0),
                              }}
                              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <motion.span
                                animate={{ opacity: isMerged ? 0 : 1, y: isMerged ? -10 : 0 }}
                                transition={{ duration: 0.5 }}
                                className="text-xs font-extrabold text-blue-500 mb-2 uppercase tracking-wide"
                              >
                                Projected Skill Radar
                              </motion.span>
                              <RadarChart
                                data={prediction.predicted_radar}
                                color="blue"
                                isDashed={true}
                                hideGrid={isMerged}
                                hideLabels={isMerged}
                                size={isMobile ? 220 : 260}
                              />
                            </motion.div>

                          </div>
                        </div>
                      </div>

                      {/* Attribute Performance Bars */}
                      <div className="space-y-3 pt-2">
                        {Object.keys(prediction.current_radar).map((key) => {
                          const curr = Math.round(prediction.current_radar[key]);
                          const pred = Math.round(prediction.predicted_radar[key]);
                          const diff = Math.round(pred - curr);
                          const isPositive = diff > 0;
                          const isNegative = diff < 0;

                          return (
                            <div key={key} className="grid grid-cols-[120px_1fr_60px] gap-3 items-center">
                              <span className="text-xs font-bold text-carbon-600 dark:text-carbon-300 uppercase tracking-wide">
                                {key}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-2.5 bg-carbon-100 dark:bg-carbon-800 rounded-full overflow-hidden flex relative">
                                  {isNegative ? (
                                    <>
                                      <div className="h-full bg-carbon-300 dark:bg-carbon-600" style={{ width: `${pred}%` }} />
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.abs(diff)}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-red-500" />
                                    </>
                                  ) : (
                                    <>
                                      <div className="h-full bg-carbon-300 dark:bg-carbon-600" style={{ width: `${curr}%` }} />
                                      {isPositive && <motion.div initial={{ width: 0 }} animate={{ width: `${diff}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full bg-green-500" />}
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center justify-end gap-1.5 text-xs font-extrabold tabular-nums">
                                <span className="text-carbon-900 dark:text-white text-sm">{pred}</span>
                                {diff !== 0 && (
                                  <motion.span 
                                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }}
                                    className={`text-xs font-bold ${isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}
                                  >
                                    {isPositive ? `+${diff}` : `${diff}`}
                                  </motion.span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Detailed Performance Breakdown Panel */}
              {profile.detailed_stats && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="card p-6 space-y-5"
                >
                  <h3 className="section-title">
                    <Activity className="w-5 h-5 text-pitch-500" />
                    Detailed Performance Breakdown
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Shooting & xG */}
                    <div className="bg-carbon-50 dark:bg-carbon-850/80 rounded-2xl p-4 border border-carbon-100 dark:border-carbon-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-pitch-500 uppercase tracking-wider">
                        <Crosshair className="w-4 h-4" />
                        Shooting & xG
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Total Shots</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.shooting.shots} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Shots on Target</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.shooting.sot} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Shot Accuracy</span>
                          <span className="font-extrabold text-pitch-600 dark:text-pitch-400">{profile.detailed_stats.shooting.sot_pct}%</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Expected Goals (xG)</span>
                          <span className="font-extrabold text-pitch-600 dark:text-pitch-400">{profile.detailed_stats.shooting.xg}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-carbon-500 dark:text-carbon-400">Non-Penalty xG</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white">{profile.detailed_stats.shooting.npxg}</span>
                        </div>
                      </div>
                    </div>

                    {/* Passing & Chance Creation */}
                    <div className="bg-carbon-50 dark:bg-carbon-850/80 rounded-2xl p-4 border border-carbon-100 dark:border-carbon-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-blue-500 uppercase tracking-wider">
                        <Send className="w-4 h-4" />
                        Passing & Playmaking
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Passes Completed</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.passing.passes_completed} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Pass Accuracy</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">{profile.detailed_stats.passing.pass_pct}%</span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Key Passes</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400"><AnimatedNumber value={profile.detailed_stats.passing.key_passes} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-carbon-500 dark:text-carbon-400">Progressive Passes</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.passing.progressive_passes} formatAsLocale={false} /></span>
                        </div>
                      </div>
                    </div>

                    {/* Defending & Duels */}
                    <div className="bg-carbon-50 dark:bg-carbon-850/80 rounded-2xl p-4 border border-carbon-100 dark:border-carbon-800 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-extrabold text-purple-500 uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        Defending & Duels
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Tackles</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.defending.tackles} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Interceptions</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.defending.interceptions} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-carbon-200/50 dark:border-carbon-800">
                          <span className="text-carbon-500 dark:text-carbon-400">Clearances</span>
                          <span className="font-extrabold text-carbon-900 dark:text-white"><AnimatedNumber value={profile.detailed_stats.defending.clearances} formatAsLocale={false} /></span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-carbon-500 dark:text-carbon-400">Aerial Duels Won</span>
                          <span className="font-extrabold text-purple-600 dark:text-purple-400">{profile.detailed_stats.defending.aerial_pct}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Career Progression History */}
              {profile.career_history && profile.career_history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.05 }}
                  className="card p-6 space-y-4"
                >
                  <h3 className="section-title">
                    <History className="w-5 h-5 text-amber-500" />
                    Multi-Season Career Progression History
                  </h3>

                  <div className="overflow-x-auto -mx-6 px-6">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Season</th>
                          <th>Team</th>
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
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <Search className="w-10 h-10 text-carbon-300 dark:text-carbon-700 mx-auto mb-3" />
            <p className="text-sm font-semibold text-carbon-400 dark:text-carbon-500">
              Select a season, league, team, and player to begin scouting.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
