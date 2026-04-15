import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, useRole } from "../hooks/useAuth";

export function DashboardPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const role = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }
    switch (role) {
      case "client":
        void navigate({ to: "/dashboard/client" });
        break;
      case "student":
        void navigate({ to: "/dashboard/student" });
        break;
      case "receptionist":
        void navigate({ to: "/dashboard/receptionist" });
        break;
      case "staff":
        void navigate({ to: "/dashboard/staff" });
        break;
      case "admin":
        void navigate({ to: "/admin" });
        break;
      default:
        void navigate({ to: "/login" });
    }
  }, [isAuthenticated, isLoading, role, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-64">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}
