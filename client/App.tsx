import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { NotificationProvider } from "@/hooks/use-notifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useEffect, Suspense, lazy } from "react";
import { 
  registerServiceWorker, 
  requestNotificationPermission, 
  preloadCriticalResources,
  measurePerformance,
  isPWAInstalled 
} from "@/lib/pwa";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Construction = lazy(() => import("./pages/Construction"));
const Projects = lazy(() => import("./pages/Projects"));
const Analytics = lazy(() => import("./pages/Analytics"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const Profile = lazy(() => import("./pages/Profile"));
const AIModelTraining = lazy(() => import("./pages/AIModelTraining"));
const IoTManagement = lazy(() => import("./pages/IoTManagement"));
const BlockchainMarketplace = lazy(() => import("./pages/BlockchainMarketplace"));
const NotFound = lazy(() => import("./pages/NotFound"));
import Header from "./components/BrandHeader";
import Footer from "./components/BrandFooter";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize PWA features
    registerServiceWorker();
    requestNotificationPermission();
    preloadCriticalResources();
    measurePerformance();
    
    // Log PWA installation status
    if (isPWAInstalled()) {
      console.log('📱 PWA is installed and running');
    }
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="flex-1" role="main" aria-label="Main content">
              <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Auth routes - redirect if already logged in */}
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading login page">Loading...</div>}>
                        <Login />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/signup" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading signup page">Loading...</div>}>
                        <Signup />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected routes - require authentication */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading dashboard">Loading...</div>}>
                        <Dashboard />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/projects" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading projects">Loading...</div>}>
                        <Projects />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading analytics">Loading...</div>}>
                        <Analytics />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/users" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading user management">Loading...</div>}>
                        <UserManagement />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/construction" 
                  element={
                    <ProtectedRoute>
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading construction tools">Loading...</div>}>
                        <Construction />
                      </Suspense>
                    </ProtectedRoute>
                  } 
                />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading profile">Loading...</div>}>
                            <Profile />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/ai-training"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading AI training">Loading...</div>}>
                            <AIModelTraining />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/iot-management"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading IoT management">Loading...</div>}>
                            <IoTManagement />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/blockchain-marketplace"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading blockchain marketplace">Loading...</div>}>
                            <BlockchainMarketplace />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />

                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={
                      <Suspense fallback={<div className="flex items-center justify-center min-h-[200px]" role="status" aria-label="Loading page">Loading...</div>}>
                        <NotFound />
                      </Suspense>
                    } />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
