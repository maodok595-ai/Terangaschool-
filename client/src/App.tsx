import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Lives from "@/pages/Lives";
import LiveDetail from "@/pages/LiveDetail";
import Teachers from "@/pages/Teachers";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BecomeTeacher from "@/pages/BecomeTeacher";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}

function ProtectedPage({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles?: string[] 
}) {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        window.location.href = "/login";
      } else if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        window.location.href = "/";
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAuthenticated ? <Home /> : <Landing />;
}

function AdminPage() {
  return (
    <ProtectedPage allowedRoles={["admin"]}>
      <AdminDashboard />
    </ProtectedPage>
  );
}

function TeacherPage() {
  return (
    <ProtectedPage allowedRoles={["teacher", "admin"]}>
      <TeacherDashboard />
    </ProtectedPage>
  );
}

function DashboardPage() {
  return (
    <ProtectedPage>
      <Home />
    </ProtectedPage>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/lives" component={Lives} />
      <Route path="/live/:id" component={LiveDetail} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/become-teacher" component={BecomeTeacher} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/teacher" component={TeacherPage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
