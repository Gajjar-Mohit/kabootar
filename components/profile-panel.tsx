import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfilePanel({
  profileImage,
  email,
  fullName,
  bio,
}: {
  profileImage: string;
  email: string;
  fullName: string;
  bio: string;
}) {
  return (
    <div className="p-6">
      {/* Profile Info */}
      <div className="text-center">
        <Avatar className="mx-auto h-20 w-20">
          <AvatarImage src={profileImage} alt={fullName} />
          <AvatarFallback>{fullName}</AvatarFallback>
        </Avatar>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">{fullName}</h3>

        {bio ?? <p className="text-sm text-gray-600">{bio}</p>}
        <p className="text-xs text-gray-500">{email}</p>
      </div>
    </div>
  );
}
