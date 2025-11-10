"use client"

import { useState, useEffect } from "react"
import { CardBody, CardContainer, CardItem } from "@/components/ui/shadcn-io/3d-card"
import { AnimatedTooltip } from "@/components/ui/shadcn-io/animated-tooltip"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Heart, Crown, ChevronLeft, ChevronRight, Circle } from "lucide-react"
import { useScript } from "@/hooks/use-script"
import { toast } from "sonner"

const people = [
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

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
        <div className="w-[40%] min-h-[280px] bg-emerald-800/50 flex-shrink-0 relative group">
          <div className="relative h-full w-full min-h-[280px] overflow-hidden rounded-l-xl">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Starbucks café ${index + 1}`}
                className={`absolute inset-0 h-full w-full min-h-[280px] object-cover transition-opacity duration-500 ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
          </div>
          
          {/* Navigation Dots */}
          <div className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goToImage(i)}
                className="bg-transparent border-none p-0 text-white/80 hover:text-white transition-colors cursor-pointer"
                style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
                aria-label={`Go to image ${i + 1}`}
              >
                <Circle className={`h-2 w-2 transition-all ${
                  i === currentImageIndex ? "fill-white" : "fill-white/40"
                }`} />
              </button>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-50 bg-transparent border-none p-1 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-50 bg-transparent border-none p-1 text-white/80 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        {/* Content Section - 60% */}
        <div className="flex-1 p-5 flex flex-col justify-between min-h-[280px]">
          <div className="space-y-2">
            <CardItem
              translateZ="50"
              className="text-base font-bold text-emerald-50"
            >
              Weekend Café Study Session
            </CardItem>
            
            <CardItem
              as="div"
              translateZ="60"
              className="flex items-center gap-2 text-emerald-200/80 text-xs"
            >
              <Crown className="h-3 w-3 text-emerald-300" />
              <span className="text-emerald-100/90">Created by</span>
              <span className="font-semibold text-emerald-50">Sai Khun Main</span>
            </CardItem>

            <CardItem
              as="div"
              translateZ="60"
              className="flex items-center gap-2 text-emerald-200/80 text-xs"
            >
              <MapPin className="h-3 w-3" />
              <span>Starbucks @ KU Central</span>
            </CardItem>

            <CardItem
              as="div"
              translateZ="60"
              className="flex items-center gap-2 text-emerald-200/80 text-xs"
            >
              <Calendar className="h-3 w-3" />
              <span>Sat, Dec 14 • 2:00 PM</span>
            </CardItem>

            <CardItem
              translateZ="70"
              className="text-emerald-100/70 text-[10px] line-clamp-2"
            >
              Join us for a productive study session! Bring your books and let's tackle assignments together.
            </CardItem>

            {/* Tags */}
            <CardItem
              as="div"
              translateZ="60"
              className="flex flex-wrap gap-1.5 mt-2"
            >
              {tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={`${tag.color} text-[10px] px-2 py-0.5 border`}
                >
                  {tag.label}
                </Badge>
              ))}
            </CardItem>
          </div>

          <div className="mt-3 space-y-2">
            <div className="relative z-[100]">
              <div className="flex items-center gap-2 text-emerald-200/80 text-[10px] mb-1.5">
                <Users className="h-3 w-3" />
                <span className="font-medium">4 people joined</span>
              </div>
              <div className="flex items-center justify-start relative z-[100] pointer-events-auto flex-row">
                <AnimatedTooltip items={people} />
              </div>
            </div>

            <div className="flex gap-2">
              <CardItem
                translateZ={20}
                as="button"
                onClick={handleJoin}
                className={`flex-1 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors ${
                  isJoined 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {isJoined ? 'Joined' : 'Join'}
              </CardItem>
              <CardItem
                translateZ={20}
                as="button"
                onClick={handleLike}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                  isLiked
                    ? 'border-red-400/50 bg-red-500/20 hover:bg-red-500/30 text-red-200'
                    : 'border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-200'
                }`}
              >
                <Heart className={`h-3 w-3 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </CardItem>
            </div>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  )
}

