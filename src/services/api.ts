import { ApiError } from './apiUtils';
import { customerService } from './customerService';
import { salesPersonService } from './salesPersonService';

export const api = {
  // Customer endpoints
  getCustomers: customerService.getCustomers,
  createCustomer: customerService.createCustomer,
  updateCustomer: customerService.updateCustomer,
  deleteCustomer: customerService.deleteCustomer,

  // Follow-up endpoints
  updateFollowUpStatus: customerService.updateFollowUpStatus,
  addFollowUp: customerService.addFollowUp,

  // Sales person endpoints
  getSalesPersons: salesPersonService.getSalesPersons,
  createSalesPerson: salesPersonService.createSalesPerson,
  updateSalesPerson: salesPersonService.updateSalesPerson,
  deleteSalesPerson: salesPersonService.deleteSalesPerson,
};

export { ApiError };