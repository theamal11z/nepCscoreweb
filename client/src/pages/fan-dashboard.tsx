import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  Bell, 
  Star,
  Heart,
  BarChart3,
  Activity
} from "lucide-react";
import { Link } from "wouter";
import type { Match, Team, User } from "@shared/schema";

export default function FanDashboard() {
  const { user } = useAuth();

  // Fetch data for the fan dashboard
  const { data: upcomingMatches = [] } = useQuery<Match[]>({
    queryKey: ["/api/matches/upcoming"],
  });

  const { data: popularTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch teams and players followed by the user
  const { data: followedTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/user/followed-teams"],
    enabled: !!user?.id,
  });

  const { data: followedPlayers = [] } = useQuery<any[]>({
    queryKey: ["/api/user/followed-players"],
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Welcome and Actions */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.fullName}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4">
                Stay updated with the latest cricket matches and follow your favorite teams and players.
              </p>
              <div className="flex space-x-3 mt-4">
                <Link href="/matches-browse">
                  <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Matches
                  </Button>
                </Link>
                <Link href="/teams-browse">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Browse Teams
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Fan Profile Card */}
          <div className="md:col-span-1">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Fan Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-[#FFA500] flex items-center justify-center text-white text-2xl font-bold mb-3">
                    {user?.fullName.split(' ').map(name => name[0]).join('').toUpperCase()}
                  </div>
                  <h3 className="font-bold text-lg">{user?.fullName}</h3>
                  <Badge className="mt-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                    Fan
                  </Badge>
                  
                  <div className="w-full mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Followed Teams</span>
                      <span className="font-medium">{followedTeams.length}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Followed Players</span>
                      <span className="font-medium">{followedPlayers.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Watched Matches</span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/profile">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Upcoming Matches */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Calendar className="h-5 w-5 mr-2 text-[#DC143C]" />
                  Upcoming Matches
                </CardTitle>
                <CardDescription>
                  Don't miss these exciting cricket matches
                </CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingMatches.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingMatches.slice(0, 5).map((match) => (
                      <div key={match.id} className="p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">Team {match.team1Id} vs Team {match.team2Id}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(match.matchDate).toLocaleDateString()} • {new Date(match.matchDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/match/${match.id}`}>View</Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center mt-2">
                      <Button variant="link" asChild>
                        <Link href="/matches-browse">View all matches</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No upcoming matches</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      Check back later for upcoming cricket matches.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Teams and Players to Follow */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Star className="h-5 w-5 mr-2 text-yellow-500" />
                  Popular Teams
                </CardTitle>
                <CardDescription>Teams you might want to follow</CardDescription>
              </CardHeader>
              <CardContent>
                {popularTeams.length > 0 ? (
                  <div className="space-y-3">
                    {popularTeams.slice(0, 4).map((team) => (
                      <div key={team.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            {team.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{team.name}</p>
                            <p className="text-xs text-gray-500">{team.location || "Location not specified"}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-center mt-2">
                      <Button variant="link" asChild>
                        <Link href="/teams-browse">View all teams</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No teams available</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                      Check back later for popular teams to follow.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Your Activity and Recent Matches */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Your Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Your Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recent activity</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  Start following teams and players to see your activity here.
                </p>
                <div className="mt-6 flex gap-4">
                  <Button asChild variant="outline">
                    <Link href="/teams-browse">Browse Teams</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/players-browse">Browse Players</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Match Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Recent Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recent match results</h3>
                <p className="text-muted-foreground max-w-md mt-2">
                  Check back later for recent cricket match results.
                </p>
                <Button className="mt-6" variant="outline" asChild>
                  <Link href="/matches-browse">Browse All Matches</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
