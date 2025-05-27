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
import { Calendar, MapPin, Users, Trophy, Clock, TrendingUp } from "lucide-react";
import type { Match, MatchScore, BallByBall } from "@shared/schema";

export default function MatchDetail() {
  const { id } = useParams();
  const { user } = useAuth();

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
          {/* Match Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">Match Details</h1>
                    {getStatusBadge(match.status)}
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(match.matchDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(match.matchDate).toLocaleTimeString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.venue}
                    </div>
                    <Badge variant="outline">{match.matchType}</Badge>
                  </div>
                </div>
                {canManageMatch && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit Match
                    </Button>
                    {match.status === "scheduled" && (
                      <Button size="sm">
                        Start Match
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>

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
                      {score.runs}/{score.wickets}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      ({score.overs} overs)
                    </div>
                    {score.extras > 0 && (
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
                  {scoresLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading scorecard...</p>
                    </div>
                  ) : scores && scores.length > 0 ? (
                    <div className="space-y-4">
                      {scores.map((score) => (
                        <div key={score.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold">Team {score.teamId} - Innings {score.innings}</h4>
                              <p className="text-2xl font-bold text-primary">
                                {score.runs}/{score.wickets} ({score.overs} overs)
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Run Rate</p>
                              <p className="font-semibold">
                                {score.overs !== "0.0" ? (score.runs / parseFloat(score.overs)).toFixed(2) : "0.00"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No scorecard data available</p>
                    </div>
                  )}
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
                                {ball.extras > 0 && (
                                  <span className="text-blue-600"> + {ball.extras} extra{ball.extras !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(ball.timestamp!).toLocaleTimeString()}
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

              {latestBall && match.status === "live" && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      Latest Ball
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg">
                      Over {latestBall.over}.{latestBall.ball} - {latestBall.runs} run{latestBall.runs !== 1 ? 's' : ''}
                      {latestBall.isWicket && (
                        <span className="text-red-600 font-bold"> - WICKET!</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="statistics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Detailed statistics will be available here</p>
                  </div>
                </CardContent>
              </Card>
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
