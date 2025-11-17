import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, ArrowLeft, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { updateUserProfile } from "@/services/userService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const BASE_URL =
  import.meta.env.VITE_API_BASE?.replace("/api", "") || "http://localhost:8000"

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [displayName, setDisplayName] = useState("")
  const [username, setUsername] = useState("")
  const [contact, setContact] = useState("")
  const [bio, setBio] = useState("")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  
  const MAX_BIO_LENGTH = 500

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "")
      setUsername(user.username || "")
      setContact(user.contact || "")
      setBio(user.bio || "")
      if (user.profile_picture) {
        const imageUrl = user.profile_picture.startsWith("http")
          ? user.profile_picture
          : `${BASE_URL}${user.profile_picture}`
        setPreviewUrl(imageUrl)
      }
    }
  }, [user])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    setProfilePicture(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
    toast.success("Profile picture selected!", { duration: 2000 })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error("You must be logged in to update your profile")
      return
    }

    setLoading(true)

    try {
      const payload: {
        username?: string
        display_name?: string
        contact?: string
        bio?: string
        profile_picture?: File
      } = {}

      if (username !== user.username) payload.username = username
      if (displayName !== (user.display_name || "")) payload.display_name = displayName
      if (contact !== (user.contact || "")) payload.contact = contact
      if (bio !== (user.bio || "")) payload.bio = bio
      if (profilePicture) payload.profile_picture = profilePicture

      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save")
        navigate(-1)
        return
      }

      await updateUserProfile(user.id, payload)
      await refreshUser()

      toast.success("Profile updated successfully!", { duration: 2000 })

      setTimeout(() => {
        navigate(-1)
      }, 500)
    } catch (error) {
      console.error("Error updating profile:", error)
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile"
      toast.error(errorMessage, { duration: 3000 })
    } finally {
      setLoading(false)
    }
  }

  const getInitials = () => {
    if (displayName) return displayName.slice(0, 2).toUpperCase()
    if (username) return username.slice(0, 2).toUpperCase()
    return "U"
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950 dark:via-background dark:to-emerald-950">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-md bg-white/80 dark:bg-background/80 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-sm text-muted-foreground">
                Update your profile information
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content (scrollable) */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-2xl pb-32">
          {/* pb-32 = เผื่อที่ให้ปุ่มล่าง จะได้ไม่บังข้อความสุดท้าย */}
          <form
            id="profile-edit-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white dark:bg-card border shadow-sm">
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-emerald-100 dark:ring-emerald-900">
                  <AvatarImage src={previewUrl} alt={displayName || username} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Click the camera icon to upload a new photo
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: 5MB • Formats: JPG, PNG, GIF
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6 p-8 rounded-2xl bg-white dark:bg-card border shadow-sm">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-base font-medium">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  This is how others will see your name
                </p>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-base font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Your unique username for login
                </p>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="text-base font-medium">
                  Contact
                </Label>
                <Input
                  id="contact"
                  placeholder="Enter your contact info (email, phone, etc.)"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  How others can reach you (optional)
                </p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-base font-medium">
                    Bio
                  </Label>
                  <span className={`text-xs ${
                    bio.length > MAX_BIO_LENGTH 
                      ? 'text-red-500 font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    {bio.length}/{MAX_BIO_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="bio"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_BIO_LENGTH) {
                      setBio(e.target.value)
                    }
                  }}
                  className="min-h-[120px] resize-none"
                  maxLength={MAX_BIO_LENGTH}
                />
                <p className="text-xs text-muted-foreground">
                  Write a short bio about yourself (optional)
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom Bar Buttons (ลอยด้านล่าง) */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-background/95 border-t px-4 py-3 z-20">
        <div className="max-w-2xl mx-auto flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1 h-11"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="profile-edit-form"
            className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}