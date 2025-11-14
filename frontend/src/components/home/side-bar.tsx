import type { ReactNode } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface SidebarLayoutProps {
  children: ReactNode
  headerContent?: ReactNode
  contentClassName?: string
}

export function SidebarLayout({
  children,
  headerContent,
  contentClassName,
}: SidebarLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {headerContent && (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            {headerContent}
        </header>
        )}
        <div className={cn("flex flex-1 flex-col min-h-0", contentClassName)}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Page() {
  return (
    <SidebarLayout contentClassName="gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </SidebarLayout>
  )
}
