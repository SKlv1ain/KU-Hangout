"use client"
import { CalendarIcon, MapPinIcon, LinkIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
export default function HoverCardUserProfile() {
  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-muted-foreground">Created by</span>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="p-0 h-auto">
            @shadcn
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex justify-between gap-4">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <h4 className="text-sm font-semibold">@shadcn</h4>
              <p className="text-sm text-muted-foreground">
                Building beautiful and accessible user interfaces.
              </p>
              <div className="flex items-center pt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-3 w-3" />
                  Joined March 2021
                </div>
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPinIcon className="mr-1 h-3 w-3" />
                San Francisco, CA
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <LinkIcon className="mr-1 h-3 w-3" />
                ui.shadcn.com
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-4 text-xs text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">12.5k</span> followers
            </div>
            <div>
              <span className="font-semibold text-foreground">542</span> following
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}