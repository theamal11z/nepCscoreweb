import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Heart, Users, MapPin } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import type { Team } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

export default function TeamsBrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all teams
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch user's followed teams
  const { data: followedTeams, isLoading: followedLoading, refetch: refetchFollowed } = useQuery<Team[]>({
    queryKey: ["/api/users/me/teams/following"],
    enabled: !!user,
  });

  // Filter teams based on search query
  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Check if a team is followed by the user
  const isTeamFollowed = (teamId: number) => {
    return followedTeams?.some(team => team.id === teamId) || false;
  };

  // Toggle follow/unfollow
  const toggleFollow = async (teamId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow teams",
        variant: "destructive",
      });
      return;
    }

    try {
      const isFollowing = isTeamFollowed(teamId);
      const endpoint = isFollowing ? `/api/teams/${teamId}/unfollow` : `/api/teams/${teamId}/follow`;
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) throw new Error("Failed to update follow status");
      
      toast({
        title: isFollowing ? "Team unfollowed" : "Team followed",
        description: isFollowing ? "You will no longer receive updates for this team" : "You will now receive updates for this team",
      });
      
      // Refetch the followed teams
      refetchFollowed();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Browse Teams</h1>
        <div className="w-full md:w-64">
          <Input
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <Separator className="mb-8" />

      {teamsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardContent className="p-6">
                <div className="h-28 bg-muted rounded-md mb-4"></div>
                <div className="h-4 w-3/4 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTeams && filteredTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-center h-28 bg-muted rounded-md mb-4">
                  {team.logoUrl ? (
                    <img
                      src={team.logoUrl}
                      alt={`${team.name} logo`}
                      className="h-full object-contain"
                    />
                  ) : (
                    <Users className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>
                <Link href={`/team/${team.id}`}>
                  <h3 className="text-xl font-bold text-foreground hover:text-primary cursor-pointer">{team.name}</h3>
                </Link>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {team.location}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 px-6 py-4 flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFollow(team.id)}
                  className={isTeamFollowed(team.id) ? "text-pink-500" : ""}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${isTeamFollowed(team.id) ? "fill-pink-500" : ""}`}
                  />
                  {isTeamFollowed(team.id) ? "Following" : "Follow"}
                </Button>
                <Link href={`/team/${team.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teams found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? `No teams match the search "${searchQuery}"`
              : "There are no teams available at the moment"}
          </p>
        </div>
      )}
    </div>
  );
}
