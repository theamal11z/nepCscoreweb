import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart3, 
  Target, 
  Trophy, 
  Calendar, 
  Filter,
  TrendingUp,
  TrendingDown,
  Award,
  Activity,
  Eye
} from "lucide-react";
import { Link } from "wouter";
import type { Match, Team } from "@shared/schema";

interface PlayerMatchPerformance {
  matchId: number;
  matchDate: string;
  opponent: string;
  venue: string;
  result: "won" | "lost" | "tied";
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number;
  runsConceded: number;
  strikeRate: number;
  economy: number;
  playerOfMatch: boolean;
}

export default function PlayerMatches() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  // Sample match performance data - in production, this would come from your API
  const matchPerformances: PlayerMatchPerformance[] = [
    {
      matchId: 1,
      matchDate: "2025-05-25",
      opponent: "Mumbai Warriors",
      venue: "Kathmandu Stadium",
      result: "won",
      runs: 67,
      ballsFaced: 45,
      fours: 8,
      sixes: 2,
      wickets: 2,
      oversBowled: 4,
      runsConceded: 28,
      strikeRate: 148.9,
      economy: 7.0,
      playerOfMatch: true
    },
    {
      matchId: 2,
      matchDate: "2025-05-20",
      opponent: "Delhi Capitals",
      venue: "Pokhara Ground",
      result: "lost",
      runs: 23,
      ballsFaced: 18,
      fours: 3,
      sixes: 0,
      wickets: 1,
      oversBowled: 3,
      runsConceded: 22,
      strikeRate: 127.8,
      economy: 7.3,
      playerOfMatch: false
    },
    {
      matchId: 3,
      matchDate: "2025-05-15",
      opponent: "Chennai Kings",
      venue: "Birgunj Cricket Field",
      result: "won",
      runs: 89,
      ballsFaced: 62,
      fours: 10,
      sixes: 3,
      wickets: 0,
      oversBowled: 0,
      runsConceded: 0,
      strikeRate: 143.5,
      economy: 0,
      playerOfMatch: false
    }
  ];

  // Calculate overall statistics
  const overallStats = {
    totalMatches: matchPerformances.length,
    totalRuns: matchPerformances.reduce((sum, match) => sum + match.runs, 0),
    totalWickets: matchPerformances.reduce((sum, match) => sum + match.wickets, 0),
    battingAverage: matchPerformances.reduce((sum, match) => sum + match.runs, 0) / matchPerformances.length,
    strikeRate: matchPerformances.reduce((sum, match) => sum + match.strikeRate, 0) / matchPerformances.length,
    playerOfMatchAwards: matchPerformances.filter(m => m.playerOfMatch).length,
    winPercentage: (matchPerformances.filter(m => m.result === "won").length / matchPerformances.length) * 100
  };

  const getResultBadge = (result: string) => {
    const variants = {
      won: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      tied: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    };
    
    return (
      <Badge className={variants[result as keyof typeof variants]}>
        {result.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Match Statistics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Your detailed cricket performance analysis
            </p>
          </div>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            View All Matches
          </Button>
        </div>

        {/* Overall Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#DC143C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Target className="h-4 w-4 text-[#DC143C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {overallStats.battingAverage.toFixed(1)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wickets</CardTitle>
              <Trophy className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalWickets}</div>
              <p className="text-xs text-muted-foreground">
                In {overallStats.totalMatches} matches
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strike Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.strikeRate.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Overall average
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.winPercentage.toFixed(0)}%</div>
              <p className="text-xs text-muted-foreground">
                {overallStats.playerOfMatchAwards} Player of Match
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-[#DC143C]" />
              <span>Filter Matches</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Tournament</label>
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tournaments</SelectItem>
                    <SelectItem value="premier">Premier League</SelectItem>
                    <SelectItem value="champions">Champions Cup</SelectItem>
                    <SelectItem value="super">Super Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                    <SelectItem value="month">Last Month</SelectItem>
                    <SelectItem value="quarter">Last Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="matches">Match History</TabsTrigger>
            <TabsTrigger value="batting">Batting Stats</TabsTrigger>
            <TabsTrigger value="bowling">Bowling Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="matches" className="space-y-6">
            <div className="space-y-4">
              {matchPerformances.map((match) => (
                <Card key={match.matchId} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold">vs {match.opponent}</h4>
                          {getResultBadge(match.result)}
                          {match.playerOfMatch && (
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              <Award className="h-3 w-3 mr-1" />
                              Player of Match
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(match.matchDate).toLocaleDateString()}</span>
                          </div>
                          <span>{match.venue}</span>
                        </div>
                      </div>
                      <Link href={`/match/${match.matchId}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Batting Performance */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-[#DC143C]">Batting Performance</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Runs:</span>
                            <div className="font-semibold text-lg">{match.runs}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Balls:</span>
                            <div className="font-semibold text-lg">{match.ballsFaced}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">4s/6s:</span>
                            <div className="font-semibold text-lg">{match.fours}/{match.sixes}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Strike Rate:</span>
                            <div className="font-semibold text-lg">{match.strikeRate.toFixed(1)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Bowling Performance */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-[#DC143C]">Bowling Performance</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Wickets:</span>
                            <div className="font-semibold text-lg">{match.wickets}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Overs:</span>
                            <div className="font-semibold text-lg">{match.oversBowled}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Runs Given:</span>
                            <div className="font-semibold text-lg">{match.runsConceded}</div>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Economy:</span>
                            <div className="font-semibold text-lg">{match.economy.toFixed(1)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="batting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Batting Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Runs</span>
                      <span className="font-bold text-lg">{overallStats.totalRuns}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Batting Average</span>
                      <span className="font-bold text-lg">{overallStats.battingAverage.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Strike Rate</span>
                      <span className="font-bold text-lg">{overallStats.strikeRate.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Highest Score</span>
                      <span className="font-bold text-lg">89</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Consistency Rating</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Form (Last 5 matches)</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Big Score Potential</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bowling" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bowling Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Wickets</span>
                      <span className="font-bold text-lg">{overallStats.totalWickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Bowling Average</span>
                      <span className="font-bold text-lg">24.5</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Economy Rate</span>
                      <span className="font-bold text-lg">7.2</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Best Figures</span>
                      <span className="font-bold text-lg">3/18</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Bowling Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Wicket Taking Ability</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Economy Control</span>
                        <span>68%</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Pressure Bowling</span>
                        <span>80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}