import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import MatchCard from "@/components/match-card";
import { Heart, TrendingUp, Users, User, Trophy, Calendar, Clock, MapPin } from "lucide-react";
import type { Match, MatchScore, Team, Player } from "@shared/schema";
import { Link } from "wouter";

export default function FanDashboard() {
  const { data: liveMatches, isLoading: liveLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", { status: "live" }],
  });

  const { data: upcomingMatches, isLoading: upcomingLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", { status: "upcoming" }],
  });

  const { data: recentMatches, isLoading: recentLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", { status: "completed" }],
  });

  const { data: allScores, isLoading: scoresLoading } = useQuery<MatchScore[]>({
    queryKey: ["/api/matches/scores"],
  });

  const { data: followedTeams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/users/me/teams/following"],
  });

  const { data: followedPlayers, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/users/me/players/following"],
  });

  const getMatchScores = (matchId: number) => {
    return allScores?.filter(score => score.matchId === matchId) || [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Cricket Fan Dashboard</h1>
        <p className="text-muted-foreground">Stay updated with live matches, follow your favorite teams, and engage with the cricket community</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Matches</p>
                <p className="text-3xl font-bold text-primary">
                  {liveMatches?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold text-primary">
                  {upcomingMatches?.length || 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teams Following</p>
                <p className="text-3xl font-bold text-primary">
                  {followedTeams?.length || 0}
                </p>
              </div>
              <Heart className="w-12 h-12 text-pink-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Players Following</p>
                <p className="text-3xl font-bold text-primary">
                  {followedPlayers?.length || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Live Matches */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Live Matches</h2>
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                LIVE
              </Badge>
            </div>
            
            {liveLoading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : liveMatches && liveMatches.length > 0 ? (
              <div className="space-y-4">
                {liveMatches.slice(0, 3).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={getMatchScores(match.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Live Matches</h3>
                  <p className="text-muted-foreground">Check back later for live cricket action!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Upcoming Matches */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">Upcoming Matches</h2>
            
            {upcomingLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                        <div className="h-8 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-4">
                {upcomingMatches.slice(0, 5).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={getMatchScores(match.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Matches</h3>
                  <p className="text-muted-foreground">No matches scheduled at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Following Teams */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Teams You Follow</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/fan-following?tab=teams">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamsLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-10 w-10 bg-muted rounded-md mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : followedTeams && followedTeams.length > 0 ? (
                  <div className="space-y-3">
                    {followedTeams.slice(0, 3).map((team) => (
                      <div key={team.id} className="flex items-center p-2 rounded-lg border hover:bg-accent">
                        <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center mr-3">
                          {team.logoUrl ? (
                            <img src={team.logoUrl} alt={team.name} className="h-8 w-8 object-contain" />
                          ) : (
                            <Users className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <Link href={`/team/${team.id}`}>
                            <h4 className="font-medium hover:text-primary">{team.name}</h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">{team.location}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Start following teams to see them here
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link href="/teams-browse">Browse Teams</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Following Players */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Players You Follow</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/fan-following?tab=players">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {playersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center">
                        <div className="h-10 w-10 bg-muted rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded mb-2"></div>
                          <div className="h-3 bg-muted rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : followedPlayers && followedPlayers.length > 0 ? (
                  <div className="space-y-3">
                    {followedPlayers.slice(0, 3).map((player) => (
                      <div key={player.id} className="flex items-center p-2 rounded-lg border hover:bg-accent">
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <Link href={`/player/${player.id}`}>
                            <h4 className="font-medium hover:text-primary">Player #{player.userId}</h4>
                          </Link>
                          <p className="text-xs text-muted-foreground">{player.position || 'Player'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Start following players to track their performance
                    </p>
                    <Button variant="outline" size="sm" className="mt-2" asChild>
                      <Link href="/players-browse">Browse Players</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Results */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Results</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : recentMatches && recentMatches.length > 0 ? (
                <div className="space-y-4">
                  {recentMatches.slice(0, 5).map((match) => {
                    const matchScores = getMatchScores(match.id);
                    return (
                      <div key={match.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">
                              Team {match.team1Id} vs Team {match.team2Id}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.venue}
                            </div>
                          </div>
                          <div className="text-right">
                            {match.winnerId && (
                              <div className="text-xs text-green-600 dark:text-green-400">
                                Team {match.winnerId} won
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">No recent matches</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
