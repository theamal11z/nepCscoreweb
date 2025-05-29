import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Heart, User, Users, Shield, MapPin, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import type { Team, Player } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function FanFollowingPage() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("teams");
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Parse the URL to get the active tab
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const tabParam = params.get('tab');
    if (tabParam && (tabParam === 'teams' || tabParam === 'players')) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Fetch user's followed teams
  const { 
    data: followedTeams, 
    isLoading: teamsLoading, 
    refetch: refetchTeams 
  } = useQuery<Team[]>({
    queryKey: ["/api/users/me/teams/following"],
    enabled: !!user,
  });

  // Fetch user's followed players
  const { 
    data: followedPlayers, 
    isLoading: playersLoading, 
    refetch: refetchPlayers 
  } = useQuery<Player[]>({
    queryKey: ["/api/users/me/players/following"],
    enabled: !!user,
  });

  // Unfollow a team
  const unfollowTeam = async (teamId: number) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Failed to unfollow team");
      
      toast({
        title: "Team unfollowed",
        description: "You will no longer receive updates for this team",
      });
      
      // Refetch the followed teams
      refetchTeams();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow team. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Unfollow a player
  const unfollowPlayer = async (playerId: number) => {
    try {
      const response = await fetch(`/api/players/${playerId}/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Failed to unfollow player");
      
      toast({
        title: "Player unfollowed",
        description: "You will no longer receive updates for this player",
      });
      
      // Refetch the followed players
      refetchPlayers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to unfollow player. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get position badge color
  const getPositionColor = (position?: string) => {
    switch (position) {
      case "batsman": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "bowler": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "all-rounder": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "wicket-keeper": return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">My Following</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teams" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Teams You Follow</h2>
            <Link href="/teams-browse">
              <Button variant="outline" size="sm">
                Browse Teams
              </Button>
            </Link>
          </div>
          
          <Separator className="mb-6" />
          
          {teamsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-36 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-muted rounded-md mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : followedTeams && followedTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedTeams.map((team) => (
                <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center mr-4">
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={`${team.name} logo`}
                              className="h-full object-contain"
                            />
                          ) : (
                            <Users className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <Link href={`/team/${team.id}`}>
                            <h3 className="text-lg font-bold text-foreground hover:text-primary cursor-pointer">
                              {team.name}
                            </h3>
                          </Link>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {team.location}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => unfollowTeam(team.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No teams followed yet</h3>
              <p className="text-muted-foreground mb-6">
                Start following teams to stay updated with their matches and performance
              </p>
              <Link href="/teams-browse">
                <Button>Browse Teams</Button>
              </Link>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="players" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Players You Follow</h2>
            <Link href="/players-browse">
              <Button variant="outline" size="sm">
                Browse Players
              </Button>
            </Link>
          </div>
          
          <Separator className="mb-6" />
          
          {playersLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="h-36 animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="w-16 h-16 bg-muted rounded-full mr-4"></div>
                      <div className="flex-1">
                        <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-muted rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : followedPlayers && followedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {followedPlayers.map((player) => (
                <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mr-4">
                          <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                          <Link href={`/player/${player.id}`}>
                            <h3 className="text-lg font-bold text-foreground hover:text-primary cursor-pointer">
                              Player #{player.userId}
                            </h3>
                          </Link>
                          <Badge className={`mt-1 ${getPositionColor(player.position)}`}>
                            {player.position || "Unknown"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => unfollowPlayer(player.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No players followed yet</h3>
              <p className="text-muted-foreground mb-6">
                Start following players to track their performance and statistics
              </p>
              <Link href="/players-browse">
                <Button>Browse Players</Button>
              </Link>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
