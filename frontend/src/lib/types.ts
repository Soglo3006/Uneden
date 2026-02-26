// src/lib/types.ts
export type Listing = {
  id: number;
  title: string;
  description?: string; 
  price: number;
  location: string;
  image: string;
  imageUrl?: string; // alias pour image
  completedCount?: number;
  postedTime?: string; // alias pour created_at
  created_at?: string;
};

export type Category = {
    name: string;
    subcategories?: string[];
    image: string;
  }