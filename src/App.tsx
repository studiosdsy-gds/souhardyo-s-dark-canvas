import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudioDetails from "./pages/StudioDetail"; // Changed from 'studiodetails' to 'StudioDetails'
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetail"; // Changed from 'projectdetails' to 'ProjectDetails'

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Main Home Page */}
          <Route path="/" element={<Index />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          
          {/* Dynamic Studio Details Page */}
          <Route path="/studio/:id" element={<StudioDetails />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;