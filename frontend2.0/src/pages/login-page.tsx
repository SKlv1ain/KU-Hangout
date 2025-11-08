import { useState } from "react"
import { Navigate } from "react-router-dom"
import { LoginForm, LoginHero, SignUpForm } from "@/components/login"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const [view, setView] = useState<"login" | "signup">("login")
  const { user, loading } = useAuth()

  // ถ้า login อยู่แล้ว redirect ไปหน้า home
  if (!loading && user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="grid h-screen lg:grid-cols-[60%_40%]">
      <div className="relative hidden lg:block bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,_211,_153,_0.35),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(16,_24,_32,_0.9),_transparent_65%)]" />
        {/* Fade overlay top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-900 via-emerald-900/80 to-transparent z-20 pointer-events-none" />
        {/* Fade overlay bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-emerald-950 via-emerald-950/80 to-transparent z-20 pointer-events-none" />
        <div className="relative z-10 flex h-full w-full flex-col p-12 text-emerald-100 overflow-y-auto">
          <div className="w-full space-y-8 py-8">
            <LoginHero />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-between items-center">
          <span className="font-medium text-lg">KU-Hangout</span>
          <ModeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {view === "login" ? (
              <LoginForm onSignUp={() => setView("signup")} />
            ) : (
              <SignUpForm onLogin={() => setView("login")} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
