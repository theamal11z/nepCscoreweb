import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Play, Square, Trophy, Plus, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMatchSchema, type Match, type Team } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const matchFormSchema = insertMatchSchema.extend({
  status: z.string().optional()
});

type MatchFormData = z.infer<typeof matchFormSchema>;
type FixedFormType = z.infer<typeof insertMatchSchema> & { status?: string };

export default function MatchManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches/organizer"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const form = useForm<FixedFormType>({
    resolver: zodResolver(matchFormSchema as any),
    defaultValues: {
      team1Id: undefined,
      team2Id: undefined,
      venue: "",
      matchDate: "",
      matchType: "",
      status: "scheduled",
    },
  });

  const createMatchMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending to API:', data);
      const res = await apiRequest("POST", "/api/matches", data);
      const result = await res.json();
      console.log('API response:', result);
      if (!res.ok) {
        throw new Error(result.message || 'Failed to create match');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/organizer"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Match created successfully!",
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

  const updateMatchStatusMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/matches/${matchId}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/organizer"] });
      toast({
        title: "Success",
        description: "Match status updated successfully!",
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

  const onCreateMatch = (data: FixedFormType) => {
    // Make sure we have a valid date format for the server
    console.log('Form data before submission:', data);
    
    try {
      // Make sure date is in ISO format
      if (data.matchDate) {
        // Create a proper match payload
        const matchData = {
          ...data,
          team1Id: Number(data.team1Id),
          team2Id: Number(data.team2Id),
          matchDate: new Date(data.matchDate).toISOString()
        };
        console.log('Submitting match data:', matchData);
        createMatchMutation.mutate(matchData);
      } else {
        toast({
          title: "Validation Error",
          description: "Please enter a valid match date and time",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error processing form data:', err);
      toast({
        title: "Error",
        description: "There was an error processing your form data",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      live: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.scheduled}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getTeamName = (teamId: number) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || `Team ${teamId}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Match Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Create and manage cricket matches
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Match
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Match</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onCreateMatch as any)} className="space-y-6">
                  <FormField
                    control={form.control}
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
                            {teams.map((team) => (
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
                    control={form.control}
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
                            {teams.map((team) => (
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
                    control={form.control}
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
                    control={form.control}
                    name="matchDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            type="datetime-local" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="matchType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Type</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="T20">T20</SelectItem>
                              <SelectItem value="ODI">ODI</SelectItem>
                              <SelectItem value="Test">Test</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMatchMutation.isPending}
                      className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                    >
                      {createMatchMutation.isPending ? "Creating..." : "Create Match"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-[#DC143C]">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">
                    {getTeamName(match.team1Id)} vs {getTeamName(match.team2Id)}
                  </CardTitle>
                  {getStatusBadge(match.status || 'scheduled')}
                </div>
                <CardDescription className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{match.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(match.matchDate), "PPP p")}</span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {match.status === "scheduled" && (
                        <Button
                          size="sm"
                          onClick={() => updateMatchStatusMutation.mutate({
                            matchId: match.id,
                            status: "live"
                          })}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {match.status === "live" && (
                        <Button
                          size="sm"
                          onClick={() => updateMatchStatusMutation.mutate({
                            matchId: match.id,
                            status: "completed"
                          })}
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          <Square className="h-4 w-4 mr-1" />
                          End
                        </Button>
                      )}
                    </div>
                    
                    {match.status === "live" && (
                      <Button size="sm" asChild>
                        <a href={`/match/${match.id}/scoring`}>
                          Live Score
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {matches.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No matches created yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start by creating your first cricket match
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
            >
              Create Your First Match
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}