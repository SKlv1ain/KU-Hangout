import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export default function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">KU-Hangout</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {user?.username}!</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
        
        <div className="bg-card rounded-lg border p-6">
          <h2 className="text-2xl font-semibold mb-4">Home Page</h2>
          <p className="text-muted-foreground">
            This is the home page. You are successfully logged in!
          </p>
          {user && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <h3 className="font-semibold mb-2">User Information:</h3>
              <ul className="space-y-1 text-sm">
                <li>Username: {user.username}</li>
                <li>Role: {user.role}</li>
                {user.contact && <li>Contact: {user.contact}</li>}
                {user.avg_rating && <li>Average Rating: {user.avg_rating}</li>}
                {user.review_count !== undefined && <li>Review Count: {user.review_count}</li>}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

