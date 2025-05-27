import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Clock, Trophy, Eye } from "lucide-react";
import { Link } from "wouter";
import type { Match, MatchScore } from "@shared/schema";

interface MatchCardProps {
  match: Match;
  scores?: MatchScore[];
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function MatchCard({ match, scores, showActions = false, onEdit, onDelete }: MatchCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return (
          <Badge variant="destructive" className="animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
            LIVE
          </Badge>
        );
      case "completed":
        return <Badge variant="secondary">COMPLETED</Badge>;
      case "scheduled":
        return <Badge variant="outline">SCHEDULED</Badge>;
      case "cancelled":
        return <Badge variant="secondary">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const getTeamScore = (teamId: number, innings?: number) => {
    if (!scores) return null;
    const teamScore = scores.find(s => s.teamId === teamId && (!innings || s.innings === innings));
    if (!teamScore) return "Yet to bat";
    return `${teamScore.runs}/${teamScore.wickets} (${teamScore.overs})`;
  };

  const getWinnerText = () => {
    if (match.status !== "completed" || !match.winnerId) return null;
    const winnerScore = scores?.find(s => s.teamId === match.winnerId);
    if (!winnerScore) return "Match completed";
    
    const loserScore = scores?.find(s => s.teamId !== match.winnerId);
    if (!loserScore) return "Match completed";
    
    const runDifference = winnerScore.runs - loserScore.runs;
    const wicketDifference = 10 - winnerScore.wickets;
    
    if (winnerScore.innings === 2) {
      return `Team ${match.winnerId} won by ${wicketDifference} wickets`;
    } else {
      return `Team ${match.winnerId} won by ${runDifference} runs`;
    }
  };

  const formatMatchDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (Math.abs(diffInHours) < 24) {
      if (diffInHours > 0) {
        return `In ${Math.ceil(diffInHours)} hours`;
      } else {
        return `${Math.ceil(Math.abs(diffInHours))} hours ago`;
      }
    }
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {getStatusBadge(match.status)}
            <Badge variant="outline">{match.matchType}</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            {formatMatchDate(match.matchDate)}
          </div>
        </div>

        {/* Teams */}
        <div className="space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Team {match.team1Id}</div>
                <div className="text-sm text-muted-foreground">Home</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg">
                {getTeamScore(match.team1Id, 1)}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-xs text-muted-foreground font-medium">VS</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                <Users className="text-white w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">Team {match.team2Id}</div>
                <div className="text-sm text-muted-foreground">Away</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-lg">
                {getTeamScore(match.team2Id, 2)}
              </div>
            </div>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {match.venue}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {new Date(match.matchDate).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>

        {/* Winner or Status */}
        {match.status === "completed" && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg mb-4">
            <Trophy className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {getWinnerText()}
            </span>
          </div>
        )}

        {match.status === "live" && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg mb-4">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Match in progress
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Link href={`/match/${match.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </Link>
          
          {showActions && (
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="destructive" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
