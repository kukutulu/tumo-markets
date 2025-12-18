'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import PageTransition from 'src/components/PageTransition';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { apiUrl } from 'src/service/api/apiUrl';
import { useTheme } from 'src/provider/ThemeProvider';
import { TeamPill } from 'src/components/TeamPill';
import { formatMatchTime } from 'src/utils/format';
import { MomentumData, MatchData } from 'src/types/global';
import axios from 'axios';
import Momentum from 'src/components/Momentum';
import TestLiveMatchChart from 'src/views/test-match-detail/TestLiveMatchChart';
import TestPositionsAndActions from 'src/views/test-match-detail/TestPositionsAndActions';
import SoccerPitchCanvas from 'src/components/SoccerPitch/SoccerPitchCanvas';
import CustomTab from 'src/components/Tab/CustomTab';
import Leaderboard from 'src/views/live-match-detail/Leaderboard/LeaderBoard';

export default function TestMatchDetailPage() {
  const [momentumData, setMomentumData] = useState<MomentumData[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [currentMomentum, setCurrentMomentum] = useState<number>(50);
  const [homeGoals, setHomeGoals] = useState<number>(0);
  const [awayGoals, setAwayGoals] = useState<number>(0);
  const [currentTimeInMatch, setCurrentTimeInMatch] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [fetchedMatch, setFetchedMatch] = useState<MatchData | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [isLoadingHistoricalData, setIsLoadingHistoricalData] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const hasLoadedHistoricalData = useRef(false);

  const router = useRouter();
  const params = useParams();
  const { theme } = useTheme();

  const matchId = params.id as string;

  // Fetch match metadata from API
  useEffect(() => {
    if (matchId && !fetchedMatch && !isLoadingMatch) {
      setIsLoadingMatch(true);
      axios
        .get<MatchData>(apiUrl.getMatchMetadata(matchId))
        .then(response => {
          setFetchedMatch(response.data);
        })
        .catch(error => {
          console.error('Failed to fetch match metadata:', error);
        })
        .finally(() => {
          setIsLoadingMatch(false);
        });
    }
  }, [matchId, fetchedMatch, isLoadingMatch]);

  // Fetch historical momentum data once when component mounts
  useEffect(() => {
    if (matchId && !hasLoadedHistoricalData.current && !isLoadingHistoricalData) {
      setIsLoadingHistoricalData(true);
      hasLoadedHistoricalData.current = true;

      axios
        .get<MomentumData[]>(apiUrl.getHistoricalMomentumData(matchId))
        .then(response => {
          const historicalData = response.data;
          if (Array.isArray(historicalData) && historicalData.length > 0) {
            setMomentumData(historicalData);

            // Set the latest values from historical data
            const latestData = historicalData[historicalData.length - 1];
            setCurrentMomentum(latestData.momentum_value);
            setHomeGoals(latestData.home_goals);
            setAwayGoals(latestData.away_goals);
            setCurrentTimeInMatch(latestData.time_in_match);
          }
        })
        .catch(error => {
          console.error('Failed to fetch historical momentum data:', error);
        })
        .finally(() => {
          setIsLoadingHistoricalData(false);
        });
    }
  }, [matchId, isLoadingHistoricalData]);

  // Use fetched match data
  const currentMatch = fetchedMatch;

  const matchData = currentMatch
    ? {
        league: currentMatch.competition?.trim() || 'Unknown League',
        teams: [currentMatch.home_team?.trim() || 'Home', currentMatch.away_team?.trim() || 'Away'] as [string, string],
        score: [
          typeof currentMatch.home_team_score === 'number' && Number.isFinite(currentMatch.home_team_score)
            ? currentMatch.home_team_score
            : 0,
          typeof currentMatch.away_team_score === 'number' && Number.isFinite(currentMatch.away_team_score)
            ? currentMatch.away_team_score
            : 0,
        ] as [number, number],
        homeUrl: currentMatch.home_team_logo,
        awayUrl: currentMatch.away_team_logo,
      }
    : {
        league: isLoadingMatch ? 'Loading...' : 'Unknown League',
        teams: [isLoadingMatch ? 'Loading...' : 'Home', isLoadingMatch ? 'Loading...' : 'Away'] as [string, string],
        score: [0, 0] as [number, number],
      };

  useEffect(() => {
    let mounted = true;

    const connectWebSocket = () => {
      try {
        const wsUrl = apiUrl.getMomentumTestingWebSocket(matchId);
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (mounted) {
            setIsConnected(true);
            setConnectionError(null);
          }
        };
        ws.onmessage = event => {
          if (!mounted) return;
          try {
            const rawData = event.data;

            let data;

            try {
              data = JSON.parse(rawData);
            } catch (e) {
              // If that fails, try removing outer quotes for double-encoded strings
              if (typeof rawData === 'string' && rawData.startsWith('"')) {
                try {
                  data = JSON.parse(JSON.parse(rawData));
                } catch {
                  throw new Error('Failed to parse double-encoded JSON');
                }
              } else {
                throw e;
              }
            }

            // Extract momentum value (check both momentum_value and momentum_index for backward compatibility)
            const momentum = parseFloat(data.momentum_value ?? data.momentum_index);
            const homeGoals = parseInt(data.home_goals, 10);
            const awayGoals = parseInt(data.away_goals, 10);
            const timeInMatch = String(data.time_in_match || '0:00').trim();

            // Validate after conversion - only update if we have valid numeric data
            const hasMomentum = !isNaN(momentum) && isFinite(momentum);
            const hasHomeGoals = !isNaN(homeGoals) && isFinite(homeGoals);
            const hasAwayGoals = !isNaN(awayGoals) && isFinite(awayGoals);
            const hasTime = timeInMatch !== '';

            if (hasMomentum && hasHomeGoals && hasAwayGoals && hasTime) {
              setCurrentMomentum(momentum);
              setHomeGoals(homeGoals);
              setAwayGoals(awayGoals);
              setCurrentTimeInMatch(timeInMatch);

              // Append new data point to existing momentum data
              setMomentumData(prev => {
                // Prevent duplicate entries by checking if the last entry has the same timestamp
                const lastEntry = prev[prev.length - 1];
                if (lastEntry && lastEntry.time_in_match === timeInMatch) {
                  // Update the last entry instead of adding a duplicate
                  return [
                    ...prev.slice(0, -1),
                    {
                      time_in_match: timeInMatch,
                      momentum_value: momentum,
                      home_goals: homeGoals,
                      away_goals: awayGoals,
                      home_team_threat: data.home_team_threat,
                      away_team_threat: data.away_team_threat,
                    },
                  ];
                }

                // Add new data point
                return [
                  ...prev,
                  {
                    time_in_match: timeInMatch,
                    momentum_value: momentum,
                    home_goals: homeGoals,
                    away_goals: awayGoals,
                    home_team_threat: data.home_team_threat,
                    away_team_threat: data.away_team_threat,
                  },
                ];
              });
            } else {
              console.warn('⚠️ Validation failed - invalid data received:', {
                raw: data,
                parsed: { momentum, homeGoals, awayGoals, timeInMatch },
                validation: { hasMomentum, hasHomeGoals, hasAwayGoals, hasTime },
              });
            }
          } catch (error) {
            console.error('Failed to process WebSocket message:', error, 'Raw:', event.data);
          }
        };
        ws.onerror = error => {
          console.error('❌ WebSocket error:', error);
          if (mounted) {
            setIsConnected(false);
            setConnectionError('Unable to connect to live data stream. SSL certificate required.');
          }
        };

        ws.onclose = event => {
          if (mounted) {
            setIsConnected(false);

            if (!event.wasClean) {
              setConnectionError('Connection closed unexpectedly. Backend SSL/TLS configuration needed.');
            }
          }
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        if (mounted) {
          setConnectionError('Failed to initialize connection. Please check backend configuration.');
          setIsConnected(false);
        }
      }
    };

    connectWebSocket();

    return () => {
      mounted = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [matchId]);

  const [homeTeam, awayTeam] = matchData.teams;
  const homeScore = isConnected && momentumData.length > 0 ? homeGoals : matchData.score[0];
  const awayScore = isConnected && momentumData.length > 0 ? awayGoals : matchData.score[1];

  const time = currentTimeInMatch || currentMatch?.time_in_match?.trim() || '';
  const timeLabel = formatMatchTime(time);
  const liveLabel = timeLabel ? `Live - ${timeLabel}` : 'Live';

  function handleRouteToHome() {
    router.push('/');
    // toast.info('This is a demo version. For demonstration purposes, live match data will reset to the start');
  }

  return (
    <PageTransition direction="forward">
      <div
        className="flex flex-col min-h-screen relative gap-2 px-4 pb-6"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handleRouteToHome}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{`${homeTeam} vs ${awayTeam}`}</h1>
        </div>

        {/* Connection Error Notice - For Demo */}
        {connectionError && (
          <div className="py-2">
            <div className="rounded-lg border border-yellow-800 bg-yellow-900/20 p-3 flex items-start gap-3">
              <WifiOff className="text-yellow-500 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-yellow-200 font-semibold">Demo Mode</p>
                <p className="text-xs text-yellow-300/80 mt-1">{connectionError}</p>
                <p className="text-xs text-gray-400 mt-2">
                  UI is fully functional. Live data will be available once backend SSL is configured.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-xl bg-[#161616] px-4 py-4 text-white">
          <header className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">{matchData.league}</span>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-white">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
              <span>{liveLabel}</span>
            </div>
          </header>
          <div className="flex w-full mt-4 items-center justify-between gap-4">
            <TeamPill name={homeTeam} align="left" logoUrl={currentMatch?.home_team_logo || ''} />

            <div className="flex w-fit items-center justify-center text-white">
              <span className="text-2xl font-semibold leading-none">{homeScore}</span>
              <span className="text-2xl font-light text-white/60">-</span>
              <span className="text-2xl font-semibold leading-none">{awayScore}</span>
            </div>

            <TeamPill name={awayTeam} align="right" logoUrl={currentMatch?.away_team_logo || ''} />
          </div>
        </div>

        <CustomTab tabs={['Momentum Trading', 'Leaderboard']} defaultTab={0} onTabChange={setActiveTab} />

        {activeTab === 0 && (
          <div className="flex flex-col gap-4">
            <div className="bg-zinc-900 flex items-center justify-center rounded-xl">
              <div className="w-full max-w-2xl aspect-311/201 p-4">
                <SoccerPitchCanvas />
                {momentumData.length > 0 && (
                  <Momentum
                    home={currentMomentum}
                    away={100 - currentMomentum}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    isLive={true}
                  />
                )}
              </div>
            </div>

            {/* Live Momentum Chart */}
            <TestLiveMatchChart momentumData={momentumData} theme={theme} />
          </div>
        )}

        {activeTab === 1 && <Leaderboard isActive={activeTab === 1} />}

        {/* Positions and Actions Section */}
        <TestPositionsAndActions
          match_id={matchId}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          entry={currentMomentum}
          time_in_match={time}
        />

        {!isConnected && momentumData.length === 0 && (
          <div className="py-4">
            <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6 text-center">
              <WifiOff className="mx-auto mb-3 text-gray-500" size={32} />
              <h3 className="text-sm font-semibold text-gray-300 mb-1">Awaiting Live Data</h3>
              <p className="text-xs text-gray-500">
                Match momentum tracking will appear here once the connection is established
              </p>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
