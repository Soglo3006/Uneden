export type Category = {
    name: string;
    subcategories?: string[];
  }

  export const categories: Category[] = [
    { name: "Cleaning", subcategories: ["House cleaning","Deep cleaning","Office cleaning"] },
    { name: "Moving", subcategories: ["Local moving","Transportation","Packing services"] },
    { name: "Home Repair", subcategories: ["Plumbing","Electrical work","General repair"] },
    { name: "Tech Support", subcategories: ["Computer repair","Network setup","Software installation"] },
    { name: "Delivery & Errands", subcategories: ["Grocery delivery","Package delivery","Personal errands"] },
    { name: "Car Services", subcategories: ["Car wash","Oil change","Tire services"] },
    { name: "Painting & Renovation", subcategories: ["Interior painting","Exterior painting","Renovation projects"] },
    { name: "Landscaping / Gardening", subcategories: ["Lawn care","Garden design","Tree trimming"] },
  ];

  