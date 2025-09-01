"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useAuth, useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import AuthUserModal from "./modals/auth-model";

export default function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/"); // Redirect to home page after sign out
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleProfileClick = () => {
    openUserProfile();
  };

  const handleSettingsClick = () => {
    // You can either open Clerk's user profile modal or navigate to a custom settings page
    openUserProfile();
    // Alternatively: router.push("/settings");
  };

  const handleHelpClick = () => {
    // Navigate to help page or open help modal
    router.push("/help");
    // Or open external link: window.open("https://support.yourapp.com", "_blank");
  };

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/images/icon.svg"
              height={32}
              width={32}
              alt="Kabootar Logo"
              className="h-8 w-8"
            />
            <span className="text-xl font-bold text-gray-900">Kabootar</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="hidden sm:block w-20 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Image
            src="/images/icon.svg"
            height={32}
            width={32}
            alt="Kabootar Logo"
            className="h-8 w-8"
          />
          <span className="text-xl font-bold text-gray-900">Kabootar</span>
        </div>

        {isSignedIn && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-700 font-medium text-sm">
                    {user.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() ||
                      user.firstName?.[0]?.toUpperCase() ||
                      user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden font-medium text-gray-900 sm:block max-w-32 truncate">
                  {user.fullName ||
                    user.firstName ||
                    user.emailAddresses[0]?.emailAddress?.split("@")[0]}
                </span>
                <ChevronDownIcon className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 mt-2 bg-white border border-gray-200 shadow-lg rounded-lg"
            >
              <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-sm cursor-default focus:bg-transparent">
                <Avatar className="h-6 w-6">
                  <AvatarImage
                    src={user.imageUrl}
                    alt={user.fullName || "User"}
                  />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-xs">
                    {user.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() ||
                      user.firstName?.[0]?.toUpperCase() ||
                      user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {user.fullName || user.firstName || "User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user.primaryEmailAddress?.emailAddress ||
                      user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleProfileClick}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleSettingsClick}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                Settings
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleHelpClick}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                Help & Support
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleSignOut}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-red-50 focus:bg-red-50 text-red-600"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex-shrink-0">
            <AuthUserModal />
          </div>
        )}
      </div>
    </header>
  );
}
