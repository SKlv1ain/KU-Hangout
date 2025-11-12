import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()

  // แสดง loading spinner ขณะตรวจสอบ authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  // ไม่ล็อกอิน → ส่งไปหน้า login
  if (!user) return <Navigate to="/login" replace />
  
  // ไม่ใช่ admin แต่ต้องการ admin → ส่งไปหน้า home
  if (requireAdmin && !isAdmin) return <Navigate to="/home" replace />

  return <>{children}</>
}

