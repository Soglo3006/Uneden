export type Category = {
    name: string;
    subcategories?: string[];
    image: string;
  }

  export const categories: Category[] = [
    { name: "Cleaning", subcategories: ["House cleaning","Deep cleaning","Office cleaning"], image: "/Categories/cleaning.jpg" },
    { name: "Moving", subcategories: ["Local moving","Transportation","Packing services"], image: "/Categories/moving.webp" },
    { name: "Home Repair", subcategories: ["Plumbing","Electrical work","General repair"], image: "/Categories/home_repair.jpg" },
    { name: "Tech Support", subcategories: ["Computer repair","Network setup","Software installation"], image: "/Categories/tech_support.jpg" },
    { name: "Delivery & Errands", subcategories: ["Grocery delivery","Package delivery","Personal errands"], image: "/Categories/delivery_errands.jpg" },
    { name: "Car Services", subcategories: ["Car wash","Oil change","Tire services"], image: "/Categories/car_services.jpg" },
    { name: "Painting & Renovation", subcategories: ["Interior painting","Exterior painting","Renovation projects"], image: "/Categories/renovation.webp" },
    { name: "Landscaping / Gardening", subcategories: ["Lawn care","Garden design","Tree trimming"], image: "/Categories/gardening.webp" },
  ];

  