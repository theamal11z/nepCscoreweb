import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Trophy, 
  Target, 
  Star,
  Edit,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Team, Player } from "@shared/schema";

interface TeamPlayer {
  id: number;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  isApproved: boolean;
  isCaptain: boolean;
  joinDate: string;
}

export default function TeamDetails() {
  const params = useParams();
  const teamId = parseInt(params.id as string);
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");

  const { data: team } = useQuery<Team>({
    queryKey: ["/api/teams", teamId],
  });

  // Mock players data - in real app, this would come from your API
  const teamPlayers: TeamPlayer[] = [
    {
      id: 1,
      name: "Rajesh Kumar",
      role: "batsman",
      matches: 15,
      runs: 750,
      wickets: 2,
      average: 50.0,
      isApproved: true,
      isCaptain: true,
      joinDate: "2025-01-15"
    },
    {
      id: 2,
      name: "Suresh Thapa",
      role: "bowler",
      matches: 14,
      runs: 120,
      wickets: 28,
      average: 8.5,
      isApproved: true,
      isCaptain: false,
      joinDate: "2025-01-20"
    },
    {
      id: 3,
      name: "Amit Sharma",
      role: "all-rounder",
      matches: 16,
      runs: 480,
      wickets: 18,
      average: 30.0,
      isApproved: true,
      isCaptain: false,
      joinDate: "2025-02-01"
    },
    {
      id: 4,
      name: "Deepak Rai",
      role: "wicket-keeper",
      matches: 12,
      runs: 360,
      wickets: 0,
      average: 30.0,
      isApproved: false,
      isCaptain: false,
      joinDate: "2025-05-20"
    }
  ];

  const approvePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/players/${playerId}/approve`, { isApproved: true });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
      toast({
        title: "Success",
        description: "Player rejected successfully!",
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

  const removePlayerMutation = useMutation({
    mutationFn: async (playerId: number) => {
      const res = await apiRequest("DELETE", `/api/players/${playerId}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId] });
      toast({
        title: "Success",
        description: "Player removed from team!",
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

  const teamStats = {
    totalPlayers: teamPlayers.length,
    approvedPlayers: teamPlayers.filter(p => p.isApproved).length,
    pendingPlayers: teamPlayers.filter(p => !p.isApproved).length,
    totalMatches: Math.max(...teamPlayers.map(p => p.matches)),
    totalRuns: teamPlayers.reduce((sum, p) => sum + p.runs, 0),
    totalWickets: teamPlayers.reduce((sum, p) => sum + p.wickets, 0),
    avgScore: teamPlayers.reduce((sum, p) => sum + p.average, 0) / teamPlayers.length
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading team details...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#DC143C] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              {getInitials(team.name)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{team.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{team.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Established {new Date(team.createdAt || '').getFullYear()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Team
            </Button>
            <Button className="bg-[#DC143C] hover:bg-[#B91C3C] text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-[#DC143C]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Players</CardTitle>
              <Users className="h-4 w-4 text-[#DC143C]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.approvedPlayers} approved, {teamStats.pendingPlayers} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                Across all matches
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Wickets</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalWickets}</div>
              <p className="text-xs text-muted-foreground">
                Team bowling performance
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Average</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.avgScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                Overall batting average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Team Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#DC143C]" />
                    <span>Team Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">About the Team</h4>
                    <p className="text-gray-600 dark:text-gray-400">
                      {team.name} is a professional cricket team based in {team.location}. 
                      The team has been actively participating in various tournaments and 
                      has shown excellent performance with a strong squad of talented players.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Home Ground</span>
                      <p className="font-medium">{team.location} Cricket Stadium</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Founded</span>
                      <p className="font-medium">{new Date(team.createdAt || '').getFullYear()}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Team Captain</span>
                      <p className="font-medium">{teamPlayers.find(p => p.isCaptain)?.name || "To be assigned"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Squad Size</span>
                      <p className="font-medium">{teamStats.approvedPlayers} players</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-[#DC143C]" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Team Details
                  </Button>
                  <Button className="w-full" variant="outline">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Player
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Trophy className="h-4 w-4 mr-2" />
                    View Match History
                  </Button>
                  <Button className="w-full bg-[#DC143C] hover:bg-[#B91C3C] text-white">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            {/* Pending Approvals */}
            {teamStats.pendingPlayers > 0 && (
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-orange-500" />
                      <span>Pending Player Approvals</span>
                    </span>
                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                      {teamStats.pendingPlayers} Pending
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teamPlayers.filter(player => !player.isApproved).map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback className="bg-orange-200 text-orange-800">
                              {getInitials(player.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <div className="flex items-center space-x-2">
                              {getRoleBadge(player.role)}
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                Applied {new Date(player.joinDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
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
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Approved Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#DC143C]" />
                  <span>Team Roster</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamPlayers.filter(player => player.isApproved).map((player) => (
                    <Card key={player.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-[#DC143C] text-white">
                              {getInitials(player.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{player.name}</h4>
                              {player.isCaptain && (
                                <Shield className="h-4 w-4 text-yellow-600" title="Captain" />
                              )}
                            </div>
                            {getRoleBadge(player.role)}
                          </div>
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Remove Player</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p>Are you sure you want to remove {player.name} from the team?</p>
                              <div className="flex justify-end space-x-3">
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  onClick={() => removePlayerMutation.mutate(player.id)}
                                  disabled={removePlayerMutation.isPending}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  Remove Player
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Matches</span>
                          <div className="font-semibold">{player.matches}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Runs</span>
                          <div className="font-semibold">{player.runs}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Wickets</span>
                          <div className="font-semibold">{player.wickets}</div>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Average</span>
                          <div className="font-semibold">{player.average}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#DC143C]" />
                    <span>Batting Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamPlayers
                      .filter(p => p.isApproved)
                      .sort((a, b) => b.runs - a.runs)
                      .slice(0, 5)
                      .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-[#DC143C] rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Avg: {player.average}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{player.runs}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">runs</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-[#DC143C]" />
                    <span>Bowling Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamPlayers
                      .filter(p => p.isApproved && p.wickets > 0)
                      .sort((a, b) => b.wickets - a.wickets)
                      .slice(0, 5)
                      .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{player.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {player.role}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{player.wickets}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">wickets</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}