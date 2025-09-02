"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/urls";
import { useApiConfig } from "@/lib/healthCheck";

function JsonView({ data }: { data: any }) {
  if (data == null) return null;
  return (
    <pre className="mt-2 rounded-md bg-muted p-3 text-sm overflow-auto max-h-72">
      {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
    </pre>
  );
}

export function UserActions() {
  const { config } = useApiConfig();

  // Create User
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [bio, setBio] = useState("");
  const [publickey, setPublickey] = useState("");
  const [createResult, setCreateResult] = useState<any>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // Get/Delete by ID
  const [userId, setUserId] = useState("");
  const [getResult, setGetResult] = useState<any>(null);
  const [deleteResult, setDeleteResult] = useState<any>(null);
  const [getLoading, setGetLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleCreate() {
    setCreateLoading(true);
    setCreateResult(null);
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "POST",
        path: config.routes.usersCreate,
        body: { name, email, phone, profileUrl, bio, publickey },
      });
      setCreateResult(res.data);
    } catch (e: any) {
      setCreateResult({ error: e?.message || "Request failed" });
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleGet() {
    if (!userId) return;
    setGetLoading(true);
    setGetResult(null);
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "GET",
        path: config.routes.usersGetById,
        params: { id: userId },
      });
      setGetResult(res.data);
    } catch (e: any) {
      setGetResult({ error: e?.message || "Request failed" });
    } finally {
      setGetLoading(false);
    }
  }

  async function handleDelete() {
    if (!userId) return;
    setDeleteLoading(true);
    setDeleteResult(null);
    try {
      const res = await apiRequest(config.baseUrl, {
        method: "DELETE",
        path: config.routes.usersDelete,
        params: { id: userId },
      });
      setDeleteResult(res.data);
    } catch (e: any) {
      setDeleteResult({ error: e?.message || "Request failed" });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Create User</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileUrl">Profile URL</Label>
              <Input
                id="profileUrl"
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="publickey">Public Key</Label>
            <Input
              id="publickey"
              value={publickey}
              onChange={(e) => setPublickey(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCreate}
              disabled={createLoading}
              className="bg-primary text-primary-foreground"
            >
              {createLoading ? "Creating..." : "Create"}
            </Button>
          </div>
          <JsonView data={createResult} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-pretty">Get/Delete User</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <div className="grid gap-2 md:max-w-sm">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGet} disabled={getLoading}>
              {getLoading ? "Loading..." : "Get User"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting..." : "Delete User"}
            </Button>
          </div>
          <Separator />
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <div className="font-medium">Get Result</div>
              <JsonView data={getResult} />
            </div>
            <div>
              <div className="font-medium">Delete Result</div>
              <JsonView data={deleteResult} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
