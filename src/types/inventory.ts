export type Brand = {
  id: string;
  name: string;
  createdAt: string;
};

export type Product = {
  id: string;
  brandId: string;
  brand: Brand;
  productName: string;
  modelNumber: string;
  quantityAvailable: number;
  arrivalDate: string;
  createdAt: string;
};

export type SaleEntry = {
  id: string;
  productId: string;
  saleDate: string;
  customerName: string;
  billNumber?: string;
  quantitySold: number;
  createdAt: string;
};