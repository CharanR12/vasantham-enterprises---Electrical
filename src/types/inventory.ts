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
  mrp: number;
  purchaseDiscountPercent: number;
  purchaseDiscountedPrice: number;
  salePrice: number;
  saleDiscountPercent: number;
  createdAt: string;
  updatedAt?: string;
  // Optional fields for UI/Invoice selection
  saleDiscountAmount?: number;
  discount?: number;
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

export type InvoiceItem = {
  id: string;
  invoiceId: string;
  productId: string;
  productName: string;
  modelNumber: string;
  brandName: string;
  mrp: number;
  salePrice: number;
  discount: number; // Manual discount applied at transaction
  // Snapshot fields
  purchaseRate: number;
  purchaseDiscountPercent: number;
  purchaseDiscountedPrice: number;
  saleDiscountPercent: number;
  saleDiscountAmount: number;
  // Calculation
  quantity: number;
  lineTotal: number;
  sortOrder: number;
  createdAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  companyName?: string;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Shared';
  items: InvoiceItem[];
  createdAt: string;
};