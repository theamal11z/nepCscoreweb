import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MatchCard from "@/components/match-card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertMatchSchema, insertTeamSchema } from "@shared/schema";
import { z } from "zod";
import { Plus, Calendar, Users, Trophy, BarChart3, Settings, Clock } from "lucide-react";
import type { Match, Team, MatchScore } from "@shared/schema";

const extendedMatchSchema = insertMatchSchema.extend({
  matchDate: z.string().min(1, "Match date is required"),
});

type MatchFormData = z.infer<typeof extendedMatchSchema>;
type TeamFormData = z.infer<typeof insertTeamSchema>;

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isMatchDialogOpen, setIsMatchDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);

  const { data: myMatches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches/organizer", user?.id],
    enabled: !!user,
  });

  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: myTeams, isLoading: myTeamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams/my", user?.id],
    enabled: !!user,
  });

  const { data: allScores } = useQuery<MatchScore[]>({
    queryKey: ["/api/matches/scores"],
  });

  const matchForm = useForm<MatchFormData>({
    resolver: zodResolver(extendedMatchSchema),
    defaultValues: {
      team1Id: 0,
      team2Id: 0,
      venue: "",
      matchDate: "",
      matchType: "T20",
    },
  });

  const teamForm = useForm<TeamFormData>({
    resolver: zodResolver(insertTeamSchema),
    defaultValues: {
      name: "",
      location: "",
      logoUrl: "",
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (data: MatchFormData) => {
      const matchData = {
        ...data,
        matchDate: new Date(data.matchDate).toISOString(),
      };
      const res = await apiRequest("POST", "/api/matches", matchData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/organizer"] });
      setIsMatchDialogOpen(false);
      matchForm.reset();
      toast({
        title: "Match created successfully",
        description: "Your match has been scheduled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create match",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const res = await apiRequest("POST", "/api/teams", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIsTeamDialogOpen(false);
      teamForm.reset();
      toast({
        title: "Team created successfully",
        description: "Your team has been created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateMatch = (data: MatchFormData) => {
    createMatchMutation.mutate(data);
  };

  const onCreateTeam = (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };

  const getMatchScores = (matchId: number) => {
    return allScores?.filter(score => score.matchId === matchId) || [];
  };

  const liveMatches = myMatches?.filter(match => match.status === "live") || [];
  const upcomingMatches = myMatches?.filter(match => match.status === "scheduled") || [];
  const completedMatches = myMatches?.filter(match => match.status === "completed") || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Match Organizer Dashboard</h1>
          <p className="text-muted-foreground">Create and manage cricket matches, teams, and tournaments</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <Form {...teamForm}>
                <form onSubmit={teamForm.handleSubmit(onCreateTeam)} className="space-y-4">
                  <FormField
                    control={teamForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={teamForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter team location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={teamForm.control}
                    name="logoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter logo URL" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createTeamMutation.isPending} className="w-full">
                    {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isMatchDialogOpen} onOpenChange={setIsMatchDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
              </DialogHeader>
              <Form {...matchForm}>
                <form onSubmit={matchForm.handleSubmit(onCreateMatch)} className="space-y-4">
                  <FormField
                    control={matchForm.control}
                    name="team1Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team 1</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select first team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams?.map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={matchForm.control}
                    name="team2Id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Team 2</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select second team" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {teams?.map((team) => (
                              <SelectItem key={team.id} value={team.id.toString()}>
                                {team.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={matchForm.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter match venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={matchForm.control}
                    name="matchDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Date & Time</FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={matchForm.control}
                    name="matchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="T20">T20 (20 overs)</SelectItem>
                            <SelectItem value="ODI">ODI (50 overs)</SelectItem>
                            <SelectItem value="Test">Test Match</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={createMatchMutation.isPending} className="w-full">
                    {createMatchMutation.isPending ? "Creating..." : "Create Match"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                <p className="text-3xl font-bold text-primary">
                  {myMatches?.length || 0}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Matches</p>
                <p className="text-3xl font-bold text-primary">
                  {liveMatches.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">My Teams</p>
                <p className="text-3xl font-bold text-primary">
                  {myTeams?.length || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-primary">
                  {completedMatches.length}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="matches" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="matches">My Matches</TabsTrigger>
          <TabsTrigger value="teams">My Teams</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="space-y-6">
          {/* Live Matches */}
          {liveMatches.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-foreground">Live Matches</h2>
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
                  LIVE
                </Badge>
              </div>
              <div className="grid lg:grid-cols-2 gap-6">
                {liveMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={getMatchScores(match.id)}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Matches */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Upcoming Matches</h2>
            {matchesLoading ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
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
            ) : upcomingMatches.length > 0 ? (
              <div className="grid lg:grid-cols-2 gap-6">
                {upcomingMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={getMatchScores(match.id)}
                    showActions
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Matches</h3>
                  <p className="text-muted-foreground mb-4">Create your first match to get started</p>
                  <Button onClick={() => setIsMatchDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Match
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Completed Matches */}
          {completedMatches.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Completed Matches</h2>
              <div className="grid lg:grid-cols-2 gap-6">
                {completedMatches.slice(0, 6).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    scores={getMatchScores(match.id)}
                    showActions
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-foreground">My Teams</h2>
            <Button onClick={() => setIsTeamDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Team
            </Button>
          </div>

          {myTeamsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-12 w-12 bg-muted rounded-lg"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myTeams && myTeams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTeams.map((team) => (
                <Card key={team.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Users className="text-white w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.location}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="w-4 h-4 mr-1" />
                        Manage
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <BarChart3 className="w-4 h-4 mr-1" />
                        Stats
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Teams Created</h3>
                <p className="text-muted-foreground mb-4">Create your first team to start organizing matches</p>
                <Button onClick={() => setIsTeamDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Match Analytics</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
              <p className="text-muted-foreground">
                Detailed analytics and insights for your matches and teams will be available here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
