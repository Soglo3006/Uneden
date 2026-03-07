export interface Language {
  id: number;
  language: string;
  proficiency: string;
}

export interface Experience {
  id: number;
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface PortfolioItem {
  id: number;
  image: string;
  title: string;
  description: string;
}

export interface OnboardingData {
  accountType: "" | "person" | "company";
  avatar: string;
  email: string;
  phone: string;
  adresse: string;
  ville: string;
  province: string;
  fullName?: string;
  profession?: string;
  bio?: string;
  skills?: string[];
  languages?: Language[];
  experiences?: Experience[];
  companyName?: string;
  industry?: string;
  companyBio?: string;
  teamSize?: string;
  portfolio: PortfolioItem[];
}

export const languageOptions = [
  "English", "French", "Spanish", "Arabic", "Mandarin",
  "Portuguese", "German", "Italian", "Japanese", "Korean", "Hindi", "Russian",
];

export const proficiencyOptions = ["Basic", "Conversational", "Fluent", "Native"];

export const professionSuggestions = [
  "Electrician", "Plumber", "Carpenter", "House Cleaner", "Math Tutor",
  "English Tutor", "Personal Trainer", "Graphic Designer", "Web Developer",
  "Photographer", "Videographer", "Painter", "Landscaper", "Handyman",
  "HVAC Technician", "Mechanic", "Dog Walker", "Pet Sitter", "Babysitter",
  "Chef", "Massage Therapist", "Yoga Instructor", "Music Teacher",
  "Piano Teacher", "Guitar Teacher",
];

export const skillSuggestions = [
  "Electrical Work", "Plumbing", "Carpentry", "House Cleaning", "Deep Cleaning",
  "Tutoring", "Math", "English", "French", "Personal Training", "Graphic Design",
  "Web Development", "Photography", "Video Editing", "Painting", "Landscaping",
  "Garden Maintenance", "Home Repairs", "HVAC Repair", "Auto Repair", "Dog Training",
  "Pet Care", "Child Care", "Cooking", "Massage", "Yoga", "Piano", "Guitar",
  "Microsoft Office", "Adobe Photoshop", "Customer Service",
];

export const serviceSuggestions = [
  "Residential Cleaning", "Commercial Cleaning", "Deep Cleaning",
  "Electrical Services", "Electrical Repair", "Electrical Installation",
  "Plumbing Services", "Plumbing Repair", "Drain Cleaning",
  "Construction", "Home Renovation", "Kitchen Renovation", "Bathroom Renovation",
  "Roofing", "HVAC Services", "Heating & Cooling", "Landscaping Services",
  "Lawn Care", "Snow Removal", "Moving Services", "Pest Control",
  "Painting Services", "Interior Painting", "Exterior Painting",
  "Carpet Cleaning", "Window Cleaning", "Pressure Washing",
  "Web Design", "Digital Marketing", "SEO Services", "Catering", "Event Planning",
];
