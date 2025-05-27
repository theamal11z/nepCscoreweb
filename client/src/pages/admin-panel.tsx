import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import Navbar from "@/components/navbar";
import AdminDashboard from "@/components/dashboards/admin-dashboard";

export default function AdminPanel() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        <AdminDashboard />
      </main>
    </div>
  );
}
