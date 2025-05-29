import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Users, User, Plus } from "lucide-react";

interface FanProfileInfoProps {
  userId: number;
}

export default function FanProfileInfo({ userId }: FanProfileInfoProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Fan Profile</CardTitle>
        <CardDescription>Your cricket following activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Team & Player Following</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Follow your favorite cricket teams and players to get updates and personalized content.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <Button variant="outline" className="flex items-center gap-1" asChild>
                <a href="/teams-browse">
                  <Users className="h-4 w-4" />
                  <span>Browse Teams</span>
                </a>
              </Button>
              <Button variant="outline" className="flex items-center gap-1" asChild>
                <a href="/players-browse">
                  <User className="h-4 w-4" />
                  <span>Browse Players</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
