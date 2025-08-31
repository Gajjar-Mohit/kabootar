import { SignInButton, SignUpButton } from "@clerk/nextjs";
import React from "react";
import { Button } from "../ui/button";

const AuthUserModal = () => {
  return (
    <div className="flex items-center gap-2">
      <SignInButton mode="modal">
        <Button
          variant="ghost"
          size="sm"
          className="hover:bg-gray-100 rounded-full"
        >
          Sign In
        </Button>
      </SignInButton>

      <SignUpButton mode="modal">
        <Button size="sm" className="bg-black hover:bg-black-700 rounded-full">
          Sign Up
        </Button>
      </SignUpButton>
    </div>
  );
};

export default AuthUserModal;
