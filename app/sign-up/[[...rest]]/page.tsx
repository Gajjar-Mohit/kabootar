import { SignIn, SignUp } from "@clerk/nextjs";
import React from "react";

const page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <SignUp />
    </div>
  );
};

export default page;
