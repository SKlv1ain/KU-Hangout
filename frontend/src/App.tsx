import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { NotificationProvider } from "@/context/NotificationContext"
import { ChatProvider } from "@/context/ChatContext"
import { Toaster } from "@/components/ui/sonner"
import LoginPage from "@/pages/login-page"
import HomePage from "@/pages/home-page"
import MessagePage from "@/pages/message-page"
import UserProfilePage from "@/pages/user-profile-page"
import ProtectedRoute from "@/components/ProtectedRoute"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <NotificationProvider>
          <ChatProvider>
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute>
                    <MessagePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <ProtectedRoute>
                    <UserProfilePage />
                  </ProtectedRoute>
                }
              />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </ChatProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
