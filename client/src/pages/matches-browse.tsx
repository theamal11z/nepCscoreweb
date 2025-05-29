import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Search } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "wouter";
import type { Match } from "@shared/schema";

export default function MatchesBrowsePage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all matches
  const { data: matches, isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  // Fetch live matches
  const { data: liveMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches/live"],
  });

  // Fetch upcoming matches
  const { data: upcomingMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches/upcoming"],
  });

  // Fetch completed matches
  const { data: completedMatches } = useQuery<Match[]>({
    queryKey: ["/api/matches/completed"],
  });

  // Filter matches based on search term
  const filterMatches = (matches: Match[] | undefined) => {
    if (!matches) return [];
    return matches.filter((match) =>
      match.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Get appropriate matches based on active tab
  const getActiveMatches = () => {
    switch (activeTab) {
      case "live":
        return filterMatches(liveMatches);
      case "upcoming":
        return filterMatches(upcomingMatches);
      case "completed":
        return filterMatches(completedMatches);
      default:
        return filterMatches(matches);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive" className="animate-pulse">LIVE</Badge>;
      case "completed":
        return <Badge variant="secondary">COMPLETED</Badge>;
      case "scheduled":
        return <Badge variant="outline">SCHEDULED</Badge>;
      case "cancelled":
        return <Badge variant="secondary">CANCELLED</Badge>;
      default:
        return <Badge variant="outline">{status.toUpperCase()}</Badge>;
    }
  };

  const activeMatches = getActiveMatches();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Cricket Matches</h1>
              <p className="text-muted-foreground">Browse and follow cricket matches</p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by venue..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" onValueChange={setActiveTab}>
            <TabsList className="mb-8">
              <TabsTrigger value="all">All Matches</TabsTrigger>
              <TabsTrigger value="live">
                Live
                {liveMatches && liveMatches.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {liveMatches.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-0">
              {renderMatchesList(activeMatches)}
            </TabsContent>
            <TabsContent value="live" className="space-y-0">
              {renderMatchesList(activeMatches)}
            </TabsContent>
            <TabsContent value="upcoming" className="space-y-0">
              {renderMatchesList(activeMatches)}
            </TabsContent>
            <TabsContent value="completed" className="space-y-0">
              {renderMatchesList(activeMatches)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  function renderMatchesList(matches: Match[] | undefined) {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!matches || matches.length === 0) {
      return (
        <Card className="my-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No matches found</p>
            {searchTerm && (
              <Button
                variant="link"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <Card key={match.id} className="transition-all hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Team {match.team1Id} vs Team {match.team2Id}
                </CardTitle>
                {getStatusBadge(match.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(match.matchDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {new Date(match.matchDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {match.venue}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {match.matchType.toUpperCase()}
                </div>
                <Button variant="default" className="w-full mt-2" asChild>
                  <Link href={`/match/${match.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
}
