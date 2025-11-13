"use client"

import { useState, useEffect } from "react"
import { CardBody, CardContainer } from "@/components/ui/shadcn-io/3d-card"
import { useScript } from "@/hooks/use-script"
import { toast } from "sonner"
import { ImageCarouselExample } from "./image-carousel-example"
import { PlanCardHeader } from "@/components/plan-card/plan-card-header"
import { PlanCardDescription } from "@/components/plan-card/plan-card-description"
import { PlanCardParticipants } from "@/components/plan-card/plan-card-participants"
import { PlanCardActions } from "@/components/plan-card/plan-card-actions"
import type { AnimatedTooltipItem } from "@/components/ui/shadcn-io/animated-tooltip"

const people: AnimatedTooltipItem[] = [
  {
    id: 1,
    name: "Sai Khun Main",
    designation: "Frontend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=SaiKhunMain&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 2,
    name: "Thanutham Chonsongkram",
    designation: "Frontend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Thanutham&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 3,
    name: "Peerawat Theerasakul",
    designation: "Backend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Peerawat&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
  {
    id: 4,
    name: "Chanotai Mukdakul",
    designation: "Backend dev",
    image: "https://api.dicebear.com/7.x/notionists/svg?seed=Chanotai&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf",
  },
]

const images = [
  "https://images.unsplash.com/photo-1568036193587-84226a9c5a1b?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
  "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "https://images.unsplash.com/photo-1654054041538-ad6a3fb653d5?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=800",
]

const tags = [
  { label: "Study", color: "bg-blue-500/20 text-blue-200 border-blue-400/30" },
  { label: "Café", color: "bg-amber-500/20 text-amber-200 border-amber-400/30" },
  { label: "Weekend", color: "bg-purple-500/20 text-purple-200 border-purple-400/30" },
  { label: "Group", color: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30" },
  { label: "Academic", color: "bg-indigo-500/20 text-indigo-200 border-indigo-400/30" },
]

export function PlanCardExample() {
  const [isJoined, setIsJoined] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [shouldTriggerConfetti, setShouldTriggerConfetti] = useState(false)

  const confettiStatus = useScript(
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    {
      removeOnUnmount: false,
      id: 'confetti-script',
    }
  )

  // Trigger confetti when script is ready and user has joined
  useEffect(() => {
    if (shouldTriggerConfetti && confettiStatus === 'ready' && typeof window !== 'undefined' && 'confetti' in window) {
      // @ts-ignore - confetti is loaded dynamically
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      setShouldTriggerConfetti(false)
      toast.success("🎉 Joined successfully!", {
        description: "Welcome to the study session!",
      })
    }
  }, [confettiStatus, shouldTriggerConfetti])

  const handleJoin = () => {
    setIsJoined(true)
    setShouldTriggerConfetti(true)
    
    // If script is already ready, trigger immediately
    if (confettiStatus === 'ready' && typeof window !== 'undefined' && 'confetti' in window) {
      // @ts-ignore - confetti is loaded dynamically
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
      setShouldTriggerConfetti(false)
      toast.success("🎉 Joined successfully!", {
        description: "Welcome to the study session!",
      })
    } else if (confettiStatus === 'loading') {
      toast.info("Loading celebration...", {
        description: "Please wait a moment",
      })
    } else {
      toast.success("Joined successfully!", {
        description: "Welcome to the study session!",
      })
    }
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <CardContainer
      className="inter-var"
      containerClassName="py-0"
    >
      <CardBody className="bg-emerald-900/50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-emerald-900/30 dark:border-emerald-400/20 border-emerald-400/20 w-[600px] min-h-[280px] rounded-xl p-0 border backdrop-blur-sm overflow-hidden flex flex-row">
        {/* Image Section - 40% */}
        <ImageCarouselExample 
          images={images}
          alt="Starbucks café"
        />
        
        {/* Content Section - 60% */}
        <div className="flex-1 p-5 flex flex-col justify-between min-h-[280px]">
          <div className="space-y-2">
            <PlanCardHeader
              title="Weekend Café Study Session"
              creatorName="Sai Khun Main"
              location="Starbucks @ KU Central"
              dateTime="Sat, Dec 14 • 2:00 PM"
            />

            <PlanCardDescription
              description="Join us for a productive study session! Bring your books and let's tackle assignments together."
              tags={tags}
            />
          </div>

          <div className="mt-3 space-y-2">
            <PlanCardParticipants
              participants={people}
              participantCount={4}
            />

            <PlanCardActions
              isJoined={isJoined}
              isLiked={isLiked}
              onJoin={handleJoin}
              onLike={handleLike}
            />
          </div>
        </div>
      </CardBody>
    </CardContainer>
  )
}

