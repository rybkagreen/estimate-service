export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface EstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}
