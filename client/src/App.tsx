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
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Lives from "@/pages/Lives";
import LiveDetail from "@/pages/LiveDetail";
import TeacherDashboard from "@/pages/TeacherDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import BecomeTeacher from "@/pages/BecomeTeacher";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/:id" component={CourseDetail} />
          <Route path="/lives" component={Lives} />
          <Route path="/live/:id" component={LiveDetail} />
          <Route path="/become-teacher" component={BecomeTeacher} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Home} />
          <Route path="/courses" component={Courses} />
          <Route path="/courses/:id" component={CourseDetail} />
          <Route path="/lives" component={Lives} />
          <Route path="/live/:id" component={LiveDetail} />
          <Route path="/teacher" component={TeacherDashboard} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/become-teacher" component={BecomeTeacher} />
        </>
      )}
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
