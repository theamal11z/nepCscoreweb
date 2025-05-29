import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LiveScoring from "@/components/live-scoring";
import MatchSummary from "@/components/match-summary";
import PlayerMatchStats from "@/components/player-match-stats";
import { Calendar, MapPin, Users, Trophy, Clock, TrendingUp, Share2, Heart } from "lucide-react";
import type { Match, MatchScore, BallByBall, PlayerStat, Team } from "@shared/schema";
import { useToast } from "@/components/ui/use-toast";

export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: match, isLoading: matchLoading } = useQuery<Match>({
    queryKey: [`/api/matches/${id}`],
  });

  const { data: scores, isLoading: scoresLoading } = useQuery<MatchScore[]>({
    queryKey: [`/api/matches/${id}/scores`],
  });

  const { data: balls, isLoading: ballsLoading } = useQuery<BallByBall[]>({
    queryKey: [`/api/matches/${id}/balls`],
  });

  const { data: latestBall } = useQuery<BallByBall>({
    queryKey: [`/api/matches/${id}/latest-ball`],
    refetchInterval: match?.status === "live" ? 5000 : false,
  });
  
  const { data: playerStats } = useQuery<PlayerStat[]>({
    queryKey: [`/api/matches/${id}/player-stats`],
  });
  
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  if (matchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading match details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-2">Match Not Found</h1>
              <p className="text-muted-foreground">The match you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="animate-pulse">LIVE</Badge>;
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

  const canManageMatch = user && (user.role === "organizer" || user.role === "admin") && match.organizerId === user.id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Match Header - Match Summary and Quick Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8">
            <div className="w-full lg:w-2/3">
              <h1 className="text-3xl font-bold mb-6">Match Details</h1>
              <MatchSummary match={match} scores={scores} />
            </div>
            
            <div className="w-full lg:w-1/3 space-y-4">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({
                      title: "Link copied",
                      description: "Match link copied to clipboard",
                    });
                  }}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  
                  {/* Follow Teams Buttons */}
                  {teams && (
                    <>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Team 1
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Team 2
                      </Button>
                    </>
                  )}
                  
                  {canManageMatch && match.status !== "completed" && (
                    <Button variant="default" size="sm" className="col-span-2" asChild>
                      <a href={`/match/${id}/scoring`}>Score This Match</a>
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Match Information Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Match Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Format</div>
                    <div className="font-medium">{match.matchType.toUpperCase()}</div>
                    
                    <div className="text-muted-foreground">Venue</div>
                    <div className="font-medium">{match.venue}</div>
                    
                    <div className="text-muted-foreground">Date</div>
                    <div className="font-medium">{new Date(match.matchDate).toLocaleDateString()}</div>
                    
                    <div className="text-muted-foreground">Time</div>
                    <div className="font-medium">
                      {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    
                    <div className="text-muted-foreground">Status</div>
                    <div>{getStatusBadge(match.status)}</div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Live Updates Card - Only shown for live matches */}
              {match.status === "live" && latestBall && (
                <Card className="border-destructive">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <CardTitle className="text-lg">Live Updates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Current Over</div>
                      <div className="text-xl font-bold">Over {latestBall.over}.{latestBall.ball}</div>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-lg font-bold">
                          {latestBall.runs} {latestBall.extras && latestBall.extras > 0 ? `+ ${latestBall.extras}` : ''}
                        </Badge>
                        {latestBall.isWicket && (
                          <Badge variant="destructive">WICKET!</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Teams and Scores */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {scores?.map((score, index) => (
              <Card key={score.id} className={score.innings === 1 ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Users className="text-white" />
                      </div>
                      <div>
                        <div className="font-bold">Team {score.teamId}</div>
                        <div className="text-sm text-muted-foreground">
                          Innings {score.innings}
                        </div>
                      </div>
                    </div>
                    {match.winnerId === score.teamId && (
                      <Trophy className="text-yellow-500" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {score.runs ?? 0}/{score.wickets ?? 0}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      ({score.overs} overs)
                    </div>
                    {score.extras && score.extras > 0 && (
                      <div className="text-sm text-muted-foreground mt-2">
                        Extras: {score.extras}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Match Tabs */}
          <Tabs defaultValue="scorecard" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
              <TabsTrigger value="commentary">Commentary</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              {canManageMatch && (
                <TabsTrigger value="scoring">Live Scoring</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="scorecard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Team 1 {match.team1Id && `(ID: ${match.team1Id})`}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {scores?.find((s) => s.teamId === match.team1Id)?.runs ?? 0}/
                          {scores?.find((s) => s.teamId === match.team1Id)?.wickets ?? 0} 
                          ({scores?.find((s) => s.teamId === match.team1Id)?.overs ?? 0} overs)
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-2">
                          Team 2 {match.team2Id && `(ID: ${match.team2Id})`}
                        </h3>
                        <div className="text-sm text-muted-foreground">
                          {scores?.find((s) => s.teamId === match.team2Id)?.runs ?? 0}/
                          {scores?.find((s) => s.teamId === match.team2Id)?.wickets ?? 0}
                          ({scores?.find((s) => s.teamId === match.team2Id)?.overs ?? 0} overs)
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Result</h3>
                      <div className="text-sm">
                        {match.result || "Match result not available"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="commentary" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ball-by-Ball Commentary</CardTitle>
                </CardHeader>
                <CardContent>
                  {ballsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading commentary...</p>
                    </div>
                  ) : balls && balls.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {balls.reverse().map((ball) => (
                        <div key={ball.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">
                                Over {ball.over}.{ball.ball}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {ball.runs} run{ball.runs !== 1 ? 's' : ''}
                                {ball.isWicket && (
                                  <span className="text-red-600 font-medium"> - WICKET!</span>
                                )}
                                {ball.extras && ball.extras > 0 && (
                                  <span className="text-blue-600"> + {ball.extras} extra{ball.extras !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {ball.timestamp && new Date(ball.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No commentary available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <PlayerMatchStats matchId={parseInt(id!)} />
            </TabsContent>

            {canManageMatch && (
              <TabsContent value="scoring" className="space-y-6">
                <LiveScoring matchId={parseInt(id!)} />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
