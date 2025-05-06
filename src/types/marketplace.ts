
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

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  salary: string;
  deadline: string;
  posted_date: string;
  logos: string[];
  logo?: string; // For backward compatibility
  tags: string[];
  employer_id: string;
}
