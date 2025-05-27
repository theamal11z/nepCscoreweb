import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, 
  Trophy, 
  Target, 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  Users, 
  Award,
  Activity,
  Heart,
  Plus
} from "lucide-react";
import type { Player, PlayerStat, User as UserType, Match, MatchScore } from "@shared/schema";

export default function PlayerProfile() {
  const { id } = useParams();

  const { data: player, isLoading: playerLoading } = useQuery<Player>({
    queryKey: [`/api/players/${id}`],
  });

  const { data: user, isLoading: userLoading } = useQuery<UserType>({
    queryKey: [`/api/users/${player?.userId}`],
    enabled: !!player?.userId,
  });

  const { data: playerStats, isLoading: statsLoading } = useQuery<PlayerStat[]>({
    queryKey: [`/api/players/${id}/stats`],
    enabled: !!id,
  });

  const { data: recentMatches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", { status: "completed" }],
  });

  const { data: allScores } = useQuery<MatchScore[]>({
    queryKey: ["/api/matches/scores"],
  });

  if (playerLoading || userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading player profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!player || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Player Not Found</h1>
              <p className="text-muted-foreground">The player profile you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate career statistics
  const careerStats = playerStats?.reduce(
    (acc, stat) => ({
      totalRuns: acc.totalRuns + stat.runs,
      totalBallsFaced: acc.totalBallsFaced + stat.ballsFaced,
      totalFours: acc.totalFours + stat.fours,
      totalSixes: acc.totalSixes + stat.sixes,
      totalWickets: acc.totalWickets + stat.wicketsTaken,
      totalCatches: acc.totalCatches + stat.catches,
      matchesPlayed: acc.matchesPlayed + 1,
      highestScore: Math.max(acc.highestScore, stat.runs),
    }),
    {
      totalRuns: 0,
      totalBallsFaced: 0,
      totalFours: 0,
      totalSixes: 0,
      totalWickets: 0,
      totalCatches: 0,
      matchesPlayed: 0,
      highestScore: 0,
    }
  ) || {
    totalRuns: 0,
    totalBallsFaced: 0,
    totalFours: 0,
    totalSixes: 0,
    totalWickets: 0,
    totalCatches: 0,
    matchesPlayed: 0,
    highestScore: 0,
  };

  const battingAverage = careerStats.matchesPlayed > 0 ? (careerStats.totalRuns / careerStats.matchesPlayed).toFixed(2) : "0.00";
  const strikeRate = careerStats.totalBallsFaced > 0 ? ((careerStats.totalRuns / careerStats.totalBallsFaced) * 100).toFixed(2) : "0.00";
  const bowlingAverage = careerStats.totalWickets > 0 ? "N/A" : "No wickets";

  const getPlayerMatches = () => {
    if (!playerStats || !recentMatches) return [];
    
    const playerMatchIds = playerStats.map(stat => stat.matchId);
    return recentMatches.filter(match => playerMatchIds.includes(match.id));
  };

  const playerMatches = getPlayerMatches();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Player Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{user.fullName}</h1>
                    <p className="text-lg text-muted-foreground mb-3">@{user.username}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="default">Player</Badge>
                      {player.isApproved ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending Approval</Badge>
                      )}
                      {player.teamId && (
                        <Badge variant="outline">Team Member</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Playing Information</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Position:</span>
                          <span className="font-medium">{player.position || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Batting Style:</span>
                          <span className="font-medium">{player.battingStyle || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bowling Style:</span>
                          <span className="font-medium">{player.bowlingStyle || "Not specified"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Team:</span>
                          <span className="font-medium">{player.teamId ? `Team ${player.teamId}` : "No team"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">Career Highlights</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Matches Played:</span>
                          <span className="font-medium">{careerStats.matchesPlayed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Runs:</span>
                          <span className="font-medium">{careerStats.totalRuns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Highest Score:</span>
                          <span className="font-medium">{careerStats.highestScore || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Wickets:</span>
                          <span className="font-medium">{careerStats.totalWickets}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full lg:w-auto">
                    <Heart className="w-4 h-4 mr-2" />
                    Follow Player
                  </Button>
                  <Button variant="outline" className="w-full lg:w-auto">
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Team
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics Overview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batting Average</p>
                    <p className="text-3xl font-bold text-primary">{battingAverage}</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Strike Rate</p>
                    <p className="text-3xl font-bold text-primary">{strikeRate}%</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                    <p className="text-3xl font-bold text-primary">{careerStats.totalRuns}</p>
                  </div>
                  <Target className="w-12 h-12 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wickets</p>
                    <p className="text-3xl font-bold text-primary">{careerStats.totalWickets}</p>
                  </div>
                  <Trophy className="w-12 h-12 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Statistics */}
          <Tabs defaultValue="statistics" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="matches">Match History</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="career">Career Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="statistics" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Batting Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Batting Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Matches Played</span>
                        <span className="font-semibold text-lg">{careerStats.matchesPlayed}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Total Runs</span>
                        <span className="font-semibold text-lg">{careerStats.totalRuns}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Highest Score</span>
                        <span className="font-semibold text-lg">{careerStats.highestScore || "N/A"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Balls Faced</span>
                        <span className="font-semibold text-lg">{careerStats.totalBallsFaced}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Batting Average</span>
                        <span className="font-semibold text-lg text-primary">{battingAverage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Strike Rate</span>
                        <span className="font-semibold text-lg text-primary">{strikeRate}%</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Fours Hit</span>
                        <span className="font-semibold text-lg">{careerStats.totalFours}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Sixes Hit</span>
                        <span className="font-semibold text-lg">{careerStats.totalSixes}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bowling & Fielding Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bowling & Fielding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Wickets Taken</span>
                        <span className="font-semibold text-lg">{careerStats.totalWickets}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Bowling Average</span>
                        <span className="font-semibold text-lg">{bowlingAverage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Economy Rate</span>
                        <span className="font-semibold text-lg">N/A</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Catches</span>
                        <span className="font-semibold text-lg">{careerStats.totalCatches}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Stumps</span>
                        <span className="font-semibold text-lg">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Run Outs</span>
                        <span className="font-semibold text-lg">0</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : playerStats && playerStats.length > 0 ? (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Performance chart visualization coming soon</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No performance data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-foreground">Match History</h2>
                <Badge variant="outline">{playerMatches.length} matches</Badge>
              </div>

              {statsLoading || matchesLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
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
              ) : playerStats && playerStats.length > 0 ? (
                <div className="space-y-4">
                  {playerStats.slice(0, 10).map((stat) => {
                    const match = recentMatches?.find(m => m.id === stat.matchId);
                    return (
                      <Card key={stat.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h4 className="font-semibold">
                                  {match ? `Team ${match.team1Id} vs Team ${match.team2Id}` : `Match #${stat.matchId}`}
                                </h4>
                                {match && (
                                  <Badge variant="outline">{match.matchType}</Badge>
                                )}
                              </div>
                              {match && (
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {match.venue}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(match.matchDate).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                              <div>
                                <p className="text-sm text-muted-foreground">Runs</p>
                                <p className="text-lg font-bold text-primary">{stat.runs}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Balls</p>
                                <p className="text-lg font-semibold">{stat.ballsFaced}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">4s/6s</p>
                                <p className="text-lg font-semibold">{stat.fours}/{stat.sixes}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Wickets</p>
                                <p className="text-lg font-semibold">{stat.wicketsTaken}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">SR</p>
                                <p className="text-lg font-semibold">
                                  {stat.ballsFaced > 0 ? ((stat.runs / stat.ballsFaced) * 100).toFixed(1) : "0.0"}%
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Match History</h3>
                    <p className="text-muted-foreground">This player hasn't played any matches yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Achievements & Milestones</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Dynamic achievements based on stats */}
                {careerStats.totalRuns >= 100 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Century Maker</h3>
                      <p className="text-sm text-muted-foreground">Scored 100+ runs in career</p>
                      <Badge variant="default" className="mt-2">
                        {careerStats.totalRuns} runs
                      </Badge>
                    </CardContent>
                  </Card>
                )}
                
                {careerStats.totalSixes >= 10 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Big Hitter</h3>
                      <p className="text-sm text-muted-foreground">Hit 10+ sixes in career</p>
                      <Badge variant="default" className="mt-2">
                        {careerStats.totalSixes} sixes
                      </Badge>
                    </CardContent>
                  </Card>
                )}
                
                {careerStats.totalWickets >= 5 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Wicket Taker</h3>
                      <p className="text-sm text-muted-foreground">Took 5+ wickets in career</p>
                      <Badge variant="default" className="mt-2">
                        {careerStats.totalWickets} wickets
                      </Badge>
                    </CardContent>
                  </Card>
                )}
                
                {careerStats.matchesPlayed >= 10 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Experienced Player</h3>
                      <p className="text-sm text-muted-foreground">Played 10+ matches</p>
                      <Badge variant="default" className="mt-2">
                        {careerStats.matchesPlayed} matches
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {careerStats.highestScore >= 50 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Half Century</h3>
                      <p className="text-sm text-muted-foreground">Scored 50+ in a match</p>
                      <Badge variant="default" className="mt-2">
                        High Score: {careerStats.highestScore}
                      </Badge>
                    </CardContent>
                  </Card>
                )}

                {/* Show message if no achievements */}
                {careerStats.totalRuns < 100 && careerStats.totalSixes < 10 && careerStats.totalWickets < 5 && 
                 careerStats.matchesPlayed < 10 && careerStats.highestScore < 50 && (
                  <div className="col-span-full">
                    <Card>
                      <CardContent className="p-8 text-center">
                        <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                        <p className="text-muted-foreground">
                          Achievements will appear here as the player reaches milestones
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-6">
              <h2 className="text-2xl font-bold text-foreground">Career Timeline</h2>
              
              <Card>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">Joined nepCscore</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.createdAt || "").toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {player.isApproved && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <Award className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Player Status Approved</h4>
                          <p className="text-sm text-muted-foreground">
                            Approved to play in organized matches
                          </p>
                        </div>
                      </div>
                    )}

                    {player.teamId && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Joined Team {player.teamId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Became a team member
                          </p>
                        </div>
                      </div>
                    )}

                    {careerStats.matchesPlayed > 0 && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-semibold">First Match Played</h4>
                          <p className="text-sm text-muted-foreground">
                            Started cricket journey on nepCscore
                          </p>
                        </div>
                      </div>
                    )}

                    {careerStats.matchesPlayed === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Career timeline will show here as the player achieves milestones</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
