export type SalesPerson = {
  id: string;
  name: string;
  department?: string;
  branch?: string;
};

// export type ReferralSource = string; // Deprecating simple string type if possible, or keeping for backward compat but adding Entity type
export type ReferralSource = string;
export type ReferralSourceEntity = {
  id: string;
  name: string;
  createdAt?: string;
};

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
  branch?: string;
};

export type User = {
  id: string;
  name: string;
  mobile: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
};