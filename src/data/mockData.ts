import { Customer, SalesPerson } from '../types';

export const salesPersons: SalesPerson[] = [
  { id: '1', name: 'Rajesh Kumar' },
  { id: '2', name: 'Priya Sharma' },
  { id: '3', name: 'Amit Patel' },
  { id: '4', name: 'Deepa Singh' },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const dayAfterTomorrow = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rahul Verma',
    mobile: '9876543210',
    location: 'Bangalore, Karnataka',
    referralSource: 'Self Marketing',
    salesPerson: salesPersons[0],
    remarks: 'Interested in premium package',
    followUps: [
      {
        id: '1',
        date: yesterday,
        status: 'Sales completed',
        remarks: 'Customer confirmed order',
      },
      {
        id: '2',
        date: tomorrow,
        status: 'Scheduled next follow-up',
        remarks: 'Demo scheduled',
      },
    ],
    createdAt: '2024-03-15',
  },
  {
    id: '2',
    name: 'Anita Desai',
    mobile: '9898989898',
    location: 'Chennai, Tamil Nadu',
    referralSource: 'Doors Data',
    salesPerson: salesPersons[1],
    remarks: 'Requested product demo',
    followUps: [
      {
        id: '3',
        date: today,
        status: 'Not yet contacted',
        remarks: 'Initial contact pending',
      },
    ],
    createdAt: '2024-03-14',
  },
  {
    id: '3',
    name: 'Suresh Kumar',
    mobile: '9765432109',
    location: 'Mumbai, Maharashtra',
    referralSource: 'Self Marketing',
    salesPerson: salesPersons[2],
    remarks: 'Price negotiation in progress',
    followUps: [
      {
        id: '4',
        date: yesterday,
        status: 'Sales rejected',
        remarks: 'Budget constraints',
      },
      {
        id: '5',
        date: tomorrow,
        status: 'Scheduled next follow-up',
        remarks: 'Follow up on revised quote',
      },
    ],
    createdAt: '2024-03-13',
  },
  {
    id: '4',
    name: 'Meera Patel',
    mobile: '9876123450',
    location: 'Hyderabad, Telangana',
    referralSource: 'Doors Data',
    salesPerson: salesPersons[3],
    remarks: 'Looking for bulk order options',
    followUps: [
      {
        id: '6',
        date: today,
        status: 'Scheduled next follow-up',
        remarks: 'Preparing bulk order quotation',
      },
    ],
    createdAt: '2024-03-16',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    mobile: '9887766554',
    location: 'Delhi, NCR',
    referralSource: 'Self Marketing',
    salesPerson: salesPersons[0],
    remarks: 'Interested in annual maintenance contract',
    followUps: [
      {
        id: '7',
        date: tomorrow,
        status: 'Not yet contacted',
        remarks: 'Schedule product demonstration',
      },
    ],
    createdAt: '2024-03-15',
  },
  {
    id: '6',
    name: 'Priya Reddy',
    mobile: '9912345678',
    location: 'Pune, Maharashtra',
    referralSource: 'Doors Data',
    salesPerson: salesPersons[2],
    remarks: 'Requires customized solution',
    followUps: [
      {
        id: '8',
        date: dayAfterTomorrow,
        status: 'Scheduled next follow-up',
        remarks: 'Technical team meeting scheduled',
      },
    ],
    createdAt: '2024-03-14',
  },
  {
    id: '7',
    name: 'Arjun Menon',
    mobile: '9876598765',
    location: 'Kochi, Kerala',
    referralSource: 'Self Marketing',
    salesPerson: salesPersons[1],
    remarks: 'Premium package inquiry',
    followUps: [
      {
        id: '9',
        date: today,
        status: 'Sales completed',
        remarks: 'Contract signed and advance received',
      },
    ],
    createdAt: '2024-03-16',
  },
  {
    id: '8',
    name: 'Zara Ahmed',
    mobile: '9898767654',
    location: 'Kolkata, West Bengal',
    referralSource: 'Doors Data',
    salesPerson: salesPersons[3],
    remarks: 'Comparing with competitor products',
    followUps: [
      {
        id: '10',
        date: yesterday,
        status: 'Not yet contacted',
        remarks: 'Prepare competitive analysis',
      },
      {
        id: '11',
        date: tomorrow,
        status: 'Scheduled next follow-up',
        remarks: 'Present product advantages',
      },
    ],
    createdAt: '2024-03-15',
  },
];