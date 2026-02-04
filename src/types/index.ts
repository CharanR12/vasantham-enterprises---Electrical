export type SalesPerson = {
  id: string;
  name: string;
};

export type ReferralSource = 'Self Marketing' | 'Doors Data' | 'Walk-in Customer' | 'Collection' | 'Build Expo 2024' | 'Build Expo 2025';

export type FollowUpStatus = 'Not yet contacted' | 'Scheduled next follow-up' | 'Sales completed' | 'Sales rejected';

export type SalesStatus = 'Completed' | 'Not Completed' | 'Sales Closed';

export type FollowUp = {
  id: string;
  date: string;
  status: FollowUpStatus;
  remarks: string;
  salesAmount?: number; // New field for sales amount
  amountReceived?: boolean; // New field for amount received status
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  location: string;
  referralSource: ReferralSource;
  salesPerson: SalesPerson;
  remarks: string;
  followUps: FollowUp[];
  lastContactedDate?: string;
  createdAt: string;
};

export type User = {
  id: string;
  name: string;
  mobile: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
};