"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApiConfigPanel } from "@/components/api-config"
import { UserActions } from "@/components/user-actions"
import { MessageActions } from "@/components/message-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Page() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold text-pretty">Backend API Console</h1>
        <p className="text-muted-foreground mt-1">
          Test your Users and Messages endpoints with a clean, minimal UI. Configure the base URL and paths below.
        </p>
      </header>

      <div className="mb-8">
        <ApiConfigPanel />
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-pretty">Quick Reference</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <ul className="list-disc pl-5 space-y-1">
            <li>Create User: POST body {"{ name, email, phone?, profileUrl?, bio?, publickey }"}</li>
            <li>Get User: GET param {"/users/:id"}</li>
            <li>Delete User: DELETE param {"/users/:id"}</li>
            <li>Send Message: POST body {"{ text, sender, recipient, messageType }"}</li>
            <li>Messages Between Users: POST body {"{ currentUserId, recipientId }"}</li>
            <li>Conversations By User: GET param {"/conversations/:id"}</li>
          </ul>
        </CardContent>
      </Card>

      <Tabs defaultValue="users" className="grid gap-6">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <UserActions />
        </TabsContent>
        <TabsContent value="messages">
          <MessageActions />
        </TabsContent>
      </Tabs>
    </main>
  )
}
