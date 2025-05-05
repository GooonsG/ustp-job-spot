
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  seller_id?: string;
  category: string;
  condition: string;
  image: string;
  image_url?: string; // Add this property
  seller_name?: string; // Add this property
  createdAt: string;
}
