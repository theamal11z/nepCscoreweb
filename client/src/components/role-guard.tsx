import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

const RoleGuard = ({ children, allowedRoles, redirectTo }: RoleGuardProps) => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // If user is not logged in, auth system will handle it
    if (!user) return;

    // If user's role is not in allowed roles, redirect
    if (!allowedRoles.includes(user.role)) {
      // Redirect to role-specific dashboard if not specified
      const defaultRedirect = user.role === "fan" ? "/fan-dashboard" :
                             user.role === "organizer" ? "/organizer-dashboard" :
                             user.role === "player" ? "/player-dashboard" :
                             "/admin-dashboard";
      
      setLocation(redirectTo || defaultRedirect);
    }
  }, [user, allowedRoles, redirectTo, setLocation]);

  // If user is not logged in or has allowed role, render children
  if (user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // Return null while redirection is happening
  return null;
};

export default RoleGuard;
