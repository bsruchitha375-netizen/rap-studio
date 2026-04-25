import { Skeleton } from "@/components/ui/skeleton";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { Suspense, lazy, useEffect } from "react";
import { getAdminSession, readStoredProfile } from "./hooks/useAuth";

// Lazy-loaded pages
const HomePage = lazy(() =>
  import("./pages/HomePage").then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const AdminLoginPage = lazy(() =>
  import("./pages/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })),
);
const ServicesPage = lazy(() =>
  import("./pages/ServicesPage").then((m) => ({ default: m.ServicesPage })),
);
const ServiceDetailPage = lazy(() =>
  import("./pages/ServiceDetailPage").then((m) => ({
    default: m.ServiceDetailPage,
  })),
);
const CoursesPage = lazy(() =>
  import("./pages/CoursesPage").then((m) => ({ default: m.CoursesPage })),
);
const CourseDetailPage = lazy(() =>
  import("./pages/CourseDetailPage").then((m) => ({
    default: m.CourseDetailPage,
  })),
);
const BookingPage = lazy(() =>
  import("./pages/BookingPage").then((m) => ({ default: m.BookingPage })),
);
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })),
);
const ClientDashboard = lazy(() =>
  import("./pages/ClientDashboard").then((m) => ({
    default: m.ClientDashboard,
  })),
);
const StudentDashboard = lazy(() =>
  import("./pages/StudentDashboard").then((m) => ({
    default: m.StudentDashboard,
  })),
);
const ReceptionistDashboard = lazy(() =>
  import("./pages/ReceptionistDashboard").then((m) => ({
    default: m.ReceptionistDashboard,
  })),
);
const StaffDashboard = lazy(() =>
  import("./pages/StaffDashboard").then((m) => ({ default: m.StaffDashboard })),
);
const AdminDashboard = lazy(() =>
  import("./pages/AdminDashboard").then((m) => ({ default: m.AdminDashboard })),
);
const GalleryPage = lazy(() =>
  import("./pages/GalleryPage").then((m) => ({ default: m.GalleryPage })),
);
const ChatbotPage = lazy(() =>
  import("./pages/ChatbotPage").then((m) => ({ default: m.ChatbotPage })),
);
const CertificateVerifyPage = lazy(() =>
  import("./pages/CertificateVerifyPage").then((m) => ({
    default: m.CertificateVerifyPage,
  })),
);
const CourseLearnPage = lazy(() =>
  import("./pages/CourseLearnPage").then((m) => ({
    default: m.CourseLearnPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function PageFallback() {
  return (
    <div className="container mx-auto py-20 space-y-4">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

// ── Auth guards ────────────────────────────────────────────────────────────────

/** Guards /admin — redirects to /admin/login if no valid admin session */
function AdminGuard() {
  const session = getAdminSession();
  useEffect(() => {
    if (!session) {
      window.location.replace("/admin/login");
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }
  return <AdminDashboard />;
}

/** Guards /dashboard/* — redirects to /login if no user session */
function UserGuard({ children }: { children: React.ReactNode }) {
  const profile = readStoredProfile();
  useEffect(() => {
    if (!profile) {
      window.location.replace("/login");
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-8">
          <Skeleton className="h-12 w-48 mx-auto mb-4" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <HomePage />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <LoginPage />,
});

const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: () => <AdminLoginPage />,
});

const servicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services",
  component: () => <ServicesPage />,
});

const serviceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/services/$serviceId",
  component: () => <ServiceDetailPage />,
});

const coursesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses",
  component: () => <CoursesPage />,
});

const courseDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/courses/$courseId",
  component: () => <CourseDetailPage />,
});

const bookingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/booking",
  component: () => <BookingPage />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <UserGuard>
      <DashboardPage />
    </UserGuard>
  ),
});

const clientDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/client",
  component: () => (
    <UserGuard>
      <ClientDashboard />
    </UserGuard>
  ),
});

const studentDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/student",
  component: () => (
    <UserGuard>
      <StudentDashboard />
    </UserGuard>
  ),
});

const receptionistDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/receptionist",
  component: () => (
    <UserGuard>
      <ReceptionistDashboard />
    </UserGuard>
  ),
});

const staffDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard/staff",
  component: () => (
    <UserGuard>
      <StaffDashboard />
    </UserGuard>
  ),
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => <AdminGuard />,
});

const galleryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: () => <GalleryPage />,
});

const chatbotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chatbot",
  component: () => <ChatbotPage />,
});

const certificateVerifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/verify/$code",
  component: () => <CertificateVerifyPage />,
});

const courseLearnRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/course/$courseId/learn",
  component: () => (
    <UserGuard>
      <CourseLearnPage />
    </UserGuard>
  ),
});

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => <NotFoundPage />,
});

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminLoginRoute,
  servicesRoute,
  serviceDetailRoute,
  coursesRoute,
  courseDetailRoute,
  bookingRoute,
  dashboardRoute,
  clientDashboardRoute,
  studentDashboardRoute,
  receptionistDashboardRoute,
  staffDashboardRoute,
  adminRoute,
  galleryRoute,
  chatbotRoute,
  certificateVerifyRoute,
  courseLearnRoute,
  notFoundRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="rap-studio-theme"
    >
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
