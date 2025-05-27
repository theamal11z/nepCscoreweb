import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Trophy, 
  Target, 
  Activity, 
  Calendar, 
  Users, 
  TrendingUp,
  Bell,
  UserPlus,
  Upload,
  Star,
  BarChart3,
  Clock,
  Award
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Match, Team, Player } from "@shared/schema";

interface PlayerStats {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  strikeRate: number;
  recentForm: string[];
  highestScore: number;
  bestBowling: string;
}

export default function PlayerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: playerProfile } = useQuery<Player>({
    queryKey: ["/api/players/me"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  // Mock player statistics - in real app, calculate from actual matches
  const playerStats: PlayerStats = {
    totalMatches: 24,
    totalRuns: 1250,
    totalWickets: 18,
    battingAverage: 52.08,
    bowlingAverage: 28.5,
    strikeRate: 142.3,
    recentForm: ["W", "W", "L", "W", "W"], // W = Win, L = Loss
    highestScore: 89,
    bestBowling: "4/32"
  };

  // Recent notifications for the player
  const notifications = [
    {
      id: 1,
      type: "team_invite",
      title: "Team Invitation",
      message: "Mumbai Warriors invited you to join their team",
      time: "2 hours ago",
      actionRequired: true
    },
    {
      id: 2,
      type: "match_reminder",
      title: "Upcoming Match",
      message: "You have a match tomorrow at 2:00 PM",
      time: "1 day ago",
      actionRequired: false
    },
    {
      id: 3,
      type: "approval",
      title: "Application Approved",
      message: "Your application to join Delhi Capitals was approved",
      time: "3 days ago",
      actionRequired: false
    }
  ];

  // Quick action items for players
  const quickActions = [
    {
      title: "Apply to Teams",
      description: "Browse and apply to cricket teams",
      icon: UserPlus,
      href: "/teams/apply",
      color: "bg-[#DC143C] hover:bg-[#B91C3C]"
    },
    {
      title: "View Match History",
      description: "Check your performance history",
      icon: BarChart3,
      href: "/player/matches",
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Update Profile",
      description: "Complete your cricket profile",
      icon: Upload,
      href: "/player/profile",
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Live Matches",
      description: "Join ongoing match sessions",
      icon: Activity,
      href: "/matches/live",
      color: "bg-purple-600 hover:bg-purple-700"
    }
  ];

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getFormColor = (result: string) => {
    return result === "W" ? "bg-green-500" : "bg-red-500";
  };

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
              Track your cricket journey and improve your game
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Link href="/player/profile">
              <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                <Upload className="h-4 w-4 mr-2" />
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Player Profile Status */}
        <Card className="border-l-4 border-l-[#DC143C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-[#DC143C] text-white text-xl">
                    {getInitials(user?.fullName || "P")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.fullName}</h3>
                  <p className="text-gray-600 dark:text-gray-400">Cricket Player</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {playerProfile?.isApproved ? (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <Star className="h-3 w-3 mr-1" />
                        Verified Player
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-2xl font-bold text-[#DC143C]">{playerStats.totalMatches}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Matches Played</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {playerStats.battingAverage}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wickets</CardTitle>
              <Trophy className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.totalWickets}</div>
              <p className="text-xs text-muted-foreground">
                Best: {playerStats.bestBowling}
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strike Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.strikeRate}</div>
              <p className="text-xs text-muted-foreground">
                Last 5 matches
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              <Award className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{playerStats.highestScore}</div>
              <p className="text-xs text-muted-foreground">
                Personal best
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[#DC143C]" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <Link key={index} href={action.href}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`p-3 rounded-lg ${action.color} text-white`}>
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

            {/* Recent Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#DC143C]" />
                  <span>Recent Form</span>
                </CardTitle>
                <CardDescription>
                  Your performance in the last 5 matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  {playerStats.recentForm.map((result, index) => (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getFormColor(result)}`}
                    >
                      {result}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Batting Average</span>
                    <span className="font-semibold">{playerStats.battingAverage}</span>
                  </div>
                  <Progress value={(playerStats.battingAverage / 100) * 100} className="h-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span>Strike Rate</span>
                    <span className="font-semibold">{playerStats.strikeRate}</span>
                  </div>
                  <Progress value={(playerStats.strikeRate / 200) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Notifications & Teams */}
          <div className="space-y-6">
            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-[#DC143C]" />
                    <span>Notifications</span>
                  </span>
                  <Badge className="bg-[#DC143C] text-white">
                    {notifications.filter(n => n.actionRequired).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border ${
                        notification.actionRequired 
                          ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800' 
                          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-sm">{notification.title}</h5>
                        {notification.actionRequired && (
                          <Badge variant="outline" className="text-xs">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <Link href="/player/notifications">
                  <Button variant="outline" className="w-full mt-4">
                    View All Notifications
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Available Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#DC143C]" />
                  <span>Available Teams</span>
                </CardTitle>
                <CardDescription>
                  Teams looking for players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {teams.slice(0, 3).map((team) => (
                    <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h5 className="font-medium">{team.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{team.location}</p>
                      </div>
                      <Link href={`/team/${team.id}/apply`}>
                        <Button size="sm" className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                          Apply
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
                <Link href="/teams/browse">
                  <Button variant="outline" className="w-full mt-4">
                    Browse All Teams
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-[#DC143C]" />
                  <span>Profile Completion</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Basic info completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Cricket role selected</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Upload cricket resume</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      <span>Add performance videos</span>
                    </div>
                  </div>
                  
                  <Link href="/player/profile">
                    <Button className="w-full bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                      Complete Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}