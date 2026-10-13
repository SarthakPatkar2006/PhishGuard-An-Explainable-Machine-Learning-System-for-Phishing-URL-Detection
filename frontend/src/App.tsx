import { lazy, Suspense } from "react";
import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { usePredictionWorkspace } from "./hooks/usePredictionWorkspace";
import type { AuthUser } from "./lib/types";

const AboutPage = lazy(() => import("./pages/AboutPage").then((module) => ({ default: module.AboutPage })));
const AnalyzePage = lazy(() => import("./pages/AnalyzePage").then((module) => ({ default: module.AnalyzePage })));
const AuthPage = lazy(() => import("./pages/AuthPage").then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((module) => ({ default: module.DashboardPage })));
const HistoryPage = lazy(() => import("./pages/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const HomePage = lazy(() => import("./pages/HomePage").then((module) => ({ default: module.HomePage })));
const ModelsPage = lazy(() => import("./pages/ModelsPage").then((module) => ({ default: module.ModelsPage })));

function App() {
  const workspace = usePredictionWorkspace();

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppLayout onLogout={workspace.handleLogout} user={workspace.authUser} />}>
            <Route index element={<HomePage user={workspace.authUser} />} />
            <Route
              path="analyze"
              element={
                <ProtectedRoute isLoading={workspace.isAuthLoading} user={workspace.authUser}>
                  <AnalyzePage
                    activeResult={workspace.activeResult}
                    csvResult={workspace.csvResult}
                    error={workspace.error}
                    isCheckingUrl={workspace.isCheckingUrl}
                    isUploadingCsv={workspace.isUploadingCsv}
                    onCsvSubmit={workspace.handleCsvSubmit}
                    onUrlSubmit={workspace.handleUrlSubmit}
                    setUrl={workspace.setUrl}
                    url={workspace.url}
                    urlResult={workspace.urlResult}
                    user={workspace.authUser}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute isLoading={workspace.isAuthLoading} user={workspace.authUser}>
                  <DashboardPage
                    history={workspace.history}
                    signalData={workspace.signalData}
                    status={workspace.status}
                    urlResult={workspace.latestUrlResult}
                    user={workspace.authUser}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="history"
              element={
                <ProtectedRoute isLoading={workspace.isAuthLoading} user={workspace.authUser}>
                  <HistoryPage history={workspace.history} user={workspace.authUser} />
                </ProtectedRoute>
              }
            />
            <Route
              path="models"
              element={
                <ProtectedRoute isLoading={workspace.isAuthLoading} user={workspace.authUser}>
                  <ModelsPage report={workspace.modelComparison} />
                </ProtectedRoute>
              }
            />
            <Route path="about" element={<AboutPage />} />
            <Route
              path="auth"
              element={
                <AuthPage
                  authError={workspace.authError}
                  isSubmitting={workspace.isAuthSubmitting}
                  onLogin={workspace.handleLogin}
                  onSignup={workspace.handleSignup}
                  user={workspace.authUser}
                />
              }
            />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children, isLoading, user }: { children: ReactNode; isLoading: boolean; user: AuthUser | null }) {
  if (isLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate replace to="/auth" />;
  }

  return children;
}

function PageLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-950 text-sm text-slate-300">
      Loading console...
    </div>
  );
}

export { App };
