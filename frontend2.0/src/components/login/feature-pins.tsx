import { PinContainer } from "@/components/ui/shadcn-io/3d-pin"
import { Calendar, Users, MapPin, Bell, MessageSquare, Sparkles } from "lucide-react"

const features = [
  {
    title: "Real-time scheduling",
    description: "Coordinate locations, time slots, and to-dos together without endless chat scrolls.",
    icon: Calendar,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
  },
  {
    title: "Discovery feed",
    description: "Explore faculty meetups, club events, and hidden gems curated for Kasetsart students.",
    icon: Sparkles,
    gradient: "from-purple-500 via-pink-500 to-rose-500",
  },
  {
    title: "Stay connected",
    description: "Track RSVPs, send reminders, and share photo roundups all in one place.",
    icon: MessageSquare,
    gradient: "from-emerald-500 via-green-500 to-lime-500",
  },
]

export function FeaturePins() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-8">
      {features.map((feature, index) => {
        const Icon = feature.icon
        return (
          <div key={index} className="h-[20rem] w-full flex items-center justify-center">
            <PinContainer
              title={feature.title}
              containerClassName="w-full"
            >
              <div className="flex basis-full flex-col p-6 tracking-tight w-full h-full bg-transparent">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.gradient} bg-opacity-40 dark:bg-opacity-50 border border-emerald-600/30 dark:border-emerald-500/40 shadow-lg`}>
                    <Icon className="h-6 w-6 text-emerald-200 dark:text-emerald-100" />
                  </div>
                  <h3 className="max-w-xs !pb-0 !m-0 font-bold text-lg text-emerald-100 dark:text-emerald-50">
                    {feature.title}
                  </h3>
                </div>
                <div className="text-sm !m-0 !p-0 font-normal text-emerald-200/80 dark:text-emerald-100/90 leading-relaxed">
                  <span>{feature.description}</span>
                </div>
                <div className={`flex flex-1 w-full rounded-lg mt-4 bg-gradient-to-br ${feature.gradient} opacity-50 dark:opacity-70 shadow-inner`} />
              </div>
            </PinContainer>
          </div>
        )
      })}
    </div>
  )
}

