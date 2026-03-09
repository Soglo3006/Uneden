"use client";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2 } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { toast } from "sonner";

interface Props {
  serviceId: string;
  title: string;
}

export default function SaveShareActions({ serviceId, title }: Props) {
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(serviceId);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      } catch {
        toast.success("Link copied to clipboard");
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button variant="outline" className="gap-2" onClick={() => toggle(serviceId)}>
        <Bookmark className={`h-4 w-4 ${saved ? "fill-green-700 text-green-700" : ""}`} />
        {saved ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
