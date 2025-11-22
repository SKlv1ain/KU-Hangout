import { useParams, Navigate } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import Navbar from "@/components/navbar"
import { SidebarLayout } from "@/components/home/side-bar"
import ThreeDCardDemo from "@/components/user/user-profile-3d-card"
import UserProfilePinnedPlans from "@/components/user/user-profile-pinned-plans"
import UserProfileContributionGraph from "@/components/user/user-profile-contribution-graph"
import UserProfileEditDialog from "@/components/user/user-profile-edit-dialog"
import type { UserProfile } from "@/services/userService"

export default function UserProfilePage() {
  const { username } = useParams<{ username?: string }>()
  const { user: authUser } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null)
  const [profileRefreshKey, setProfileRefreshKey] = useState(0)

  // If no username in URL, redirect to current user's profile
  if (!username && authUser?.username) {
    return <Navigate to={`/profile/${authUser.username}`} replace />
  }

  // If no username and no auth user, redirect to login
  if (!username && !authUser) {
    return <Navigate to="/login" replace />
  }

  const targetUsername = username || authUser?.username

  // Don't render if no username available
  if (!targetUsername) {
    return null;
  }

  const handleEditProfile = (profile?: UserProfile | null) => {
    console.log("[UserProfilePage] Edit profile clicked", targetUsername)

    const fallbackProfile = profile ?? (authUser
      ? {
          id: authUser.id,
          username: authUser.username,
          display_name: authUser.display_name || authUser.username,
          role: authUser.role,
          avg_rating: authUser.avg_rating,
          review_count: authUser.review_count,
          contact: authUser.contact,
          profile_picture_url: authUser.profile_picture_url || authUser.profile_picture,
          created_at: authUser.created_at,
          bio: authUser.bio || null,
          website: authUser.website || null,
          social_links: authUser.social_links || [],
        }
      : null)

    setEditingProfile(fallbackProfile)
    setIsEditDialogOpen(true)
  }

  const handleProfileUpdated = (updatedProfile: UserProfile) => {
    setEditingProfile(updatedProfile)
    setProfileRefreshKey((key) => key + 1)
  }

  return (
    <SidebarLayout contentClassName="min-h-screen bg-background">
      <div className="flex flex-col h-screen overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <section className="w-full max-w-7xl mx-auto py-10 px-4 sm:px-6">
            <div className="space-y-2 mb-6">
              <p className="text-sm uppercase tracking-widest text-muted-foreground">
                Account
              </p>
            </div>
            
            {/* Layout: 3D Card on left, Pin & Contribution on right */}
            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left: 3D Card */}
              <div className="flex-shrink-0 w-full lg:w-auto">
                <ThreeDCardDemo
                  username={targetUsername}
                  onEditProfile={handleEditProfile}
                  refreshKey={profileRefreshKey}
                />
              </div>

              {/* Right: Pin Section & Contribution Graph */}
              <div className="flex-1 w-full lg:max-w-2xl xl:max-w-3xl space-y-8 min-w-0">
                {/* Pin Plans Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                      Plans
                    </h2>
                    {authUser?.username === targetUsername && (
                      <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                      >
                        {isEditMode ? "Done" : "Edit Pin"}
                      </button>
                    )}
                  </div>
                  <UserProfilePinnedPlans 
                    username={targetUsername} 
                    isOwner={authUser?.username === targetUsername}
                    isEditMode={isEditMode}
                  />
                </div>

                {/* Contribution Graph Section */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                    Contributions
                  </h2>
                  <UserProfileContributionGraph username={targetUsername} />
                </div>
              </div>
            </div>
          </section>
        </main>
        <UserProfileEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          profile={editingProfile}
          previewUsername={targetUsername}
          onProfileUpdated={handleProfileUpdated}
        />
      </div>
    </SidebarLayout>
  )
}
