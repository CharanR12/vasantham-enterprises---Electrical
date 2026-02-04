import React, { useState } from 'react';
import { Customer, FollowUp, FollowUpStatus } from '../types';
import { Phone, MapPin, Calendar, FileText, Copy, Check, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { format, parse, isFuture, parseISO } from 'date-fns';
import CustomerForm from './CustomerForm';
import FollowUpModal from './FollowUpModal';

type CustomerCardProps = {
  customer: Customer;
};

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const [copiedFields, setCopiedFields] = useState<Record<string, boolean>>({});
  const [showEditForm, setShowEditForm] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);

  const formatDate = (dateString: string): string => {
    try {
      const date = parse(dateString, 'yyyy-MM-dd', new Date());
      return format(date, 'EEE, dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleCopy = async (text: string, field: string) => {
    let copyText = text;
    if (field === 'all') {
      const totalSalesAmount = customer.followUps
        .filter(f => f.status === 'Sales completed' && f.salesAmount)
        .reduce((sum, f) => sum + (f.salesAmount || 0), 0);

      copyText = `
Customer Details:
Name: ${customer.name}
Mobile: ${customer.mobile}
Location: ${customer.location}
Referral Source: ${customer.referralSource}
Sales Person: ${customer.salesPerson.name}
Last Contacted: ${customer.lastContactedDate ? formatDate(customer.lastContactedDate) : 'Not set'}
Remarks: ${customer.remarks}
Total Sales Amount: ${totalSalesAmount > 0 ? formatCurrency(totalSalesAmount) : 'No sales completed'}

Follow-ups:
${customer.followUps.map(f => `
Date: ${formatDate(f.date)}
Status: ${f.status}
${f.status === 'Sales completed' && f.salesAmount ? `Sales Amount: ${formatCurrency(f.salesAmount)}` : ''}
Remarks: ${f.remarks}
`).join('\n')}

Created on: ${formatDate(customer.createdAt)}
      `.trim();
    }
    
    await navigator.clipboard.writeText(copyText);
    setCopiedFields({ ...copiedFields, [field]: true });
    setTimeout(() => {
      setCopiedFields({ ...copiedFields, [field]: false });
    }, 2000);
  };

  const getNextFollowUp = (): FollowUp | undefined => {
    const today = new Date();
    return customer.followUps
      .filter(followUp => isFuture(parseISO(followUp.date)))
      .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())[0];
  };

  const getTotalSalesAmount = (): number => {
    return customer.followUps
      .filter(f => f.status === 'Sales completed' && f.salesAmount)
      .reduce((sum, f) => sum + (f.salesAmount || 0), 0);
  };

  const nextFollowUp = getNextFollowUp();
  const totalSalesAmount = getTotalSalesAmount();

  const getStatusColor = (status: FollowUpStatus) => {
    switch (status) {
      case 'Sales completed':
        return 'bg-green-100 text-green-800';
      case 'Sales rejected':
        return 'bg-red-100 text-red-800';
      case 'Scheduled next follow-up':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleCall = () => {
    window.location.href = `tel:+91${customer.mobile}`;
  };

  const handleOpenMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(customer.location)}`, '_blank');
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
            <p className="text-sm text-gray-500">Added on {formatDate(customer.createdAt)}</p>
          </div>
          <button
            onClick={() => setShowEditForm(true)}
            className="text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center flex-1">
              <Phone className="h-4 w-4 mr-2" />
              <span className="text-sm">+91 {customer.mobile}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleCall}
                className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded-full"
                title="Call"
              >
                <Phone className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleCopy(customer.mobile, 'mobile')}
                className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-50 rounded-full"
                title={copiedFields.mobile ? 'Copied!' : 'Copy number'}
              >
                {copiedFields.mobile ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-gray-600">
            <div className="flex items-center flex-1">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">{customer.location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleOpenMaps}
                className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded-full"
                title="Open in Maps"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button 
                onClick={() => handleCopy(customer.location, 'location')}
                className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-50 rounded-full"
                title={copiedFields.location ? 'Copied!' : 'Copy address'}
              >
                {copiedFields.location ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {customer.lastContactedDate && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span className="text-sm">Last contacted: {formatDate(customer.lastContactedDate)}</span>
            </div>
          )}

          {totalSalesAmount > 0 && (
            <div className="flex items-center text-green-600 bg-green-50 p-2 rounded-md">
              <DollarSign className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Total Sales: {formatCurrency(totalSalesAmount)}</span>
            </div>
          )}

          {nextFollowUp && (
            <div className="border rounded-md p-3 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-gray-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Next Follow-up</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(nextFollowUp.status)}`}>
                  {nextFollowUp.status}
                </span>
              </div>
              <div className="text-sm text-gray-600">{formatDate(nextFollowUp.date)}</div>
              {nextFollowUp.remarks && (
                <div className="text-sm text-gray-600 mt-1">{nextFollowUp.remarks}</div>
              )}
              {nextFollowUp.status === 'Sales completed' && nextFollowUp.salesAmount && (
                <div className="text-sm text-green-600 mt-1 font-medium">
                  Amount: {formatCurrency(nextFollowUp.salesAmount)}
                  {nextFollowUp.amountReceived && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      ✓ Received
                    </span>
                  )}
                  {nextFollowUp.amountReceived === false && (
                    <span className="ml-2 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      ⏳ Pending
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setShowFollowUps(true)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            View all follow-ups ({customer.followUps.length})
          </button>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-100 mt-3">
          <div className="text-sm text-gray-500">
            Sales: {customer.salesPerson.name}
          </div>
          <button 
            onClick={() => handleCopy('', 'all')}
            className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-50 rounded-full"
            title={copiedFields.all ? 'Copied!' : 'Copy all details'}
          >
            {copiedFields.all ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {showEditForm && (
        <CustomerForm 
          customer={customer} 
          onClose={() => setShowEditForm(false)} 
        />
      )}

      {showFollowUps && (
        <FollowUpModal
          customer={customer}
          onClose={() => setShowFollowUps(false)}
        />
      )}
    </>
  );
};

export default CustomerCard;