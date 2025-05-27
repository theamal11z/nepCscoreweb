import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MatchCard from "@/components/match-card";
import { BarChart3, Trophy, Target, TrendingUp, Calendar, Users, Award, Activity } from "lucide-react";
import type { Player, PlayerStat, Match, MatchScore } from "@shared/schema";

export default function PlayerDashboard() {
  const { user } = useAuth();

  const { data: playerProfile, isLoading: profileLoading } = useQuery<Player>({
    queryKey: ["/api/players/me"],
    enabled: !!user,
  });

  const { data: playerStats, isLoading: statsLoading } = useQuery<PlayerStat[]>({
    queryKey: [`/api/players/${playerProfile?.id}/stats`],
    enabled: !!playerProfile?.id,
  });

  const { data: recentMatches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches", { status: "completed" }],
  });

  const { data: allScores } = useQuery<MatchScore[]>({
    queryKey: ["/api/matches/scores"],
  });

  const getMatchScores = (matchId: number) => {
    return allScores?.filter(score => score.matchId === matchId) || [];
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
    }),
    {
      totalRuns: 0,
      totalBallsFaced: 0,
      totalFours: 0,
      totalSixes: 0,
      totalWickets: 0,
      totalCatches: 0,
      matchesPlayed: 0,
    }
  ) || {
    totalRuns: 0,
    totalBallsFaced: 0,
    totalFours: 0,
    totalSixes: 0,
    totalWickets: 0,
    totalCatches: 0,
    matchesPlayed: 0,
  };

  const battingAverage = careerStats.matchesPlayed > 0 ? (careerStats.totalRuns / careerStats.matchesPlayed).toFixed(2) : "0.00";
  const strikeRate = careerStats.totalBallsFaced > 0 ? ((careerStats.totalRuns / careerStats.totalBallsFaced) * 100).toFixed(2) : "0.00";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Player Dashboard</h1>
        <p className="text-muted-foreground">Track your performance, analyze statistics, and grow your cricket career</p>
      </div>

      {/* Player Profile Status */}
      {profileLoading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      ) : !playerProfile ? (
        <Card className="mb-8 border-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Create Your Player Profile</h3>
                <p className="text-muted-foreground">
                  Set up your player profile to start tracking your cricket statistics and join teams.
                </p>
              </div>
              <Button>Create Profile</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                  <Users className="text-white w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{user?.fullName}</h3>
                  <p className="text-muted-foreground">
                    {playerProfile.position && `${playerProfile.position} • `}
                    {playerProfile.battingStyle && `${playerProfile.battingStyle} batsman`}
                    {playerProfile.bowlingStyle && ` • ${playerProfile.bowlingStyle} bowler`}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={playerProfile.isApproved ? "default" : "secondary"}>
                      {playerProfile.isApproved ? "Approved" : "Pending Approval"}
                    </Badge>
                    {playerProfile.teamId && (
                      <Badge variant="outline">Team Member</Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Career Statistics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Runs</p>
                <p className="text-3xl font-bold text-primary">{careerStats.totalRuns}</p>
              </div>
              <Target className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Batting Average</p>
                <p className="text-3xl font-bold text-primary">{battingAverage}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-green-500" />
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
              <TrendingUp className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Matches Played</p>
                <p className="text-3xl font-bold text-primary">{careerStats.matchesPlayed}</p>
              </div>
              <Calendar className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="matches">Match History</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Batting Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Batting Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Runs</span>
                    <span className="font-semibold">{careerStats.totalRuns}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Balls Faced</span>
                    <span className="font-semibold">{careerStats.totalBallsFaced}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fours</span>
                    <span className="font-semibold">{careerStats.totalFours}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sixes</span>
                    <span className="font-semibold">{careerStats.totalSixes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average</span>
                    <span className="font-semibold">{battingAverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strike Rate</span>
                    <span className="font-semibold">{strikeRate}%</span>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wickets Taken</span>
                    <span className="font-semibold">{careerStats.totalWickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Catches</span>
                    <span className="font-semibold">{careerStats.totalCatches}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bowling Average</span>
                    <span className="font-semibold">
                      {careerStats.totalWickets > 0 ? "N/A" : "No wickets"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Economy Rate</span>
                    <span className="font-semibold">N/A</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Trend</CardTitle>
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
                    <p className="text-muted-foreground">Performance chart coming soon</p>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No performance data available yet</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">Match History</h2>
            <Badge variant="outline">{careerStats.matchesPlayed} matches played</Badge>
          </div>

          {statsLoading ? (
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
          ) : playerStats && playerStats.length > 0 ? (
            <div className="space-y-4">
              {playerStats.slice(0, 10).map((stat) => (
                <Card key={stat.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">Match #{stat.matchId}</h4>
                        <p className="text-sm text-muted-foreground">Performance Summary</p>
                      </div>
                      <div className="text-right">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Runs</p>
                            <p className="font-semibold">{stat.runs}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Wickets</p>
                            <p className="font-semibold">{stat.wicketsTaken}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Catches</p>
                            <p className="font-semibold">{stat.catches}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Match History</h3>
                <p className="text-muted-foreground">Your match statistics will appear here once you start playing</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Achievements & Milestones</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample achievements based on stats */}
            {careerStats.totalRuns >= 100 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Century Maker</h3>
                  <p className="text-sm text-muted-foreground">Scored 100+ runs in career</p>
                </CardContent>
              </Card>
            )}
            
            {careerStats.totalSixes >= 10 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Six Hitter</h3>
                  <p className="text-sm text-muted-foreground">Hit 10+ sixes in career</p>
                </CardContent>
              </Card>
            )}
            
            {careerStats.totalWickets >= 5 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Wicket Taker</h3>
                  <p className="text-sm text-muted-foreground">Took 5+ wickets in career</p>
                </CardContent>
              </Card>
            )}
            
            {careerStats.matchesPlayed >= 10 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <Calendar className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Veteran Player</h3>
                  <p className="text-sm text-muted-foreground">Played 10+ matches</p>
                </CardContent>
              </Card>
            )}
            
            {/* Empty state if no achievements */}
            {careerStats.totalRuns < 100 && careerStats.totalSixes < 10 && careerStats.totalWickets < 5 && careerStats.matchesPlayed < 10 && (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                    <p className="text-muted-foreground">Keep playing to unlock achievements and milestones!</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Team Information</h2>
          
          {playerProfile?.teamId ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                      <Users className="text-white w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">Team {playerProfile.teamId}</h3>
                      <p className="text-muted-foreground">Current Team</p>
                      <Badge variant="default" className="mt-2">Active Member</Badge>
                    </div>
                  </div>
                  <Button variant="outline">View Team Details</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Team Assigned</h3>
                <p className="text-muted-foreground mb-4">
                  Apply to join a team to start playing organized cricket
                </p>
                <Button>Browse Teams</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
