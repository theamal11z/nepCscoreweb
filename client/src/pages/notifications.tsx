import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info, 
  Clock, 
  Users, 
  Calendar, 
  Trophy,
  Eye,
  EyeOff,
  Trash2,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface Notification {
  id: number;
  type: 'info' | 'action_required' | 'completed';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high';
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'info' | 'action_required' | 'completed'>('all');

  // Mock notifications data - in real app, this would come from your API
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'action_required',
      title: 'Team Registration Pending',
      message: 'Mumbai Warriors has requested to join the tournament. Review their application.',
      timestamp: '2025-05-27T10:30:00Z',
      isRead: false,
      actionUrl: '/teams/pending',
      priority: 'high'
    },
    {
      id: 2,
      type: 'action_required',
      title: 'Player Approval Required',
      message: '3 new players are waiting for approval to join their respective teams.',
      timestamp: '2025-05-27T09:15:00Z',
      isRead: false,
      actionUrl: '/players/pending',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'completed',
      title: 'Match Completed',
      message: 'Chennai Super Kings defeated Mumbai Indians by 6 wickets. Match results have been recorded.',
      timestamp: '2025-05-27T08:45:00Z',
      isRead: true,
      priority: 'low'
    },
    {
      id: 4,
      type: 'info',
      title: 'Tournament Schedule Updated',
      message: 'The semifinal matches have been rescheduled due to weather conditions.',
      timestamp: '2025-05-26T16:20:00Z',
      isRead: false,
      priority: 'medium'
    },
    {
      id: 5,
      type: 'completed',
      title: 'Live Scoring Session Ended',
      message: 'Live scoring for Match #12 has been completed successfully.',
      timestamp: '2025-05-26T14:30:00Z',
      isRead: true,
      priority: 'low'
    },
    {
      id: 6,
      type: 'info',
      title: 'New Team Registered',
      message: 'Delhi Capitals has successfully registered for the upcoming tournament.',
      timestamp: '2025-05-26T11:15:00Z',
      isRead: false,
      priority: 'low'
    }
  ];

  const [notificationState, setNotificationState] = useState(notifications);

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      // In real app, this would call your API
      return Promise.resolve();
    },
    onSuccess: (_, notificationId) => {
      setNotificationState(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      toast({
        title: "Success",
        description: "Notification marked as read",
      });
    }
  });

  const markAsUnreadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return Promise.resolve();
    },
    onSuccess: (_, notificationId) => {
      setNotificationState(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: false } : n)
      );
      toast({
        title: "Success",
        description: "Notification marked as unread",
      });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return Promise.resolve();
    },
    onSuccess: (_, notificationId) => {
      setNotificationState(prev => prev.filter(n => n.id !== notificationId));
      toast({
        title: "Success",
        description: "Notification deleted",
      });
    }
  });

  const filteredNotifications = notificationState.filter(notification => {
    if (selectedFilter === 'all') return true;
    return notification.type === selectedFilter;
  });

  const unreadCount = notificationState.filter(n => !n.isRead).length;
  const actionRequiredCount = notificationState.filter(n => n.type === 'action_required' && !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'action_required':
        return AlertCircle;
      case 'completed':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const baseColors = {
      action_required: 'border-l-red-500 bg-red-50 dark:bg-red-950',
      completed: 'border-l-green-500 bg-green-50 dark:bg-green-950',
      info: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
    };
    
    if (isRead) {
      return `${baseColors[type as keyof typeof baseColors]} opacity-60`;
    }
    
    return baseColors[type as keyof typeof baseColors];
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    };
    
    return (
      <Badge className={variants[priority as keyof typeof variants]}>
        {priority.toUpperCase()}
      </Badge>
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stay updated with tournament activities and important alerts
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-[#DC143C] text-white">
              {unreadCount} Unread
            </Badge>
            {actionRequiredCount > 0 && (
              <Badge className="bg-red-500 text-white">
                {actionRequiredCount} Action Required
              </Badge>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Required</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{actionRequiredCount}</div>
              <p className="text-xs text-muted-foreground">
                Pending your attention
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">
                New notifications
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationState.length}</div>
              <p className="text-xs text-muted-foreground">
                All notifications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs value={selectedFilter} onValueChange={(value) => setSelectedFilter(value as any)}>
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="action_required">Action Required</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedFilter} className="space-y-4">
            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`border-l-4 transition-all hover:shadow-md ${getNotificationColor(notification.type, notification.isRead)}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-2 rounded-full ${
                            notification.type === 'action_required' ? 'bg-red-100 text-red-600' :
                            notification.type === 'completed' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <CardTitle className={`text-lg ${!notification.isRead ? 'font-bold' : 'font-medium'}`}>
                                {notification.title}
                              </CardTitle>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-[#DC143C] rounded-full"></div>
                              )}
                            </div>
                            <CardDescription className="text-gray-700 dark:text-gray-300">
                              {notification.message}
                            </CardDescription>
                            <div className="flex items-center space-x-3 mt-2">
                              <div className="flex items-center space-x-1 text-sm text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>{formatTime(notification.timestamp)}</span>
                              </div>
                              {getPriorityBadge(notification.priority)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-2">
                          {notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsUnreadMutation.mutate(notification.id)}
                            >
                              <EyeOff className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notification.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteNotificationMutation.mutate(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {notification.actionUrl && notification.type === 'action_required' && (
                      <CardContent className="pt-0">
                        <Button 
                          className="bg-[#DC143C] hover:bg-[#B91C3C] text-white"
                          onClick={() => window.location.href = notification.actionUrl!}
                        >
                          Take Action
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No notifications found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFilter === 'all' 
                      ? "You're all caught up! No notifications to show."
                      : `No ${selectedFilter.replace('_', ' ')} notifications at the moment.`
                    }
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}