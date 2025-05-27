import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Calendar, 
  BarChart3, 
  Settings, 
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  AlertTriangle
} from "lucide-react";
import type { User, Player, Match, Team } from "@shared/schema";

export default function AdminDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Data queries
  const { data: allUsers, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: pendingUsers, isLoading: pendingUsersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/pending-users"],
  });

  const { data: pendingPlayers, isLoading: pendingPlayersLoading } = useQuery<Player[]>({
    queryKey: ["/api/admin/pending-players"],
  });

  const { data: allMatches, isLoading: matchesLoading } = useQuery<Match[]>({
    queryKey: ["/api/matches"],
  });

  const { data: allTeams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Mutations
  const updateUserApprovalMutation = useMutation({
    mutationFn: async ({ userId, isApproved }: { userId: number; isApproved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/approve`, { isApproved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-users"] });
      toast({
        title: "User approval updated",
        description: "User approval status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user approval",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/users/${userId}/role`, { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User role updated",
        description: "User role has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePlayerApprovalMutation = useMutation({
    mutationFn: async ({ playerId, isApproved }: { playerId: number; isApproved: boolean }) => {
      const res = await apiRequest("PATCH", `/api/admin/players/${playerId}/approve`, { isApproved });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-players"] });
      toast({
        title: "Player approval updated",
        description: "Player approval status has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update player approval",
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "organizer":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "player":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "fan":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === "all" || 
                         (userFilter === "approved" && user.isApproved) ||
                         (userFilter === "pending" && !user.isApproved) ||
                         (userFilter === user.role);
    
    return matchesSearch && matchesFilter;
  }) || [];

  // Calculate statistics
  const totalUsers = allUsers?.length || 0;
  const approvedUsers = allUsers?.filter(user => user.isApproved).length || 0;
  const pendingUserApprovals = pendingUsers?.length || 0;
  const pendingPlayerApprovals = pendingPlayers?.length || 0;
  const totalMatches = allMatches?.length || 0;
  const liveMatches = allMatches?.filter(match => match.status === "live").length || 0;
  const totalTeams = allTeams?.length || 0;

  const userRoleDistribution = allUsers?.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, oversee platform operations, and ensure quality standards across nepCscore
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold text-primary">{totalUsers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {approvedUsers} approved
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Approvals</p>
                <p className="text-3xl font-bold text-primary">
                  {pendingUserApprovals + pendingPlayerApprovals}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingUserApprovals} users, {pendingPlayerApprovals} players
                </p>
              </div>
              <Clock className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Live Matches</p>
                <p className="text-3xl font-bold text-primary">{liveMatches}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalMatches} total matches
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
                <p className="text-sm font-medium text-muted-foreground">Active Teams</p>
                <p className="text-3xl font-bold text-primary">{totalTeams}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Registered teams
                </p>
              </div>
              <Shield className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {(pendingUserApprovals + pendingPlayerApprovals) > 0 && (
              <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                {pendingUserApprovals + pendingPlayerApprovals}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Management Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <h2 className="text-2xl font-bold text-foreground">User Management</h2>
            <div className="flex gap-3 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={userFilter} onValueChange={setUserFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="organizer">Organizers</SelectItem>
                  <SelectItem value="player">Players</SelectItem>
                  <SelectItem value="fan">Fans</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <Card>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading users...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {getInitials(user.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-muted-foreground">@{user.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isApproved ? "default" : "secondary"}>
                            {user.isApproved ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approved
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt || "").toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                </DialogHeader>
                                {selectedUser && (
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                      <Avatar className="h-16 w-16">
                                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                                          {getInitials(selectedUser.fullName)}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <h3 className="text-xl font-semibold">{selectedUser.fullName}</h3>
                                        <p className="text-muted-foreground">@{selectedUser.username}</p>
                                        <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Role</label>
                                        <Select
                                          value={selectedUser.role}
                                          onValueChange={(role) => {
                                            updateUserRoleMutation.mutate({
                                              userId: selectedUser.id,
                                              role
                                            });
                                            setSelectedUser({ ...selectedUser, role });
                                          }}
                                        >
                                          <SelectTrigger className="mt-1">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="fan">Fan</SelectItem>
                                            <SelectItem value="organizer">Organizer</SelectItem>
                                            <SelectItem value="player">Player</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium">Approval Status</label>
                                        <div className="mt-1 flex gap-2">
                                          <Button
                                            variant={selectedUser.isApproved ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                              updateUserApprovalMutation.mutate({
                                                userId: selectedUser.id,
                                                isApproved: true
                                              });
                                              setSelectedUser({ ...selectedUser, isApproved: true });
                                            }}
                                          >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Approve
                                          </Button>
                                          <Button
                                            variant={!selectedUser.isApproved ? "destructive" : "outline"}
                                            size="sm"
                                            onClick={() => {
                                              updateUserApprovalMutation.mutate({
                                                userId: selectedUser.id,
                                                isApproved: false
                                              });
                                              setSelectedUser({ ...selectedUser, isApproved: false });
                                            }}
                                          >
                                            <XCircle className="w-4 h-4 mr-1" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="text-muted-foreground">Joined:</span>
                                        <div>{new Date(selectedUser.createdAt || "").toLocaleDateString()}</div>
                                      </div>
                                      <div>
                                        <span className="text-muted-foreground">Status:</span>
                                        <div>
                                          <Badge variant={selectedUser.isApproved ? "default" : "secondary"}>
                                            {selectedUser.isApproved ? "Approved" : "Pending"}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Pending Approvals</h2>

          {/* Pending Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending User Approvals</span>
                <Badge variant="secondary">{pendingUserApprovals}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingUsersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pending users...</p>
                </div>
              ) : pendingUsers && pendingUsers.length > 0 ? (
                <div className="space-y-4">
                  {pendingUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            @{user.username} • {user.email}
                          </div>
                          <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateUserApprovalMutation.mutate({
                            userId: user.id,
                            isApproved: true
                          })}
                          disabled={updateUserApprovalMutation.isPending}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updateUserApprovalMutation.mutate({
                            userId: user.id,
                            isApproved: false
                          })}
                          disabled={updateUserApprovalMutation.isPending}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending user approvals</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Players */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Player Approvals</span>
                <Badge variant="secondary">{pendingPlayerApprovals}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingPlayersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pending players...</p>
                </div>
              ) : pendingPlayers && pendingPlayers.length > 0 ? (
                <div className="space-y-4">
                  {pendingPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">Player ID: {player.id}</div>
                        <div className="text-sm text-muted-foreground">
                          Position: {player.position || "Not specified"} • 
                          Batting: {player.battingStyle || "Not specified"} • 
                          Bowling: {player.bowlingStyle || "Not specified"}
                        </div>
                        {player.teamId && (
                          <Badge variant="outline" className="mt-1">
                            Team {player.teamId}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updatePlayerApprovalMutation.mutate({
                            playerId: player.id,
                            isApproved: true
                          })}
                          disabled={updatePlayerApprovalMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => updatePlayerApprovalMutation.mutate({
                            playerId: player.id,
                            isApproved: false
                          })}
                          disabled={updatePlayerApprovalMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending player approvals</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Match Management</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="font-semibold mb-2">Live Matches</h3>
                <p className="text-3xl font-bold text-primary">{liveMatches}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Total Matches</h3>
                <p className="text-3xl font-bold text-primary">{totalMatches}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Completed</h3>
                <p className="text-3xl font-bold text-primary">
                  {allMatches?.filter(m => m.status === "completed").length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {matchesLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading matches...</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Match Management Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced match management tools will be available here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Team Management</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Registered Teams</span>
                <Badge variant="secondary">{totalTeams}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading teams...</p>
                </div>
              ) : allTeams && allTeams.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTeams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <Shield className="text-white w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{team.name}</h4>
                            <p className="text-sm text-muted-foreground">{team.location}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">Team #{team.id}</Badge>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No teams registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Platform Analytics</h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(userRoleDistribution).map(([role, count]) => (
                    <div key={role} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={getRoleBadgeColor(role)}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${(count / totalUsers) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Platform Health */}
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">User Approval Rate</span>
                    <span className="font-semibold">
                      {totalUsers > 0 ? Math.round((approvedUsers / totalUsers) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Active Live Matches</span>
                    <span className="font-semibold">{liveMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Teams per Match</span>
                    <span className="font-semibold">
                      {totalMatches > 0 ? (totalTeams / totalMatches * 2).toFixed(1) : "0.0"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Pending Actions</span>
                    <span className="font-semibold text-orange-600">
                      {pendingUserApprovals + pendingPlayerApprovals}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed charts, graphs, and insights about platform usage, user engagement, 
                  and cricket activity across Nepal will be available here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
