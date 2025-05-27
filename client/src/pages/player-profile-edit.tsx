import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Upload, 
  Save, 
  Star,
  Award,
  Video,
  FileText,
  Camera,
  Trophy,
  Target,
  Activity,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Player } from "@shared/schema";

const profileFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  role: z.enum(["batsman", "bowler", "all-rounder", "wicket-keeper"]),
  battingStyle: z.enum(["right-handed", "left-handed"]).optional(),
  bowlingStyle: z.enum(["right-arm-fast", "left-arm-fast", "right-arm-spin", "left-arm-spin"]).optional(),
  bio: z.string().optional(),
  experience: z.string().optional(),
  achievements: z.string().optional(),
  preferredPosition: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export default function PlayerProfileEdit() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const { data: playerProfile } = useQuery<Player>({
    queryKey: ["/api/players/me"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: "",
      role: "batsman",
      battingStyle: "right-handed",
      bowlingStyle: "right-arm-fast",
      bio: "",
      experience: "",
      achievements: "",
      preferredPosition: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      const res = await apiRequest("PATCH", "/api/players/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players/me"] });
      toast({
        title: "Profile Updated!",
        description: "Your cricket profile has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);
      const res = await apiRequest("POST", "/api/players/documents", formData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Document Uploaded!",
        description: "Your cricket document has been uploaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate(data);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      uploadDocumentMutation.mutate(file);
    });
  };

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProfileImage(file);
      toast({
        title: "Profile Image Selected",
        description: "Click Save Changes to update your profile picture.",
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate profile completion percentage
  const calculateCompletion = () => {
    const formData = form.getValues();
    const fields = [
      formData.fullName,
      formData.email,
      formData.role,
      formData.bio,
      formData.experience,
      formData.battingStyle,
      formData.bowlingStyle,
      profileImage ? "image" : "",
      uploadedFiles.length > 0 ? "documents" : ""
    ];
    
    const filledFields = fields.filter(field => field && field.trim() !== "").length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completionPercentage = calculateCompletion();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cricket Profile</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Complete your cricket profile to increase your chances of getting selected
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={`${
              completionPercentage >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              completionPercentage >= 50 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {completionPercentage}% Complete
            </Badge>
            {playerProfile?.isApproved ? (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pending Verification
              </Badge>
            )}
          </div>
        </div>

        {/* Profile Completion Card */}
        <Card className="border-l-4 border-l-[#DC143C]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">Profile Completion</h3>
                <p className="text-gray-600 dark:text-gray-400">Complete your profile to improve visibility</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#DC143C]">{completionPercentage}%</div>
              </div>
            </div>
            <Progress value={completionPercentage} className="h-3" />
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              {completionPercentage < 50 && "Add more details to make your profile stand out"}
              {completionPercentage >= 50 && completionPercentage < 80 && "You're doing great! Add documents to complete your profile"}
              {completionPercentage >= 80 && "Excellent! Your profile is nearly complete"}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="cricket">Cricket Details</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-[#DC143C]" />
                  <span>Personal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex items-center space-x-6">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="bg-[#DC143C] text-white text-2xl">
                          {getInitials(user?.fullName || "P")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold mb-2">Profile Picture</h4>
                        <div className="flex items-center space-x-3">
                          <label htmlFor="profile-image" className="cursor-pointer">
                            <Button variant="outline" asChild>
                              <span>
                                <Camera className="h-4 w-4 mr-2" />
                                Upload Photo
                              </span>
                            </Button>
                          </label>
                          <input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageUpload}
                            className="hidden"
                          />
                          {profileImage && (
                            <span className="text-sm text-green-600">{profileImage.name}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
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
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="+977 XXX-XXX-XXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="preferredPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Position</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Opening Batsman, Fast Bowler" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>About Me</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about your cricket journey, goals, and what makes you unique as a player..."
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cricket" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5 text-[#DC143C]" />
                  <span>Cricket Specialization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Role</FormLabel>
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
                        name="battingStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Batting Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select batting style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="right-handed">Right-handed</SelectItem>
                                <SelectItem value="left-handed">Left-handed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bowlingStyle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bowling Style</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select bowling style" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="right-arm-fast">Right-arm Fast</SelectItem>
                                <SelectItem value="left-arm-fast">Left-arm Fast</SelectItem>
                                <SelectItem value="right-arm-spin">Right-arm Spin</SelectItem>
                                <SelectItem value="left-arm-spin">Left-arm Spin</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cricket Experience</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your cricket experience, teams you've played for, tournaments participated in..."
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="achievements"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Achievements & Awards</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List your cricket achievements, awards, best performances, records..."
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                      className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updateProfileMutation.isPending ? "Saving..." : "Save Cricket Details"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5 text-[#DC143C]" />
                  <span>Cricket Documents</span>
                </CardTitle>
                <CardDescription>
                  Upload your cricket-related documents, certificates, and media
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">Upload Documents</h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Drag and drop files here, or click to select
                  </p>
                  
                  <div className="space-y-4">
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>
                          <FileText className="h-4 w-4 mr-2" />
                          Choose Files
                        </span>
                      </Button>
                    </label>
                    <input
                      id="document-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* File Types Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600 mb-2" />
                    <h5 className="font-semibold">Certificates</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cricket course certificates, coaching credentials
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Video className="h-8 w-8 text-green-600 mb-2" />
                    <h5 className="font-semibold">Performance Videos</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Batting, bowling, or fielding highlights
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <Award className="h-8 w-8 text-purple-600 mb-2" />
                    <h5 className="font-semibold">Awards & Stats</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tournament awards, statistics sheets
                    </p>
                  </div>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Uploaded Files</h4>
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Uploaded
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}