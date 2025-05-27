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
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/match/:id" component={MatchDetail} />
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
