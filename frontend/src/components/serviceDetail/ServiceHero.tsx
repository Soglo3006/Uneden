"use client";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface Props {
  imageUrl: string | null;
  title: string;
}

export default function ServiceHero({ imageUrl, title }: Props) {
  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      <AspectRatio ratio={16 / 9}>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
            <span className="text-6xl">🛠️</span>
          </div>
        )}
      </AspectRatio>
    </div>
  );
}
