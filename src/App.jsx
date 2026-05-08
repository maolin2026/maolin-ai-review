import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import { useEffect } from "react"
import MainLayout from "./components/MainLayout"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import NewReviewPage from "./pages/NewReviewPage"
import ReviewHistoryPage from "./pages/ReviewHistoryPage"
import TeachersPage from "./pages/TeachersPage"
import SettingsPage from "./pages/SettingsPage"

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/review/new" element={<NewReviewPage />} />
          <Route path="/review/history" element={<ReviewHistoryPage />} />
          <Route path="/teachers" element={<ProtectedRoute adminOnly><TeachersPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}

export default App