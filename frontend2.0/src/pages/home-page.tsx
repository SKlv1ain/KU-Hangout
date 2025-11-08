import Navbar from "@/components/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">KU-Hangout</h1>
        {/* Add your page content here */}
      </div>
    </div>
  )
}

