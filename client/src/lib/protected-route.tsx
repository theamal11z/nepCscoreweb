import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles,
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }
  
  // If roles are specified, check if user has permission
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on user's role
    return (
      <Route path={path}>
        {user.role === 'player' ? (
          <Redirect to="/player" />
        ) : user.role === 'organizer' || user.role === 'admin' ? (
          <Redirect to="/dashboard" />
        ) : (
          <Redirect to="/home" />
        )}
      </Route>
    );
  }

  return <Component />
}
