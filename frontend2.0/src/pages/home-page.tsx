import Navbar from "@/components/navbar"
import MessageDockDemo from "@/components/home/message-dock"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Add your page content here */}
        </div>
      <MessageDockDemo />
      </div>
  )
}

