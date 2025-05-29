import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, MapPin, Trophy, Shield } from "lucide-react";
import type { Match, MatchScore, Team } from "@shared/schema";

interface MatchSummaryProps {
  match: Match;
  scores?: MatchScore[];
}

export default function MatchSummary({ match, scores }: MatchSummaryProps) {
  // Get team information
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Get team details by ID
  const getTeamName = (teamId: number) => {
    const team = teams?.find(t => t.id === teamId);
    return team ? team.name : `Team #${teamId}`;
  };

  // Get team logo if available
  const getTeamLogo = (teamId: number) => {
    const team = teams?.find(t => t.id === teamId);
    return team?.logoUrl;
  };

  // Format match date and time
  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatMatchTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get team score
  const getTeamScore = (teamId: number) => {
    if (!scores) return null;
    return scores.find(s => s.teamId === teamId);
  };

  // Calculate win probability based on current scores (simplified)
  const calculateWinProbability = () => {
    if (match.status !== "live" || !scores || scores.length < 2) return null;

    const team1Score = getTeamScore(match.team1Id);
    const team2Score = getTeamScore(match.team2Id);

    if (!team1Score || !team2Score) return null;

    // Simple probability based on current runs (just for illustration)
    const totalRuns = team1Score.runs + team2Score.runs;
    if (totalRuns === 0) return { team1: 50, team2: 50 };

    const team1Prob = Math.round((team1Score.runs / totalRuns) * 100);
    return { team1: team1Prob, team2: 100 - team1Prob };
  };

  const winProbability = calculateWinProbability();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Match Summary</CardTitle>
          <Badge variant={match.status === "live" ? "destructive" : 
                         match.status === "completed" ? "secondary" : 
                         "outline"}>
            {match.status.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {/* Match Info */}
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            {formatMatchDate(match.matchDate)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2" />
            {formatMatchTime(match.matchDate)}
          </div>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            {match.venue}
          </div>
          <div className="flex items-center text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            {match.matchType.toUpperCase()}
          </div>
        </div>

        {/* Teams */}
        <div className="relative">
          {/* Team 1 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-3">
                {getTeamLogo(match.team1Id) ? (
                  <img 
                    src={getTeamLogo(match.team1Id)} 
                    alt={getTeamName(match.team1Id)} 
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <Shield className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <Link href={`/team/${match.team1Id}`}>
                <div className="hover:text-primary cursor-pointer">
                  <h3 className="font-semibold">{getTeamName(match.team1Id)}</h3>
                  {getTeamScore(match.team1Id) && (
                    <p className="text-sm font-medium">
                      {getTeamScore(match.team1Id)?.runs}/{getTeamScore(match.team1Id)?.wickets} 
                      {getTeamScore(match.team1Id)?.overs && ` (${getTeamScore(match.team1Id)?.overs})`}
                    </p>
                  )}
                </div>
              </Link>
            </div>
            {match.winnerId === match.team1Id && (
              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Winner
              </Badge>
            )}
          </div>

          {/* VS */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">VS</span>
          </div>

          {/* Team 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-3">
                {getTeamLogo(match.team2Id) ? (
                  <img 
                    src={getTeamLogo(match.team2Id)} 
                    alt={getTeamName(match.team2Id)} 
                    className="w-10 h-10 object-contain"
                  />
                ) : (
                  <Shield className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <Link href={`/team/${match.team2Id}`}>
                <div className="hover:text-primary cursor-pointer">
                  <h3 className="font-semibold">{getTeamName(match.team2Id)}</h3>
                  {getTeamScore(match.team2Id) && (
                    <p className="text-sm font-medium">
                      {getTeamScore(match.team2Id)?.runs}/{getTeamScore(match.team2Id)?.wickets}
                      {getTeamScore(match.team2Id)?.overs && ` (${getTeamScore(match.team2Id)?.overs})`}
                    </p>
                  )}
                </div>
              </Link>
            </div>
            {match.winnerId === match.team2Id && (
              <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Winner
              </Badge>
            )}
          </div>
        </div>

        {/* Win Probability (only shown for live matches) */}
        {match.status === "live" && winProbability && (
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span>{getTeamName(match.team1Id)}</span>
              <span>{getTeamName(match.team2Id)}</span>
            </div>
            <div className="relative pt-1">
              <div className="flex h-4 overflow-hidden text-xs bg-muted rounded">
                <div
                  style={{ width: `${winProbability.team1}%` }}
                  className="flex flex-col justify-center text-center text-white bg-blue-500 shadow-none whitespace-nowrap"
                ></div>
                <div
                  style={{ width: `${winProbability.team2}%` }}
                  className="flex flex-col justify-center text-center text-white bg-green-500 shadow-none whitespace-nowrap"
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span>{winProbability.team1}%</span>
                <span className="text-xs text-muted-foreground">Win probability</span>
                <span>{winProbability.team2}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Match Result */}
        {match.status === "completed" && match.winnerId && (
          <div className="mt-6 text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Trophy className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="font-medium text-green-800 dark:text-green-300">
              {getTeamName(match.winnerId)} won the match
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
