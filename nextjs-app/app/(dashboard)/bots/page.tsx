"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Settings, Trash2, Copy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bot {
  id: string
  name: string
  status: string
  domain_count?: number
  source_count?: number
  updated_at: string
}

export default function BotsPage() {
  const [bots, setBots] = useState<Bot[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newBotName, setNewBotName] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadBots()
  }, [])

  const loadBots = async () => {
    try {
      const response = await fetch("/api/bots")
      if (response.ok) {
        const data = await response.json()
        setBots(data)
      }
    } catch (error) {
      console.error("Failed to load bots:", error)
    } finally {
      setLoading(false)
    }
  }

  const createBot = async () => {
    if (!newBotName.trim()) return

    setCreating(true)
    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newBotName }),
      })

      if (response.ok) {
        const bot = await response.json()
        toast({ title: "Bot created successfully" })
        router.push(`/bots/${bot.id}`)
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to create bot",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create bot",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800"
      case "needs_source":
        return "bg-yellow-100 text-yellow-800"
      case "processing":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "disabled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading bots...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Bots</h1>
          <p className="text-slate-500 mt-1">You can create up to 20 bots</p>
        </div>
        {bots.length < 20 && (
          <Button onClick={() => setShowCreateDialog(true)} data-testid="create-bot-button">
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Bot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bot-name">Bot Name</Label>
                <Input
                  id="bot-name"
                  value={newBotName}
                  onChange={(e) => setNewBotName(e.target.value)}
                  placeholder="e.g., Support Bot"
                  autoFocus
                  data-testid="bot-name-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={createBot}
                  disabled={creating || !newBotName.trim()}
                  className="flex-1"
                  data-testid="confirm-create-bot"
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateDialog(false)
                    setNewBotName("")
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-slate-600 mb-4">Let's build your first bot</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Bot
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-lg transition-shadow" data-testid={`bot-card-${bot.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{bot.name}</CardTitle>
                    <span
                      className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${getStatusColor(
                        bot.status
                      )}`}
                    >
                      {formatStatus(bot.status)}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600 mb-4">
                  <div>Domains: {bot.domain_count || 0}/10</div>
                  <div>Sources: {bot.source_count || 0}/2</div>
                </div>
                <Button
                  onClick={() => router.push(`/bots/${bot.id}`)}
                  className="w-full"
                  size="sm"
                  data-testid={`edit-bot-${bot.id}`}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Empty slots */}
          {bots.length < 20 &&
            Array.from({ length: Math.min(4, 20 - bots.length) }).map((_, i) => (
              <Card key={`empty-${i}`} className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center h-48">
                  <Plus className="h-12 w-12 text-slate-300 mb-2" />
                  <p className="text-sm text-slate-500">Empty slot</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    Create bot
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  )
}
