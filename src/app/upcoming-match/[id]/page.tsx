'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageTransition from 'src/components/PageTransition';
import TeamLogo from 'src/components/TeamLogo';
import { ArrowLeft, Lock } from 'lucide-react';
import { apiUrl } from 'src/service/api/apiUrl';
import { MatchData } from 'src/types/global';
import axios from 'axios';
import Image from 'next/image';

function LogoImage({ logoUrl, name }: { logoUrl?: string; name: string }) {
  return (
    <>
      {logoUrl ? (
        <Image src={logoUrl} alt={`${name} logo`} width={80} height={80} />
      ) : (
        <TeamLogo team={name} size={80} />
      )}
    </>
  );
}

export default function UpcomingMatchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  const [fetchedMatch, setFetchedMatch] = useState<MatchData | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(true);

  // Fetch match metadata from API
  useEffect(() => {
    if (!matchId) return;

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
  }, [matchId]);

  // Format date and time from match_date
  const formatMatchDateTime = (dateString: string | null) => {
    if (!dateString) return { date: 'TBD', time: 'TBD' };

    try {
      const date = new Date(dateString);
      const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      return { date: dateFormatted, time: timeFormatted };
    } catch {
      return { date: 'TBD', time: 'TBD' };
    }
  };

  const { date, time } = formatMatchDateTime(fetchedMatch?.match_date || null);

  const matchData = fetchedMatch
    ? {
        league: fetchedMatch.competition?.trim() || 'Unknown League',
        teams: [fetchedMatch.home_team?.trim() || 'Home', fetchedMatch.away_team?.trim() || 'Away'] as [string, string],
        date,
        time,
        status: fetchedMatch.status || 'not-started',
      }
    : {
        league: isLoadingMatch ? 'Loading...' : 'Unknown League',
        teams: [isLoadingMatch ? 'Loading...' : 'Home', isLoadingMatch ? 'Loading...' : 'Away'] as [string, string],
        date: 'TBD',
        time: 'TBD',
        status: 'not-started',
      };

  const [homeTeam, awayTeam] = matchData.teams;

  return (
    <PageTransition direction="forward">
      <div className="flex flex-col h-full relative">
        <div className="px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go home"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-semibold">{`${homeTeam} vs ${awayTeam}`}</h1>
        </div>

        {/* Match Info Card */}
        <div className="px-4 py-6">
          <div className="rounded-2xl p-6 border border-gray-800 hover:border-gray-700">
            {/* Use a 2-row grid: first row for logos/time, second row for names/date to ensure logos align horizontally */}
            <div className="grid grid-cols-3 grid-rows-2 items-center gap-y-2 text-center">
              {/* Logos / Time row */}
              <div className="flex items-center justify-center">
                <LogoImage logoUrl={fetchedMatch?.home_team_logo} name={homeTeam} />
              </div>

              <div className="flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-bold">{matchData.time}</span>
                  <span className="text-gray-400 text-sm">{matchData.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <LogoImage logoUrl={fetchedMatch?.away_team_logo} name={awayTeam} />
              </div>

              {/* Names / (empty under time if needed) row */}
              <div className="flex items-center justify-center">
                <span className="text-lg font-semibold">{homeTeam}</span>
              </div>

              <div className="flex items-center justify-center">
                {/* empty cell under time if additional info is needed, keep center alignment */}
              </div>

              <div className="flex items-center justify-center">
                <span className="text-lg font-semibold">{awayTeam}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Locked State */}
        <div className="px-4 py-8 flex flex-col items-center justify-center gap-4">
          <div className="w-24 h-24 border-2 border-black dark:border-white rounded-full flex items-center justify-center">
            <Lock size={40} />
          </div>
          <h2 className="text-xl text-gray-500 dark:text-gray-200 font-semibold">Match Not Started</h2>
          <p className="text-gray-400 text-center max-w-sm">Momentum trading is only available during live matches</p>
        </div>
      </div>
    </PageTransition>
  );
}
