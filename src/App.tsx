import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import StudioDetails from "./pages/StudioDetail"; 
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetail";
// IMPORT NEW PAGES
import Social from "./pages/Social";
import Art from "./pages/Art";
import Projects from "./pages/Projects";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/studio/:id" element={<StudioDetails />} />
          
          {/* NEW ROUTES */}
          <Route path="/social" element={<Social />} />
          <Route path="/art" element={<Art />} />
          <Route path="/projects" element={<Projects />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;