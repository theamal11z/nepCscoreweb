import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, 
  MapPin, 
  Calendar, 
  UserPlus, 
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Star,
  Trophy,
  Target
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team } from "@shared/schema";

const applicationSchema = z.object({
  teamId: z.number().min(1, "Please select a team"),
  role: z.enum(["batsman", "bowler", "all-rounder", "wicket-keeper"]),
  experience: z.string().min(10, "Please describe your cricket experience"),
  whyJoin: z.string().min(20, "Please explain why you want to join this team"),
  availability: z.string().min(5, "Please mention your availability"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface TeamApplication {
  id: number;
  teamId: number;
  teamName: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  role: string;
  experience: string;
  whyJoin: string;
}

export default function TeamApplications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Mock applications data - in real app, this would come from your API
  const myApplications: TeamApplication[] = [
    {
      id: 1,
      teamId: 1,
      teamName: "rockend",
      status: "pending",
      appliedDate: "2025-05-26",
      role: "all-rounder",
      experience: "5 years of local cricket experience",
      whyJoin: "I want to contribute to team success with my batting and bowling skills"
    },
    {
      id: 2,
      teamId: 2,
      teamName: "Mumbai Warriors",
      status: "approved",
      appliedDate: "2025-05-20",
      role: "batsman",
      experience: "3 years domestic cricket",
      whyJoin: "Looking for competitive cricket opportunities"
    }
  ];

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      teamId: undefined,
      role: "batsman",
      experience: "",
      whyJoin: "",
      availability: "",
    },
  });

  const applyToTeamMutation = useMutation({
    mutationFn: async (data: ApplicationFormData) => {
      const res = await apiRequest("POST", "/api/teams/apply", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams/applications"] });
      setIsApplyDialogOpen(false);
      form.reset();
      toast({
        title: "Application Submitted!",
        description: "Your team application has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Application Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cancelApplicationMutation = useMutation({
    mutationFn: async (applicationId: number) => {
      const res = await apiRequest("DELETE", `/api/teams/applications/${applicationId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams/applications"] });
      toast({
        title: "Application Cancelled",
        description: "Your team application has been cancelled.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitApplication = (data: ApplicationFormData) => {
    applyToTeamMutation.mutate(data);
  };

  const handleApplyClick = (teamId: number) => {
    setSelectedTeamId(teamId);
    form.setValue("teamId", teamId);
    setIsApplyDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === "all" || team.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    return matchesSearch && matchesLocation;
  });

  const pendingApplications = myApplications.filter(app => app.status === "pending").length;
  const approvedApplications = myApplications.filter(app => app.status === "approved").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Team Applications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Browse teams and apply to join your favorite cricket teams
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
              {pendingApplications} Pending
            </Badge>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {approvedApplications} Approved
            </Badge>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-[#DC143C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Teams</CardTitle>
              <Users className="h-4 w-4 text-[#DC143C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teams.length}</div>
              <p className="text-xs text-muted-foreground">
                Across different locations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApplications}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Applications</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Teams joined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="browse">Browse Teams</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-[#DC143C]" />
                  <span>Find Teams</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search Teams</label>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                      <Input
                        placeholder="Search by team name or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Filter by Location</label>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Locations</SelectItem>
                        <SelectItem value="kathmandu">Kathmandu</SelectItem>
                        <SelectItem value="birgunj">Birgunj</SelectItem>
                        <SelectItem value="pokhara">Pokhara</SelectItem>
                        <SelectItem value="chitwan">Chitwan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#DC143C] text-white">
                          {getInitials(team.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <CardDescription className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{team.location}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Founded:</span>
                          <div className="font-semibold">{new Date(team.createdAt || '').getFullYear()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Players:</span>
                          <div className="font-semibold">15-20</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">Looking for: All-rounders, Bowlers</span>
                      </div>
                      
                      <div className="pt-4">
                        <Button
                          onClick={() => handleApplyClick(team.id)}
                          className="w-full bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Apply to Join
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTeams.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No teams found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search criteria or check back later for new teams.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="space-y-4">
              {myApplications.map((application) => (
                <Card key={application.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#DC143C] text-white">
                            {getInitials(application.teamName)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold">{application.teamName}</h4>
                            {getStatusBadge(application.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                            <div>
                              <span className="font-medium">Applied as:</span> {application.role}
                            </div>
                            <div>
                              <span className="font-medium">Applied on:</span> {new Date(application.appliedDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium">Experience:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">{application.experience}</p>
                            </div>
                            <div>
                              <span className="font-medium">Why join:</span>
                              <p className="text-gray-600 dark:text-gray-400 mt-1">{application.whyJoin}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {application.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelApplicationMutation.mutate(application.id)}
                            disabled={cancelApplicationMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        )}
                        
                        {application.status === "approved" && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                            <Trophy className="h-4 w-4 mr-1" />
                            View Team
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {myApplications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No applications yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start by browsing available teams and applying to join them.
                  </p>
                  <Button
                    onClick={() => setSelectedTab?.("browse")}
                    className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                  >
                    Browse Teams
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Application Dialog */}
        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Apply to Team</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitApplication)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="batsman">Batsman</SelectItem>
                          <SelectItem value="bowler">Bowler</SelectItem>
                          <SelectItem value="all-rounder">All-rounder</SelectItem>
                          <SelectItem value="wicket-keeper">Wicket-keeper</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cricket Experience</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your cricket experience, achievements, and skills..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="whyJoin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to join this team?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explain your motivation for joining this team..."
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Weekends, Evenings, Flexible"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsApplyDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={applyToTeamMutation.isPending}
                    className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                  >
                    {applyToTeamMutation.isPending ? "Submitting..." : "Submit Application"}
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