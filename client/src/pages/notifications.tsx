import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "wouter";

type NotificationType = "info" | "action_required" | "completed";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFilter, setSelectedFilter] = useState<"all" | NotificationType>("all");

  // Function to show toast message when features are clicked
  const showFeatureNotAvailableToast = () => {
    toast({
      title: "Feature not available",
      description: "This feature will be available when real notifications are implemented."
    });
  };
  
  return (
    <div className="container max-w-4xl pt-8 pb-16">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger 
            value="all" 
            onClick={() => setSelectedFilter("all")}
          >
            All
          </TabsTrigger>
          <TabsTrigger 
            value="info" 
            onClick={() => setSelectedFilter("info")}
          >
            <div className="flex items-center">
              <Info className="w-4 h-4 mr-2" />
              Info
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="action_required" 
            onClick={() => setSelectedFilter("action_required")}
          >
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Action Required
            </div>
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            onClick={() => setSelectedFilter("completed")}
          >
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Completed
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No notifications yet</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              When you receive notifications about matches, teams, and players you follow, they'll appear here.
            </p>
            {user?.role === "fan" && (
              <div className="mt-6 flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/teams-browse">Browse Teams</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/players-browse">Browse Players</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="info" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Info className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No info notifications</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              When you receive info notifications, they'll appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="action_required" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No action required notifications</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              When you have tasks that need your attention, they'll appear here.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No completed notifications</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              Completed tasks and actions will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
