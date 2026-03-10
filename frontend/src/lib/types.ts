export type Listing = {
  id: number;
  title: string;
  description?: string; 
  price: number;
  location: string;
  image: string;
  imageUrl?: string; 
  completedCount?: number;
  postedTime?: string; 
  created_at?: string;
};

export type Category = {
    name: string;
    subcategories?: string[];
    image: string;
  }