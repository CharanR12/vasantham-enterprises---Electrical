import { brandService } from './brandService';
import { productService } from './productService';
import { saleEntryService } from './saleEntryService';

export const inventoryApi = {
  // Brand endpoints
  getBrands: brandService.getBrands,
  createBrand: brandService.createBrand,
  updateBrand: brandService.updateBrand,
  deleteBrand: brandService.deleteBrand,

  // Product endpoints
  getProducts: productService.getProducts,
  createProduct: productService.createProduct,
  updateProduct: productService.updateProduct,
  deleteProduct: productService.deleteProduct,

  // Sale entry endpoints
  getSaleEntries: saleEntryService.getSaleEntries,
  createSaleEntry: saleEntryService.createSaleEntry,
};