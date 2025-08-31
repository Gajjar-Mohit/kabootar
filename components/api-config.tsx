"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApiConfig } from "@/hooks/use-api-config"

export function ApiConfigPanel() {
  const { config, save, reset } = useApiConfig()

  return (
    <Card className="border rounded-lg">
      <CardHeader>
        <CardTitle className="text-pretty">API Configuration</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="baseUrl">Base URL</Label>
          <Input
            id="baseUrl"
            placeholder="https://your-backend.example.com"
            value={config.baseUrl}
            onChange={(e) => save({ ...config, baseUrl: e.target.value })}
          />
        </div>

        <div className="grid gap-2">
          <Label>Users</Label>
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              aria-label="Create User Path"
              value={config.routes.usersCreate}
              onChange={(e) => save({ ...config, routes: { ...config.routes, usersCreate: e.target.value } })}
            />
            <Input
              aria-label="Get User By ID Path"
              value={config.routes.usersGetById}
              onChange={(e) => save({ ...config, routes: { ...config.routes, usersGetById: e.target.value } })}
            />
            <Input
              aria-label="Delete User Path"
              value={config.routes.usersDelete}
              onChange={(e) => save({ ...config, routes: { ...config.routes, usersDelete: e.target.value } })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Messages</Label>
          <div className="grid gap-2 md:grid-cols-3">
            <Input
              aria-label="Send/Store Message Path"
              value={config.routes.messagesCreate}
              onChange={(e) => save({ ...config, routes: { ...config.routes, messagesCreate: e.target.value } })}
            />
            <Input
              aria-label="Messages Between Users Path"
              value={config.routes.messagesBetween}
              onChange={(e) => save({ ...config, routes: { ...config.routes, messagesBetween: e.target.value } })}
            />
            <Input
              aria-label="Conversations By User Path"
              value={config.routes.conversationsByUser}
              onChange={(e) => save({ ...config, routes: { ...config.routes, conversationsByUser: e.target.value } })}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="default" onClick={() => save({ ...config })}>
            Save
          </Button>
          <Button variant="secondary" onClick={reset}>
            Reset defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
