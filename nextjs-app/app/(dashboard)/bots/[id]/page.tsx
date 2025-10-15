"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, MessageSquare, Settings, ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Bot {
  id: string
  name: string
  greeting?: string
  system_prompt?: string
  status: string
  temperature?: number
  max_tokens?: number
}

interface Source {
  id: string
  name: string
  type: string
  status: string
  chunk_count: number
  created_at: string
}

export default function BotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [bot, setBot] = useState<Bot | null>(null)
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [greeting, setGreeting] = useState("")
  const [systemPrompt, setSystemPrompt] = useState("")
  const [temperature, setTemperature] = useState(0.7)

  // Chat states
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState("")
  const [chatting, setChatting] = useState(false)

  useEffect(() => {
    loadBot()
    loadSources()
  }, [])

  const loadBot = async () => {
    try {
      const response = await fetch(`/api/bots/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setBot(data)
        setName(data.name || "")
        setGreeting(data.greeting || "Hi! How can I help you today?")
        setSystemPrompt(data.system_prompt || "You are a helpful assistant.")
        setTemperature(data.temperature || 0.7)
      }
    } catch (error) {
      console.error("Failed to load bot:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadSources = async () => {
    try {
      const response = await fetch(`/api/bots/${params.id}/sources`)
      if (response.ok) {
        const data = await response.json()
        setSources(data)
      }
    } catch (error) {
      console.error("Failed to load sources:", error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/bots/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          greeting,
          system_prompt: systemPrompt,
          temperature,
        }),
      })

      if (response.ok) {
        toast({ title: "Settings saved successfully" })
        loadBot()
      } else {
        toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`/api/bots/${params.id}/sources`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast({ title: "File uploaded successfully" })
        loadSources()
      } else {
        const data = await response.json()
        toast({ title: "Error", description: data.error || "Upload failed", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Upload failed", variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || chatting) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setChatting(true)

    try {
      const response = await fetch(`/api/bots/${params.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages(prev => [...prev, { role: "assistant", content: data.response }])
      } else {
        toast({ title: "Error", description: "Failed to get response", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to get response", variant: "destructive" })
    } finally {
      setChatting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!bot) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Bot not found</p>
          <Button onClick={() => router.push("/bots")} className="mt-4">
            Back to Bots
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push("/bots")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{bot.name}</h1>
          <p className="text-muted-foreground">Configure your chatbot</p>
        </div>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="knowledge">
            <Upload className="h-4 w-4 mr-2" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="test">
            <MessageSquare className="h-4 w-4 mr-2" />
            Test Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bot Settings</CardTitle>
              <CardDescription>Configure how your bot behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bot Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Assistant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="greeting">Greeting Message</Label>
                <Input
                  id="greeting"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Hi! How can I help you today?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="system">System Prompt</Label>
                <Textarea
                  id="system"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="temp">Temperature: {temperature}</Label>
                <input
                  id="temp"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Lower = more focused, Higher = more creative
                </p>
              </div>

              <Button onClick={saveSettings} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Knowledge Base</CardTitle>
              <CardDescription>Upload documents to teach your bot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload PDF, TXT, or DOCX files
                </p>
                <Input
                  type="file"
                  accept=".pdf,.txt,.docx"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="max-w-xs mx-auto"
                />
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Uploaded Sources ({sources.length})</h3>
                {sources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sources uploaded yet</p>
                ) : (
                  sources.map((source) => (
                    <div
                      key={source.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {source.chunk_count} chunks • {source.status}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Test Your Bot</CardTitle>
              <CardDescription>Chat with your bot to test its responses</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Start a conversation to test your bot
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type your message..."
                  disabled={chatting}
                />
                <Button onClick={sendMessage} disabled={chatting || !input.trim()}>
                  {chatting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
