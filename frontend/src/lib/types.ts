export type Listing = {
  id?: string; 
  title: string;
  description?: string; 
  price: number | string;
  location: string;
  image: string;
  created_at?: string;
};

export type Category = {
    name: string;
    subcategories?: string[];
    image: string;
  }