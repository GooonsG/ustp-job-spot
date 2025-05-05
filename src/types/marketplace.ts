
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
  image_url?: string; 
  seller_name?: string; 
  createdAt: string;
}
