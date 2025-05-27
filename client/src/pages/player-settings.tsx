import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Lock, 
  Bell, 
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  UserX
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationFormSchema = z.object({
  matchInvites: z.boolean(),
  teamUpdates: z.boolean(),
  applicationStatus: z.boolean(),
  liveMatchAlerts: z.boolean(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
});

type PasswordFormData = z.infer<typeof passwordFormSchema>;
type NotificationFormData = z.infer<typeof notificationFormSchema>;

export default function PlayerSettings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const notificationForm = useForm<NotificationFormData>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      matchInvites: true,
      teamUpdates: true,
      applicationStatus: true,
      liveMatchAlerts: false,
      emailNotifications: true,
      smsNotifications: false,
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormData) => {
      const res = await apiRequest("PATCH", "/api/user/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return await res.json();
    },
    onSuccess: () => {
      passwordForm.reset();
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password Change Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: NotificationFormData) => {
      const res = await apiRequest("PATCH", "/api/user/notifications", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
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

  const deactivateAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/user/deactivate");
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deactivated",
        description: "Your account has been deactivated. You can reactivate it by logging in again.",
      });
      logoutMutation.mutate();
    },
    onError: (error: Error) => {
      toast({
        title: "Deactivation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onChangePassword = (data: PasswordFormData) => {
    changePasswordMutation.mutate(data);
  };

  const onUpdateNotifications = (data: NotificationFormData) => {
    updateNotificationsMutation.mutate(data);
  };

  const handleDeactivateAccount = () => {
    if (showDeactivateDialog) {
      deactivateAccountMutation.mutate();
    } else {
      setShowDeactivateDialog(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your account security and preferences
          </p>
        </div>

        {/* Password Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5 text-[#DC143C]" />
              <span>Change Password</span>
            </CardTitle>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showCurrentPassword ? "text" : "password"}
                            {...field} 
                            placeholder="Enter your current password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showNewPassword ? "text" : "password"}
                            {...field} 
                            placeholder="Enter your new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            {...field} 
                            placeholder="Confirm your new password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                    Password Requirements:
                  </h5>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    <li>• At least 8 characters long</li>
                    <li>• Include both uppercase and lowercase letters</li>
                    <li>• Include at least one number</li>
                    <li>• Include at least one special character</li>
                  </ul>
                </div>
                
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {changePasswordMutation.isPending ? "Updating..." : "Change Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-[#DC143C]" />
              <span>Notification Preferences</span>
            </CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationForm}>
              <form onSubmit={notificationForm.handleSubmit(onUpdateNotifications)} className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Cricket Notifications</h4>
                  
                  <FormField
                    control={notificationForm.control}
                    name="matchInvites"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Match Invites</FormLabel>
                          <FormDescription>
                            Get notified when teams invite you to join matches
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="teamUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Team Updates</FormLabel>
                          <FormDescription>
                            Receive updates from teams you've applied to or joined
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="applicationStatus"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Application Status</FormLabel>
                          <FormDescription>
                            Get notified when your team applications are approved or rejected
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="liveMatchAlerts"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Live Match Alerts</FormLabel>
                          <FormDescription>
                            Receive real-time notifications during live matches
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-semibold">Communication Preferences</h4>
                  
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive notifications via email
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="smsNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">SMS Notifications</FormLabel>
                          <FormDescription>
                            Receive important notifications via SMS
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={updateNotificationsMutation.isPending}
                  className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-[#DC143C]" />
              <span>Account Security</span>
            </CardTitle>
            <CardDescription>
              Manage your account security and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button variant="outline">
                Enable 2FA
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Login Sessions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your active login sessions
                </p>
              </div>
              <Button variant="outline">
                View Sessions
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Privacy Settings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Control who can see your profile and statistics
                </p>
              </div>
              <Button variant="outline">
                Manage Privacy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription>
              These actions cannot be undone. Please be careful.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showDeactivateDialog ? (
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400">Deactivate Account</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Temporarily deactivate your account. You can reactivate it by logging in again.
                  </p>
                </div>
                <Button 
                  variant="destructive"
                  onClick={handleDeactivateAccount}
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Deactivate
                </Button>
              </div>
            ) : (
              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950">
                <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                  Are you sure you want to deactivate your account?
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  This will temporarily disable your account. Your data will be preserved and you can reactivate by logging in again.
                </p>
                <div className="flex space-x-3">
                  <Button 
                    variant="destructive"
                    onClick={handleDeactivateAccount}
                    disabled={deactivateAccountMutation.isPending}
                  >
                    {deactivateAccountMutation.isPending ? "Deactivating..." : "Yes, Deactivate"}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowDeactivateDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}