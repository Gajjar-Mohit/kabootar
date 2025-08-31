"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiRequest } from "@/lib/api-client"
import { useApiConfig } from "@/hooks/use-api-config"

function JsonView({ data }: { data: any }) {
  if (data == null) return null
  return (
    <pre className="mt-2 rounded-md bg-muted p-3 text-sm overflow-auto max-h-72">
      {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
    </pre>
  )
}

export function MessageActions() {
  const { config } = useApiConfig()

  // Send/Store Message
  const [text, setText] = useState("")
  const [sender, setSender] = useState("")
  const [recipient, setRecipient] = useState("")
  const [messageType, setMessageType] = useState("text")
  const [sendResult, setSendResult] = useState<any>(null)
  const [sendLoading, setSendLoading] = useState(false)

  // Messages Between Users
  const [currentUserId, setCurrentUserId] = useState("")
  const [otherUserId, setOtherUserId] = useState("")
  const [betweenResult, setBetweenResult] = useState<any>(null)
  const [betweenLoading, setBetweenLoading] = useState(false)

  // Conversations by User
  const [convUserId, setConvUserId] = useState("")
  const [convResult, setConvResult] = useState<any>(null)
  const [convLoading, setConvLoading] = useState(false)

  async function handleSend() {
    setSendLoading(true)
    setSendResult(null)
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "POST",
        path: config.routes.messagesCreate,
        body: { text, sender, recipient, messageType },
      })
      setSendResult(res.data)
    } catch (e: any) {
      setSendResult({ error: e?.message || "Request failed" })
    } finally {
      setSendLoading(false)
    }
  }

  async function handleBetween() {
    setBetweenLoading(true)
    setBetweenResult(null)
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "POST",
        path: config.routes.messagesBetween,
        body: { currentUserId, recipientId: otherUserId },
      })
      setBetweenResult(res.data)
    } catch (e: any) {
      setBetweenResult({ error: e?.message || "Request failed" })
    } finally {
      setBetweenLoading(false)
    }
  }

  async function handleConversations() {
    if (!convUserId) return
    setConvLoading(true)
    setConvResult(null)
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "GET",
        path: config.routes.conversationsByUser,
        params: { id: convUserId },
      })
      setConvResult(res.data)
    } catch (e: any) {
      setConvResult({ error: e?.message || "Request failed" })
    } finally {
      setConvLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Send/Store Message</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="sender">Sender ID</Label>
              <Input id="sender" value={sender} onChange={(e) => setSender(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="recipient">Recipient ID</Label>
              <Input id="recipient" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="text">Text</Label>
            <Input id="text" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <div className="grid gap-2 md:max-w-xs">
            <Label>Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">text</SelectItem>
                <SelectItem value="image">image</SelectItem>
                <SelectItem value="file">file</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSend} disabled={sendLoading}>
              {sendLoading ? "Sending..." : "Send"}
            </Button>
          </div>
          <JsonView data={sendResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Messages Between Users</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="current">Current User ID</Label>
              <Input id="current" value={currentUserId} onChange={(e) => setCurrentUserId(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="other">Recipient User ID</Label>
              <Input id="other" value={otherUserId} onChange={(e) => setOtherUserId(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBetween} disabled={betweenLoading}>
              {betweenLoading ? "Fetching..." : "Fetch Messages"}
            </Button>
          </div>
          <JsonView data={betweenResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Conversations By User</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2 md:max-w-sm">
            <Label htmlFor="convUser">User ID</Label>
            <Input id="convUser" value={convUserId} onChange={(e) => setConvUserId(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleConversations} disabled={convLoading}>
              {convLoading ? "Fetching..." : "Fetch Conversations"}
            </Button>
          </div>
          <JsonView data={convResult} />
        </CardContent>
      </Card>
    </div>
  )
}
