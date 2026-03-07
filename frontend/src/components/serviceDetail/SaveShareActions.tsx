"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2 } from "lucide-react";

interface Props {
  serviceId: string;
  title: string;
}

export default function SaveShareActions({ serviceId, title }: Props) {
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const arr: string[] = JSON.parse(localStorage.getItem("savedListings") ?? "[]");
      return arr.includes(serviceId);
    } catch {
      return false;
    }
  });

  const toggleSave = () => {
    try {
      const arr: string[] = JSON.parse(localStorage.getItem("savedListings") ?? "[]");
      const next = arr.includes(serviceId)
        ? arr.filter((id) => id !== serviceId)
        : [...arr, serviceId];
      localStorage.setItem("savedListings", JSON.stringify(next));
      setIsSaved(next.includes(serviceId));
    } catch {
      setIsSaved((v) => !v);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard");
      } catch {
        alert(url);
      }
    }
  };

  return (
    <div className="flex items-center gap-2 mt-3">
      <Button variant="outline" className="gap-2" onClick={toggleSave}>
        <Bookmark className={`h-4 w-4 ${isSaved ? "fill-green-700 text-green-700" : ""}`} />
        {isSaved ? "Saved" : "Save"}
      </Button>
      <Button variant="outline" className="gap-2" onClick={handleShare}>
        <Share2 className="h-4 w-4" />
        Share
      </Button>
    </div>
  );
}
