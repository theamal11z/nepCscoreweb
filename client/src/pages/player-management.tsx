import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  UserPlus, 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  Users, 
  FileText,
  AlertCircle,
  Star,
  Calendar,
  Target
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema } from "@shared/schema";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team, Player } from "@shared/schema";

const playerFormSchema = insertPlayerSchema.extend({
  teamId: z.number().min(1, "Please select a team"),
  role: z.enum(["batsman", "bowler", "all-rounder", "wicket-keeper"]),
  experience: z.string().optional(),
});

type PlayerFormData = z.infer<typeof playerFormSchema>;

interface PendingPlayer {
  id: number;
  name: string;
  email: string;
  role: string;
  teamName: string;
  teamId: number;
  experience: string;
  appliedDate: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PlayerManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Mock pending players data - in real app, this would come from your API
  const pendingPlayers: PendingPlayer[] = [
    {
      id: 1,
      name: "Rohit Sharma",
      email: "rohit.sharma@email.com",
      role: "batsman",
      teamName: "rockend",
      teamId: 1,
      experience: "5 years domestic cricket",
      appliedDate: "2025-05-26",
      status: "pending"
    },
    {
      id: 2,
      name: "Jasprit Bumrah",
      email: "jasprit.bumrah@email.com",
      role: "bowler",
      teamName: "rockend",
      teamId: 1,
      experience: "3 years international experience",
      appliedDate: "2025-05-25",
      status: "pending"
    },
    {
      id: 3,
      name: "Hardik Pandya",
      email: "hardik.pandya@email.com",
      role: "all-rounder",
      teamName: "rockend",
      teamId: 1,
      experience: "4 years professional cricket",
      appliedDate: "2025-05-24",
      status: "approved"
    }
  ];

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      role: "batsman",
      teamId: undefined,
      experience: "",
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: async (data: PlayerFormData) => {
      const res = await apiRequest("POST", "/api/players", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      setIsAddDialogOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Player added successfully!",
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

  const approvePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/players/${playerId}/approve`, { isApproved: true });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player approved successfully!",
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

  const rejectPlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/players/${playerId}/approve`, { isApproved: false });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player application rejected",
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

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      toast({
        title: "CSV File Selected",
        description: `${file.name} ready for import`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid CSV file",
        variant: "destructive",
      });
    }
  };

  const handleCsvImport = () => {
    if (!csvFile) return;
    
    // In real app, you would parse the CSV and send to API
    toast({
      title: "CSV Import Started",
      description: "Processing player data from CSV file...",
    });
    
    // Simulate processing
    setTimeout(() => {
      toast({
        title: "Import Completed",
        description: "Players have been added for approval",
      });
      setCsvFile(null);
    }, 2000);
  };

  const onAddPlayer = (data: PlayerFormData) => {
    addPlayerMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      batsman: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      bowler: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "all-rounder": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "wicket-keeper": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    };
    
    return (
      <Badge className={colors[role as keyof typeof colors]}>
        {role.replace("-", " ").toUpperCase()}
      </Badge>
    );
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

  const filteredPlayers = pendingPlayers.filter(player => {
    if (selectedFilter === "all") return true;
    return player.status === selectedFilter;
  });

  const pendingCount = pendingPlayers.filter(p => p.status === "pending").length;
  const approvedCount = pendingPlayers.filter(p => p.status === "approved").length;
  const rejectedCount = pendingPlayers.filter(p => p.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Player Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add new players and manage approval requests
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV Template
            </Button>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Player
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddPlayer)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter player's full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter email address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="teamId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Team</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select team" />
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
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Player Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
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
                          <FormLabel>Experience (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe player's cricket experience..."
                              {...field}
                              rows={3}
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
                        onClick={() => setIsAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={addPlayerMutation.isPending}
                        className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                      >
                        {addPlayerMutation.isPending ? "Adding..." : "Add Player"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Waiting for review
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">
                Active players
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedCount}</div>
              <p className="text-xs text-muted-foreground">
                Applications declined
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="approvals" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="approvals">Player Approvals</TabsTrigger>
            <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="approvals" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button
                    variant={selectedFilter === "all" ? "default" : "outline"}
                    onClick={() => setSelectedFilter("all")}
                  >
                    All ({pendingPlayers.length})
                  </Button>
                  <Button
                    variant={selectedFilter === "pending" ? "default" : "outline"}
                    onClick={() => setSelectedFilter("pending")}
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={selectedFilter === "approved" ? "default" : "outline"}
                    onClick={() => setSelectedFilter("approved")}
                  >
                    Approved ({approvedCount})
                  </Button>
                  <Button
                    variant={selectedFilter === "rejected" ? "default" : "outline"}
                    onClick={() => setSelectedFilter("rejected")}
                  >
                    Rejected ({rejectedCount})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Player Applications */}
            <div className="space-y-4">
              {filteredPlayers.map((player) => (
                <Card key={player.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-[#DC143C] text-white">
                            {getInitials(player.name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold">{player.name}</h4>
                            {getRoleBadge(player.role)}
                            {getStatusBadge(player.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <span className="font-medium">Email:</span> {player.email}
                            </div>
                            <div>
                              <span className="font-medium">Team:</span> {player.teamName}
                            </div>
                            <div>
                              <span className="font-medium">Applied:</span> {new Date(player.appliedDate).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {player.experience && (
                            <div className="mt-3">
                              <span className="font-medium text-sm">Experience:</span>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {player.experience}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {player.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => approvePlayerMutation.mutate(player.id)}
                            disabled={approvePlayerMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectPlayerMutation.mutate(player.id)}
                            disabled={rejectPlayerMutation.isPending}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No applications found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFilter === "all" 
                      ? "No player applications to show"
                      : `No ${selectedFilter} applications at the moment`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="bulk-import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-[#DC143C]" />
                  <span>Bulk Player Import</span>
                </CardTitle>
                <CardDescription>
                  Import multiple players at once using a CSV file
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Upload CSV File</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Select a CSV file containing player information
                  </p>
                  
                  <div className="space-y-4">
                    <Input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="max-w-xs mx-auto"
                    />
                    
                    {csvFile && (
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">{csvFile.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">CSV Format Requirements:</h5>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Columns: Full Name, Email, Role, Team, Experience (optional)</li>
                    <li>• Roles: batsman, bowler, all-rounder, wicket-keeper</li>
                    <li>• Maximum 50 players per import</li>
                    <li>• All imported players will require approval</li>
                  </ul>
                </div>
                
                <div className="flex justify-between items-center">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                  
                  <Button
                    onClick={handleCsvImport}
                    disabled={!csvFile}
                    className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import Players
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}