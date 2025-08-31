import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function ProfilePanel() {
  const photoQueries = [
    "mountain landscape",
    "abstract art purple",
    "sunset gradient",
    "minimalist food",
    "city skyline night",
    "nature macro",
    "geometric pattern",
    "ocean waves",
    "forest trees",
  ];

  return (
    <div className="p-6">
      {/* Profile Info */}
      <div className="text-center">
        <Avatar className="mx-auto h-20 w-20">
          <AvatarImage src="/avatar-woman-designer.png" alt="Monalisa" />
          <AvatarFallback>MO</AvatarFallback>
        </Avatar>
        <h3 className="mt-3 text-lg font-semibold text-gray-900">Monalisa</h3>
        <p className="text-sm text-gray-600">Head Of Design at Kabootar</p>
        <p className="text-xs text-gray-500">Bangladesh</p>
        <p className="text-xs text-gray-500">Local Time 3:41PM (UTC +06:00)</p>
      </div>

      {/* Photos Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Photos</h4>
          <Button variant="ghost" size="sm" className="text-xs">
            Files
          </Button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photoQueries.map((query, index) => (
            <div
              key={index}
              className="aspect-square overflow-hidden rounded-lg"
            >
              <img
                src={`/abstract-geometric-shapes.png?height=80&width=80&query=${encodeURIComponent(
                  query
                )}`}
                alt={`Photo ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
