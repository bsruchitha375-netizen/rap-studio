import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";

export function DashboardPage() {
  const { isLoggedIn, loading, role } = useAuth();
  const navigate = useNavigate();
  const didNavigate = useRef(false);

  useEffect(() => {
    if (loading || didNavigate.current) return;

    if (!isLoggedIn) {
      didNavigate.current = true;
      void navigate({ to: "/login" });
      return;
    }

    didNavigate.current = true;
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
  }, [isLoggedIn, loading, role, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-64 text-center">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
        <Skeleton className="h-32 rounded-xl" />
        <p className="text-xs text-muted-foreground animate-pulse">
          Redirecting to your dashboard…
        </p>
      </div>
    </div>
  );
}
