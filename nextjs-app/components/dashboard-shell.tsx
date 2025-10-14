"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Bell, Key, BarChart3, Users, Settings } from "lucide-react"

const navigation = [
  { name: "Bots", href: "/bots", icon: Home },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "API Keys", href: "/keys", icon: Key },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Admin", href: "/settings", icon: Settings, adminOnly: true },
]

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">Chatbot Builder</h1>
          <p className="text-sm text-slate-500 mt-1">Greymouse AI</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-slate-700 hover:bg-slate-100"
                )}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            © 2024 Greymouse AI Services
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
