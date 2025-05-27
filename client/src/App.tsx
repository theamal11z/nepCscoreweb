import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import LandingPage from "@/pages/landing-page";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import AboutPage from "@/pages/about-page";
import MatchDetail from "@/pages/match-detail";
import PlayerProfile from "@/pages/player-profile";
import AdminPanel from "@/pages/admin-panel";
import TeamManagement from "@/pages/team-management";
import MatchManagement from "@/pages/match-management";
import LiveScoring from "@/pages/live-scoring";
import OrganizerDashboard from "@/pages/organizer-dashboard";
import NotificationsPage from "@/pages/notifications";
import StatsPage from "@/pages/stats";
import TeamDetails from "@/pages/team-details";
import PlayerManagement from "@/pages/player-management";
import OrganizerProfile from "@/pages/organizer-profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={OrganizerDashboard} />
      <ProtectedRoute path="/teams" component={TeamManagement} />
      <ProtectedRoute path="/team/:id" component={TeamDetails} />
      <ProtectedRoute path="/matches" component={MatchManagement} />
      <ProtectedRoute path="/match/:id" component={MatchDetail} />
      <ProtectedRoute path="/match/:id/scoring" component={LiveScoring} />
      <ProtectedRoute path="/stats" component={StatsPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/players" component={PlayerManagement} />
      <ProtectedRoute path="/profile" component={OrganizerProfile} />
      <ProtectedRoute path="/player/:id" component={PlayerProfile} />
      <ProtectedRoute path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
