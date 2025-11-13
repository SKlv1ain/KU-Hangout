import TextPressure from "@/components/ui/shadcn-io/text-pressure"
import { PlanCardExample } from "./plan-card-example"
import { FeaturePins } from "./feature-pins"
import teenagersImage from "@/assets/Teenagers Using Phone Photopea.png"

export function LoginHero() {
  return (
    <>
      <div className="space-y-4">
        <span className="text-sm uppercase tracking-[0.3em] text-emerald-200/80">
          Campus social planner
        </span>
        <div className="min-h-24 py-2 flex items-center overflow-visible">
          <TextPressure
            text="KU-Hangout"
            textColor="#d1fae5"
            width={true}
            weight={true}
            italic={true}
            alpha={false}
            flex={false}
            stroke={false}
            scale={false}
            minFontSize={32}
            className="text-emerald-50"
          />
        </div>
        <p className="text-emerald-50/80">
          Plan smarter meetups, find new hangouts, and keep every friend in the loop.
          <br />
          KU-Hangout turns campus ideas into organized experiences with a few taps.
        </p>
      </div>

      <div className="relative flex items-start gap-6 my-6 mb-16">
        <div className="flex-1 space-y-5 pr-6">
          <h3 className="text-base font-semibold text-emerald-100">What We Offer</h3>
          <div className="space-y-4 text-sm text-emerald-50/80">
            <div className="flex items-start gap-3">
              <span className="text-emerald-300 mt-0.5">•</span>
              <p>Create and manage group plans with real-time updates and notifications</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-300 mt-0.5">•</span>
              <p>Discover campus events and meetups tailored to your interests</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-emerald-300 mt-0.5">•</span>
              <p>Connect with fellow KU students and build your campus community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-8 my-6">
        <div className="flex-1 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-emerald-100">How It Works</h2>
            <div className="space-y-5 text-sm text-emerald-50/85">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-100 font-semibold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium text-emerald-200 mb-1">Create Your Plan</p>
                  <p className="text-emerald-50/70">Start by creating a new plan with location, time, and details. Invite friends or make it public for others to discover.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-100 font-semibold text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium text-emerald-200 mb-1">Share & Discover</p>
                  <p className="text-emerald-50/70">Your plan appears in the discovery feed where other students can find and join. Share directly with friends or groups.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-100 font-semibold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium text-emerald-200 mb-1">Connect & Meet</p>
                  <p className="text-emerald-50/70">Track RSVPs, chat with participants, and get reminders. Everything you need to make your meetup happen smoothly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 relative">
          <div className="absolute -top-40 right-0 z-0">
            <img
              src={teenagersImage}
              alt="KU students using KU-Hangout app"
              className="w-96 h-auto object-contain opacity-90"
            />
          </div>
          <div className="relative z-10">
            <PlanCardExample />
          </div>
        </div>
      </div>

      <div className="my-6">
        <FeaturePins />
      </div>

      <div className="space-y-4 text-sm text-emerald-50/80 my-6">
        <p className="text-emerald-200/80">Built for KU students by KU students.</p>
        <p>
          Our mission is simple: make campus life easier, more memorable, and more connected—
          from spontaneous coffee chats to full-blown club productions.
        </p>
      </div>
    </>
  )
}

