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

export type InventoryContextType = {
  products: Product[];
  brands: Brand[];
  salesEntries: SaleEntry[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'brand'>) => Promise<boolean>;
  updateProduct: (product: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  addBrand: (name: string) => Promise<boolean>;
  updateBrand: (id: string, name: string) => Promise<boolean>;
  deleteBrand: (id: string) => Promise<boolean>;
  addSaleEntry: (saleEntry: Omit<SaleEntry, 'id' | 'createdAt'>) => Promise<boolean>;
  getSalesForProduct: (productId: string) => SaleEntry[];
  refreshData: () => Promise<void>;
};