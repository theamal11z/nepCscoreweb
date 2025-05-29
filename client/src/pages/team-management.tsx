import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Calendar, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTeamSchema, type Team, type Player } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const teamFormSchema = insertTeamSchema.extend({
  description: z.string().optional(),
});

type TeamFormData = z.infer<typeof teamFormSchema>;

// Schema for adding a player to a team
const addPlayerSchema = z.object({
  playerId: z.string().min(1, "Player is required"),
});

type AddPlayerFormData = z.infer<typeof addPlayerSchema>;

export default function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isAddPlayerDialogOpen, setIsAddPlayerDialogOpen] = useState(false);

  const { data: teams = [], isLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams/my"],
    onError: (error) => {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your teams. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: allTeams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
    onError: (error) => {
      console.error("Error fetching all teams:", error);
    },
  });
  
  // Fetch available players (players without a team)
  const { data: availablePlayers = [] } = useQuery<Player[]>({
    queryKey: ["/api/players/available"],
    enabled: isAddPlayerDialogOpen,
    onError: (error) => {
      console.error("Error fetching available players:", error);
    },
  });
  
  // Fetch team players when a team is selected
  const { data: teamPlayers = [], refetch: refetchTeamPlayers } = useQuery<Player[]>({
    queryKey: [`/api/teams/${selectedTeam?.id}/players`],
    enabled: !!selectedTeam?.id,
    onError: (error) => {
      console.error("Error fetching team players:", error);
    },
  });

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
    },
  });

  const createTeamMutation = useMutation({
    mutationFn: async (data: TeamFormData) => {
      const res = await apiRequest("POST", "/api/teams", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams/my"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Team created successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Form for adding a player to a team
  const addPlayerForm = useForm<AddPlayerFormData>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      playerId: "",
    },
  });
  
  // Mutation for adding a player to a team
  const addPlayerToTeamMutation = useMutation({
    mutationFn: async ({ playerId }: { playerId: string }) => {
      if (!selectedTeam) throw new Error("No team selected");
      const res = await apiRequest("PATCH", `/api/players/${playerId}/team`, { 
        teamId: selectedTeam.id 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${selectedTeam?.id}/players`] });
      queryClient.invalidateQueries({ queryKey: ["/api/players/available"] });
      setIsAddPlayerDialogOpen(false);
      addPlayerForm.reset();
      toast({
        title: "Success",
        description: "Player added to team successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onCreateTeam = (data: TeamFormData) => {
    createTeamMutation.mutate(data);
  };
  
  const onAddPlayerToTeam = (data: AddPlayerFormData) => {
    addPlayerToTeamMutation.mutate({ playerId: data.playerId });
  };
  
  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
  };
  
  const renderTeamCards = (teamList: Team[], isOwned = false) => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={`loading-${i}`} className={`hover:shadow-lg transition-shadow ${isOwned ? 'border-l-4 border-l-[#DC143C]' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              {isOwned && (
                <Badge variant="secondary" className="bg-[#DC143C] text-white">
                  Owner
                </Badge>
              )}
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                disabled
              >
                <Users className="h-4 w-4 mr-2" />
                View Team Players
              </Button>
            </div>
          </CardContent>
        </Card>
      ));
    }

    if (teamList.length === 0) {
      return (
        <div className="col-span-3 text-center py-8 border rounded-md">
          <p className="text-gray-500">
            {isOwned ? "You don't have any teams yet." : "No teams available."}
          </p>
        </div>
      );
    }

    return teamList.map((team) => (
      <Card key={team.id} className={`hover:shadow-lg transition-shadow ${isOwned ? 'border-l-4 border-l-[#DC143C]' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{team.name}</CardTitle>
            {isOwned && (
              <Badge variant="secondary" className="bg-[#DC143C] text-white">
                Owner
              </Badge>
            )}
          </div>
          <CardDescription className="flex items-center space-x-2">
            <MapPin className="h-4 w-4" />
            <span>{team.location}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Created {new Date(team.createdAt || new Date()).toLocaleDateString()}</span>
            </div>
            
            {/* Team Players Button - Always visible */}
            <Button 
              onClick={() => handleSelectTeam(team)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <Users className="h-4 w-4 mr-2" />
              {selectedTeam?.id === team.id ? "Manage Team Players" : "View Team Players"}
            </Button>
            
            {/* Team Players List - Only visible when team is selected */}
            {selectedTeam?.id === team.id && (
              <div className="mt-4 border p-3 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Team Players</h3>
                  <Badge>{teamPlayers.length}</Badge>
                </div>
                
                {teamPlayers.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {teamPlayers.map((player) => (
                      <div key={player.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8 bg-blue-100 text-blue-600">
                            <AvatarFallback>{player.userId ? player.userId.toString().substring(0, 2) : "P"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{player.position || "Player"}</p>
                            <p className="text-xs text-gray-500">
                              {player.battingStyle || "--"} • {player.bowlingStyle || "--"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p>No players in this team yet</p>
                  </div>
                )}
                
                {isOwned && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-3" 
                    onClick={() => setIsAddPlayerDialogOpen(true)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Player to Team
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your teams and view all teams in the ecosystem
            </p>
          </div>
          
          {(user?.role === "organizer" || user?.role === "admin") && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create a new team</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCreateTeam)} className="space-y-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="City, Country" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Brief description of the team"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={createTeamMutation.isPending}
                        className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                      >
                        {createTeamMutation.isPending ? "Creating..." : "Create Team"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="space-y-8">
          {/* My Teams Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              My Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderTeamCards(teams, true)}
            </div>
          </div>

          {/* All Teams Section */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              All Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderTeamCards(allTeams)}
            </div>
          </div>
        </div>
        
        {/* Dialog for adding a player to a team */}
        <Dialog open={isAddPlayerDialogOpen} onOpenChange={setIsAddPlayerDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Player to {selectedTeam?.name}</DialogTitle>
            </DialogHeader>
            <Form {...addPlayerForm}>
              <form onSubmit={addPlayerForm.handleSubmit(onAddPlayerToTeam)} className="space-y-4">
                <FormField
                  control={addPlayerForm.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Player</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a player" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePlayers.map((player) => (
                            <SelectItem key={player.id} value={player.id.toString()}>
                              {player.position || "Player"} - {player.battingStyle || "--"} / {player.bowlingStyle || "--"}
                            </SelectItem>
                          ))}
                          {availablePlayers.length === 0 && (
                            <SelectItem value="" disabled>
                              No available players found
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddPlayerDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addPlayerToTeamMutation.isPending}
                    className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                  >
                    {addPlayerToTeamMutation.isPending ? "Adding..." : "Add to Team"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
