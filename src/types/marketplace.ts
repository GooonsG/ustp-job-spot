
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  seller_id?: string;
  seller_name?: string;
  category: string;
  condition: string;
  images: string[];
  image?: string; // For backward compatibility
  createdAt: string;
}
