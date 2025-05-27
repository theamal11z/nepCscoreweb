import { useAuth } from "@/hooks/use-auth";
import Navbar from "@/components/navbar";
import FanDashboard from "@/components/dashboards/fan-dashboard";
import OrganizerDashboard from "@/components/dashboards/organizer-dashboard";
import PlayerDashboard from "@/components/dashboards/player-dashboard";
import AdminDashboard from "@/components/dashboards/admin-dashboard";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "fan":
        return <FanDashboard />;
      case "organizer":
        return <OrganizerDashboard />;
      case "player":
        return <PlayerDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <FanDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16">
        {renderDashboard()}
      </main>
    </div>
  );
}
