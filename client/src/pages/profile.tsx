import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import FanProfileInfo from "@/components/fan-profile-info";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { User, Settings, Lock, Bell, Eye, Activity } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  // Define additional profile fields that aren't in the User type yet
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: "", // These fields aren't in the User type yet but we're adding UI for them
    bio: "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: {fullName: string, email: string}) => {
      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      return await response.json();
    },
    onSuccess: (updatedUser) => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      setIsEditing(false);
      // Update the user data in the auth context
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting profile data:", formData);
    
    // Validate data before submitting
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }
    
    // Only send the fields we want to update
    const dataToUpdate = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim()
      // We'll add phone and bio when the database supports them
    };
    
    updateProfileMutation.mutate(dataToUpdate);
  };

  // Generate user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get role badge color
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

  // Render role-specific profile information
  const renderRoleSpecificInfo = () => {
    if (!user) return null;

    switch (user.role) {
      case "fan":
        return <FanProfileInfo userId={user.id} />;

      case "player":
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Player Statistics</CardTitle>
              <CardDescription>Your cricket performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Matches</p>
                    <p className="text-lg font-bold">24</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Batting Avg</p>
                    <p className="text-lg font-bold">42.5</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Wickets</p>
                    <p className="text-lg font-bold">18</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/player/${user.id}`}>View Full Statistics</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      case "organizer":
        return (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Organizer Dashboard</CardTitle>
              <CardDescription>Your tournament management activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teams</p>
                    <p className="text-lg font-bold">8</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Matches</p>
                    <p className="text-lg font-bold">12</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Live Now</p>
                    <p className="text-lg font-bold">2</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold mb-2">Not Authenticated</h1>
              <p className="text-muted-foreground mb-4">
                Please log in to view your profile.
              </p>
              <Button asChild>
                <a href="/auth">Log In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-16 w-16 border-2 border-primary">
                        <AvatarFallback className="text-lg">
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{user.fullName}</CardTitle>
                        <CardDescription>@{user.username}</CardDescription>
                        <Badge variant="secondary" className={`mt-1 ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                    ) : (
                      <div className="flex space-x-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmit}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label htmlFor="fullName" className="text-sm font-medium">
                              Full Name
                            </label>
                            <Input
                              id="fullName"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleInputChange}
                              placeholder="Your full name"
                              disabled={!isEditing || updateProfileMutation.isPending}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">
                              Username
                            </label>
                            <Input
                              id="username"
                              name="username"
                              value={formData.username}
                              onChange={handleInputChange}
                              placeholder="Your username"
                              disabled={true} // Username can't be changed
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="email" className="text-sm font-medium">
                            Email
                          </label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Your email address"
                            disabled={!isEditing || updateProfileMutation.isPending}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="phone" className="text-sm font-medium">
                            Phone
                          </label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                            disabled={!isEditing || updateProfileMutation.isPending}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="bio" className="text-sm font-medium">
                            Bio
                          </label>
                          <Input
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="A short bio about yourself"
                            disabled={!isEditing || updateProfileMutation.isPending}
                          />
                        </div>
                        {isEditing ? (
                          <div className="flex space-x-2">
                            <Button 
                              type="submit" 
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={updateProfileMutation.isPending}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => setIsEditing(true)}
                          >
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Full Name
                          </h3>
                          <p>{user.fullName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Username
                          </h3>
                          <p>@{user.username}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Email
                          </h3>
                          <p>{user.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground mb-1">
                            Member Since
                          </h3>
                          <p>May 15, 2025</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Bio
                        </h3>
                        <p className="text-sm">
                          {"No bio provided. Click Edit Profile to add a bio."}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {renderRoleSpecificInfo()}
            </TabsContent>

            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="currentPassword">
                          Current Password
                        </label>
                        <Input id="currentPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="newPassword">
                          New Password
                        </label>
                        <Input id="newPassword" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="confirmPassword">
                          Confirm New Password
                        </label>
                        <Input id="confirmPassword" type="password" />
                      </div>
                      <Button className="mt-2">Update Password</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Account Preferences</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive email updates about account activity
                          </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Account Visibility</p>
                          <p className="text-sm text-muted-foreground">
                            Control who can see your profile
                          </p>
                        </div>
                        <Button variant="outline">Configure</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Match Updates</p>
                              <p className="text-sm text-muted-foreground">
                                Get notified about match scores and results
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Team News</p>
                              <p className="text-sm text-muted-foreground">
                                Updates about teams you follow
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Player Milestones</p>
                              <p className="text-sm text-muted-foreground">
                                Updates about players you follow
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Push Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Live Match Alerts</p>
                              <p className="text-sm text-muted-foreground">
                                Get notified when a match goes live
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Enabled
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-3">
                            <Bell className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">Score Updates</p>
                              <p className="text-sm text-muted-foreground">
                                Receive real-time score updates
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Disabled
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
