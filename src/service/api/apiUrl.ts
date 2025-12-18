import { futstarURL, futstarWsUrl } from './baseUrl';

type PositionDuration = '30s' | '1m' | '2m' | '5m';

export const apiUrl = {
  // matches
  postMatchRefresh: `${futstarURL}/matches/refresh_matches_status`,
  getMatchMetadata: (matchId: string) => `${futstarURL}/matches/metadata?match_id=${matchId}`,
  getAllMatches: (type: 'Live' | 'Scheduled' | 'Testing') => `${futstarURL}/matches/all?status=${type}`,
  // users
  createUser: (userWallet?: string, telegramHandle?: string) => {
    const params = new URLSearchParams();
    if (userWallet) params.append('user_wallet', userWallet);
    if (telegramHandle) params.append('telegram_handle', telegramHandle);

    const queryString = params.toString();
    return `${futstarURL}/users/create${queryString ? `?${queryString}` : ''}`;
  },
  getUserMetadata: (userId: string) => `${futstarURL}/users/metadata?user_id=${userId}`,
  getUserClosedPositions: (userId: string) => ` ${futstarURL}/users/closed_positions_history?user_id=${userId}`,
  getUserMissions: (userId: string, isClaimed: boolean) =>
    `${futstarURL}/users/missions?user_id=${userId}&is_claimed=${isClaimed}`,
  // missions
  claimMission: (userId: string, missionId: string) =>
    `${futstarURL}/missions/claim?user_id=${userId}&mission_id=${missionId}`,
  getSocialUrl: (userId: string, missionId: string, platform: string) =>
    `${futstarURL}/missions/social_url?user_id=${userId}&mission_id=${missionId}&social_platform=${platform}`,
  // momentum positions
  getStartIngestion: (matchId: string) => `${futstarURL}/momentum/start_ingestion?match_id=${matchId}`,
  getHistoricalMomentumData: (matchId: string) => `${futstarURL}/momentum/full_match_index?match_id=${matchId}`,
  getMomentumOpenPositions: (userId: string, matchId: string) =>
    `${futstarURL}/momentum/opening_positions?user_id=${userId}&match_id=${matchId}`,
  getMatchUserRanking: (matchId: string, top: number) =>
    `${futstarURL}/momentum/total_pnl_ranking?match_id=${matchId}&top_n=${top}`,
  createPosition: (
    user_id: string,
    match_id: string,
    time_in_match: string,
    type: 'Long' | 'Short',
    entry: number,
    amount: number,
    duration: PositionDuration,
  ) =>
    `${futstarURL}/momentum/positions?user_id=${user_id}&match_id=${match_id}&time_in_match=${time_in_match}&type=${type}&entry=${entry}&amount=${amount}&duration=${duration}`,
  // web socket
  getMomentumWebSocket: (matchId: string) => `${futstarWsUrl}/momentum/${matchId}/ws`,
  getOpenPositionWebSocket: (positionId: string) => `${futstarWsUrl}/position/${positionId}/ws`,
  // websocket for testing
  getMomentumTestingWebSocket: (matchId: string) => `${futstarWsUrl}/testing/momentum/${matchId}/ws`,
  getOpenPositionTestingWebSocket: (
    positionId: string,
    timeInMatch: string,
    duration: string,
    amount: number,
    type: 'long' | 'short',
  ) => `${futstarWsUrl}/testing/position/${positionId}/${timeInMatch}/${duration}/${amount}/${type}/ws`,
};
