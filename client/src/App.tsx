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
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";
import TeamsBrowsePage from "@/pages/teams-browse";
import PlayersBrowsePage from "@/pages/players-browse";
import FanFollowingPage from "@/pages/fan-following";
import MatchesBrowsePage from "@/pages/matches-browse";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/home" component={HomePage} /> {/* Fan default landing page */}
      
      {/* Fan-specific routes */}
      <ProtectedRoute path="/teams-browse" component={TeamsBrowsePage} allowedRoles={['fan']} />
      <ProtectedRoute path="/players-browse" component={PlayersBrowsePage} allowedRoles={['fan']} />
      <ProtectedRoute path="/fan-following" component={FanFollowingPage} allowedRoles={['fan']} />
      <ProtectedRoute path="/matches-browse" component={MatchesBrowsePage} allowedRoles={['fan']} />
      
      {/* Player landing page */}
      <ProtectedRoute path="/player" component={PlayerProfile} allowedRoles={['player']} /> 
      
      {/* Organizer dashboard and management pages */}
      <ProtectedRoute path="/dashboard" component={OrganizerDashboard} allowedRoles={['organizer', 'admin']} />
      <ProtectedRoute path="/teams" component={TeamManagement} allowedRoles={['organizer', 'admin', 'player']} />
      <ProtectedRoute path="/team/:id" component={TeamDetails} allowedRoles={['organizer', 'admin', 'player']} />
      <ProtectedRoute path="/matches" component={MatchManagement} allowedRoles={['organizer', 'admin', 'player']} />
      <ProtectedRoute path="/match/:id" component={MatchDetail} allowedRoles={['organizer', 'admin', 'player', 'fan']} />
      <ProtectedRoute path="/match/:id/scoring" component={LiveScoring} allowedRoles={['organizer', 'admin']} />
      <ProtectedRoute path="/stats" component={StatsPage} allowedRoles={['organizer', 'admin', 'player']} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} allowedRoles={['organizer', 'admin', 'player', 'fan']} />
      <ProtectedRoute path="/players" component={PlayerManagement} allowedRoles={['organizer', 'admin']} />
      <ProtectedRoute path="/profile" component={ProfilePage} allowedRoles={['organizer', 'admin', 'player', 'fan']} />
      <ProtectedRoute path="/player/:id" component={PlayerProfile} allowedRoles={['organizer', 'admin', 'player', 'fan']} />
      <ProtectedRoute path="/admin" component={AdminPanel} allowedRoles={['admin']} />
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
