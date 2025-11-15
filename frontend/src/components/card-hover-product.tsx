"use client"
import { StarIcon, ShoppingCartIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
export default function HoverCardProduct() {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm">Check out this</span>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="link" className="p-0 h-auto text-blue-600">
            MacBook Pro
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-96">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                <div className="w-12 h-8 bg-gray-800 rounded-sm"></div>
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold">MacBook Pro 14"</h4>
                <p className="text-sm text-muted-foreground">
                  M3 Pro chip, 18GB memory, 512GB SSD
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(124 reviews)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                <span className="text-2xl font-bold">$2,399</span>
                <span className="text-sm text-muted-foreground line-through ml-2">$2,599</span>
              </div>
              <Button size="sm">
                <ShoppingCartIcon className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  )
}