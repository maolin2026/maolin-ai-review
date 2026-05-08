import { Navigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"

export default function ProtectedRoute({ children, adminOnly = false }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const isAdmin = useAuthStore(s => s.isAdmin)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}