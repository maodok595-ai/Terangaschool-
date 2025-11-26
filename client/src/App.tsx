import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
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

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/courses" component={Courses} />
      <Route path="/courses/:id" component={CourseDetail} />
      <Route path="/lives" component={Lives} />
      <Route path="/live/:id" component={LiveDetail} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/become-teacher" component={BecomeTeacher} />
      
      {/* Protected routes */}
      {isAuthenticated && (
        <>
          <Route path="/dashboard" component={Home} />
          <Route path="/teacher" component={TeacherDashboard} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      
      {/* Home route - different based on auth status */}
      <Route path="/" component={isAuthenticated ? Home : Landing} />
      
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
