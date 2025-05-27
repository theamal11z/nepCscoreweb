import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Plus,
  Activity,
  BarChart3,
  Target
} from "lucide-react";
import { Link } from "wouter";
import type { Match, Team, User } from "@shared/schema";

export default function OrganizerDashboard() {
  const { user } = useAuth();

  // Fetch data from your existing APIs
  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches/organizer"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: allMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  // Calculate real-time statistics
  const liveMatches = allMatches.filter(m => m.status === "live");
  const upcomingMatches = allMatches.filter(m => m.status === "scheduled");
  const completedMatches = allMatches.filter(m => m.status === "completed");
  
  const myLiveMatches = matches.filter(m => m.status === "live");
  const myUpcomingMatches = matches.filter(m => m.status === "scheduled");
  
  const totalMatches = matches.length;
  const matchCompletionRate = totalMatches > 0 ? (completedMatches.length / totalMatches) * 100 : 0;

  // Recent activity data
  const recentActivity = [
    {
      id: 1,
      type: "match_created",
      title: "New match scheduled",
      description: "Team A vs Team B scheduled for tomorrow",
      time: "2 hours ago",
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      id: 2,
      type: "team_joined",
      title: "New team registered",
      description: "Mumbai Warriors joined the tournament",
      time: "4 hours ago",
      icon: Users,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "match_completed",
      title: "Match completed",
      description: "Delhi Kings won against Chennai Super Stars",
      time: "1 day ago",
      icon: Trophy,
      color: "text-yellow-600"
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: "Create Match",
      description: "Schedule a new cricket match",
      icon: Plus,
      href: "/matches",
      color: "bg-[#DC143C] hover:bg-[#B91C3C]"
    },
    {
      title: "Manage Teams",
      description: "View and manage registered teams",
      icon: Users,
      href: "/teams",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Live Scoring",
      description: "Start live match scoring",
      icon: Activity,
      href: "/matches",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "View Statistics",
      description: "Analyze tournament performance",
      icon: BarChart3,
      href: "/stats",
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.fullName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Here's what's happening with your cricket tournaments today.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link href="/matches">
              <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#DC143C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
              <Trophy className="h-4 w-4 text-[#DC143C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMatches}</div>
              <p className="text-xs text-muted-foreground">
                {myLiveMatches.length} live, {myUpcomingMatches.length} upcoming
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
                Registered in tournaments
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{liveMatches.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(matchCompletionRate)}%</div>
              <Progress value={matchCompletionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Activity & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#DC143C]" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${action.color} text-white`}>
                              <action.icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{action.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-[#DC143C]" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`p-1 rounded-full ${activity.color}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status Overview */}
          <div className="space-y-6">
            {/* Live Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-500" />
                    <span>Live Matches</span>
                  </span>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {liveMatches.length} LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {liveMatches.length > 0 ? (
                  <div className="space-y-3">
                    {liveMatches.slice(0, 3).map((match) => (
                      <div key={match.id} className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Team {match.team1Id} vs Team {match.team2Id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{match.venue}</p>
                          </div>
                          <Link href={`/match/${match.id}/scoring`}>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Score
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No live matches at the moment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Upcoming Matches</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingMatches.slice(0, 3).map((match) => (
                      <div key={match.id} className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Team {match.team1Id} vs Team {match.team2Id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(match.matchDate).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {new Date(match.matchDate).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming matches scheduled</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <span>Notifications</span>
                  </span>
                  <Link href="/notifications">
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">New team registration</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">2 pending approvals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Match completed</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Results uploaded</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}