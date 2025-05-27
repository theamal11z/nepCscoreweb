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
  TrendingUp, 
  Trophy, 
  Target, 
  Users, 
  Calendar,
  Filter,
  Download,
  Eye,
  Star
} from "lucide-react";
import type { Match, Team } from "@shared/schema";

export default function StatsPage() {
  const { user } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [tournamentFilter, setTournamentFilter] = useState<string>("all");

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Calculate comprehensive statistics from your actual data
  const totalMatches = matches.length;
  const completedMatches = matches.filter(m => m.status === "completed");
  const liveMatches = matches.filter(m => m.status === "live");
  const upcomingMatches = matches.filter(m => m.status === "scheduled");

  // Win/Loss ratios per team (mock data based on your teams)
  const teamStats = teams.map(team => {
    const teamMatches = matches.filter(m => m.team1Id === team.id || m.team2Id === team.id);
    const wins = Math.floor(Math.random() * teamMatches.length); // In real app, calculate from actual results
    const losses = teamMatches.length - wins;
    const winRate = teamMatches.length > 0 ? (wins / teamMatches.length) * 100 : 0;
    
    return {
      ...team,
      matches: teamMatches.length,
      wins,
      losses,
      winRate,
      avgScore: Math.floor(Math.random() * 50) + 150, // Mock average score
      highestScore: Math.floor(Math.random() * 100) + 200
    };
  });

  // Tournament performance data
  const tournamentData = [
    { name: "Premier League", matches: Math.floor(totalMatches * 0.4), teams: Math.floor(teams.length * 0.6), avgScore: 185 },
    { name: "Champions Cup", matches: Math.floor(totalMatches * 0.3), teams: Math.floor(teams.length * 0.4), avgScore: 192 },
    { name: "Super Series", matches: Math.floor(totalMatches * 0.3), teams: Math.floor(teams.length * 0.5), avgScore: 178 }
  ];

  // Monthly match statistics
  const monthlyStats = [
    { month: "Jan", matches: Math.floor(totalMatches * 0.1), avg: 175 },
    { month: "Feb", matches: Math.floor(totalMatches * 0.15), avg: 182 },
    { month: "Mar", matches: Math.floor(totalMatches * 0.2), avg: 189 },
    { month: "Apr", matches: Math.floor(totalMatches * 0.25), avg: 195 },
    { month: "May", matches: Math.floor(totalMatches * 0.3), avg: 188 }
  ];

  // Performance metrics
  const performanceMetrics = {
    totalRuns: completedMatches.length * 350, // Mock total runs
    totalWickets: completedMatches.length * 18, // Mock total wickets
    avgMatchDuration: "3h 45m",
    mostSuccessfulTeam: teamStats.length > 0 ? teamStats.reduce((a, b) => a.winRate > b.winRate ? a : b) : null,
    topScorer: "Virat Kohli - 1,250 runs", // Mock data
    bestBowler: "Jasprit Bumrah - 45 wickets" // Mock data
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tournament Statistics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Comprehensive analytics and performance insights
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
              <Eye className="h-4 w-4 mr-2" />
              Live Dashboard
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-[#DC143C]" />
              <span>Filters</span>
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
                <Select value={tournamentFilter} onValueChange={setTournamentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tournaments</SelectItem>
                    {tournamentData.map((tournament) => (
                      <SelectItem key={tournament.name} value={tournament.name}>
                        {tournament.name}
                      </SelectItem>
                    ))}
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
                    <SelectItem value="year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#DC143C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <BarChart3 className="h-4 w-4 text-[#DC143C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
              <p className="text-xs text-muted-foreground">
                {completedMatches.length} completed, {liveMatches.length} live
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all tournaments
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.totalRuns.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                In completed matches
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Match Duration</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.avgMatchDuration}</div>
              <p className="text-xs text-muted-foreground">
                Per completed match
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teams">Team Analysis</TabsTrigger>
            <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Match Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-[#DC143C]" />
                    <span>Monthly Match Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyStats.map((month) => (
                      <div key={month.month} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium w-8">{month.month}</span>
                          <div className="flex-1">
                            <Progress value={(month.matches / Math.max(...monthlyStats.map(m => m.matches))) * 100} className="h-2" />
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{month.matches}</div>
                          <div className="text-sm text-gray-500">Avg: {month.avg}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-[#DC143C]" />
                    <span>Top Performers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <span className="font-semibold">Most Successful Team</span>
                      </div>
                      {performanceMetrics.mostSuccessfulTeam && (
                        <div>
                          <p className="font-medium">{performanceMetrics.mostSuccessfulTeam.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Win Rate: {performanceMetrics.mostSuccessfulTeam.winRate.toFixed(1)}%
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-4 w-4 text-green-600" />
                        <span className="font-semibold">Top Scorer</span>
                      </div>
                      <p className="text-sm">{performanceMetrics.topScorer}</p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold">Best Bowler</span>
                      </div>
                      <p className="text-sm">{performanceMetrics.bestBowler}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#DC143C]" />
                  <span>Team Performance Comparison</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamStats.map((team) => (
                    <Card key={team.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{team.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{team.location}</p>
                        </div>
                        <Badge className={`${
                          team.winRate >= 70 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                          team.winRate >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }`}>
                          {team.winRate.toFixed(1)}% Win Rate
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Matches</span>
                          <div className="font-semibold">{team.matches}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Wins</span>
                          <div className="font-semibold text-green-600">{team.wins}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Avg Score</span>
                          <div className="font-semibold">{team.avgScore}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Highest</span>
                          <div className="font-semibold">{team.highestScore}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <Progress value={team.winRate} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#DC143C]" />
                  <span>Tournament Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {tournamentData.map((tournament) => (
                    <Card key={tournament.name} className="p-4">
                      <h4 className="font-semibold text-lg mb-3">{tournament.name}</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Matches</span>
                          <span className="font-semibold">{tournament.matches}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Teams</span>
                          <span className="font-semibold">{tournament.teams}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Score</span>
                          <span className="font-semibold">{tournament.avgScore}</span>
                        </div>
                        <Progress value={(tournament.matches / Math.max(...tournamentData.map(t => t.matches))) * 100} className="h-2" />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Overall Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Total Runs Scored</span>
                      <span className="font-bold text-lg">{performanceMetrics.totalRuns.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Wickets Taken</span>
                      <span className="font-bold text-lg">{performanceMetrics.totalWickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Match Duration</span>
                      <span className="font-bold text-lg">{performanceMetrics.avgMatchDuration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Match Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Completed Matches</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(completedMatches.length / totalMatches) * 100} className="w-20 h-2" />
                        <span className="font-semibold">{completedMatches.length}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Live Matches</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(liveMatches.length / totalMatches) * 100} className="w-20 h-2" />
                        <span className="font-semibold">{liveMatches.length}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Upcoming Matches</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={(upcomingMatches.length / totalMatches) * 100} className="w-20 h-2" />
                        <span className="font-semibold">{upcomingMatches.length}</span>
                      </div>
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