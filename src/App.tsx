import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import { TeamMembersProvider } from "./context/TeamMembersContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Team from "./pages/Team";
import { useEffect } from 'react';
import { supabase } from './lib/supabase';

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      // Set the auth token for all future requests
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          supabase.auth.setSession(session);
        }
      });
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<ProtectedRoute element={<Index />} />} />
      <Route path="/projects" element={<ProtectedRoute element={<Projects />} />} />
      <Route path="/project/:projectId" element={<ProtectedRoute element={<ProjectDetail />} />} />
      <Route path="/team" element={<ProtectedRoute element={<Team />} />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TeamMembersProvider>
        <ProjectsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </ProjectsProvider>
      </TeamMembersProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
