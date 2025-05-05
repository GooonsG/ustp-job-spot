
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  seller: string;
  seller_id?: string; // Add seller_id as an optional property
  category: string;
  condition: string;
  image: string;
  createdAt: string;
}
