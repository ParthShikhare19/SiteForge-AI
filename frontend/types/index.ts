export interface User {
  id: number;
  email: string;
  name?: string | null;
  created_at: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Business {
  id: number;
  name: string;
  category: string;
  slug: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  timings: string | null;
  created_at: string;
  is_published: boolean | null;
}

export interface ProductItem {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image_url?: string | null;
  badge?: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  text: string;
  rating: number;
  role?: string;
}

export interface HeroSection {
  headline: string;
  subheadline: string;
  cta_text: string;
  cta_secondary: string;
  badge: string;
  background_color: string;
  hero_image?: string;
}

export interface AboutSection {
  title: string;
  content: string;
  highlights: string[];
}

export interface ContactSection {
  phone: string;
  email: string;
  address: string;
  timings: string;
  whatsapp: string;
}

export interface Social {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface WebsiteJSON {
  hero: HeroSection;
  about: AboutSection;
  features: Feature[];
  products: ProductItem[];
  testimonials: Testimonial[];
  contact: ContactSection;
  social: Social;
  theme_color: string;
  accent_color: string;
  font: string;
  products_title?: string;
  products_subtitle?: string;
  logo_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface Website {
  id: number;
  business_id: number;
  template_id: string;
  website_json: WebsiteJSON;
  is_published: boolean;
  updated_at: string;
}

export interface PublicWebsite {
  business: { name: string; category: string; slug: string };
  template_id: string;
  website_json: WebsiteJSON;
  is_published: boolean;
}
