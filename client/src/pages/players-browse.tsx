import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, User, Users, Shield } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import type { Player } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PlayersBrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all players
  const { data: players, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  // Fetch user's followed players
  const { data: followedPlayers, isLoading: followedLoading, refetch: refetchFollowed } = useQuery<Player[]>({
    queryKey: ["/api/users/me/players/following"],
    enabled: !!user,
  });

  // Filter players based on search query and active tab
  const filteredPlayers = players?.filter(player => {
    const matchesSearch = 
      player.userId.toString().includes(searchQuery.toLowerCase()) ||
      (player.position ? player.position.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (player.battingStyle ? player.battingStyle.toLowerCase().includes(searchQuery.toLowerCase()) : false) ||
      (player.bowlingStyle ? player.bowlingStyle.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "batsmen") return matchesSearch && player.position === "batsman";
    if (activeTab === "bowlers") return matchesSearch && player.position === "bowler";
    if (activeTab === "all-rounders") return matchesSearch && player.position === "all-rounder";
    if (activeTab === "wicket-keepers") return matchesSearch && player.position === "wicket-keeper";
    
    return matchesSearch;
  });

  // Check if a player is followed by the user
  const isPlayerFollowed = (playerId: number) => {
    return followedPlayers?.some(player => player.id === playerId) || false;
  };

  // Toggle follow/unfollow
  const toggleFollow = async (playerId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow players",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFollowing = isPlayerFollowed(playerId);
      const endpoint = isFollowing ? `/api/players/${playerId}/unfollow` : `/api/players/${playerId}/follow`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Failed to update follow status");
      
      toast({
        title: isFollowing ? "Player unfollowed" : "Player followed",
        description: isFollowing ? "You will no longer receive updates for this player" : "You will now receive updates for this player",
      });
      
      // Refetch the followed players
      refetchFollowed();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get position badge color
  const getPositionColor = (position?: string | null) => {
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Browse Players</h1>
        <div className="w-full md:w-64">
          <Input
            placeholder="Search players..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 md:w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="batsmen">Batsmen</TabsTrigger>
          <TabsTrigger value="bowlers">Bowlers</TabsTrigger>
          <TabsTrigger value="all-rounders">All-rounders</TabsTrigger>
          <TabsTrigger value="wicket-keepers">Wicket-keepers</TabsTrigger>
        </TabsList>
      </Tabs>

      <Separator className="mb-8" />

      {playersLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-muted mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPlayers && filteredPlayers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
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
                
                <div className="space-y-2 text-sm">
                  {player.teamId && (
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Team #{player.teamId}</span>
                    </div>
                  )}
                  {player.battingStyle && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Batting:</span>
                      <span>{player.battingStyle}</span>
                    </div>
                  )}
                  {player.bowlingStyle && (
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Bowling:</span>
                      <span>{player.bowlingStyle}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-4 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFollow(player.id)}
                  className={isPlayerFollowed(player.id) ? "text-pink-500" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${isPlayerFollowed(player.id) ? "fill-pink-500" : ""}`}
                  />
                  {isPlayerFollowed(player.id) ? "Following" : "Follow"}
                </Button>
                <Link href={`/player/${player.id}`}>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No players found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? `No players match the search "${searchQuery}"`
              : "There are no players available at the moment"}
          </p>
        </div>
      )}
    </div>
  );
}
