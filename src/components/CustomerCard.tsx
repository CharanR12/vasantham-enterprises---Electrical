import React, { useState } from 'react';
import { Customer, FollowUp, FollowUpStatus } from '../types';
import { Phone, MapPin, Calendar, Pencil, Copy, Check, ExternalLink, Clock, DollarSign } from 'lucide-react';
import { format, parse, isFuture, parseISO } from 'date-fns';
import CustomerForm from './CustomerForm';
import FollowUpModal from './FollowUpModal';
import { useCustomers } from '../context/CustomerContext';

type CustomerCardProps = {
  customer: Customer;
};

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const { salesPersons } = useCustomers();
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
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Sales rejected':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Scheduled next follow-up':
        return 'bg-brand-50 text-brand-700 border-brand-100';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
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
      <div className="premium-card p-6 group transition-all duration-300">
        <div className="flex justify-between items-start mb-6 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-slate-900 leading-tight truncate group-hover:text-brand-600 transition-colors duration-300">{customer.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Created {formatDate(customer.createdAt)}
            </p>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-slate-400 hover:text-brand-600 p-2 hover:bg-brand-50 rounded-xl transition-all duration-200"
              title="Edit customer"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleCopy('', 'all')}
              className="text-slate-400 hover:text-brand-600 p-2 hover:bg-brand-50 rounded-xl transition-all duration-200"
              title={copiedFields.all ? 'Details Copied!' : 'Copy all details'}
            >
              {copiedFields.all ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100 transition-colors hover:border-slate-200">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                  <Phone className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm font-bold text-slate-700 truncate">+91 {customer.mobile}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCall}
                  className="bg-emerald-100 text-emerald-700 p-2 hover:bg-emerald-200 rounded-xl transition-all duration-200"
                  title="Call now"
                >
                  <Phone className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopy(customer.mobile, 'mobile')}
                  className="bg-white text-slate-400 hover:text-slate-600 p-2 border border-slate-200 rounded-xl transition-all duration-200 shadow-sm"
                  title="Copy Number"
                >
                  {copiedFields.mobile ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50/50 p-3 rounded-2xl border border-slate-100 transition-colors hover:border-slate-200">
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                  <MapPin className="h-4 w-4 text-brand-500" />
                </div>
                <span className="text-sm font-bold text-slate-700 truncate">{customer.location}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleOpenMaps}
                  className="bg-brand-100 text-brand-700 p-2 hover:bg-brand-200 rounded-xl transition-all duration-200"
                  title="Open location"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleCopy(customer.location, 'location')}
                  className="bg-white text-slate-400 hover:text-slate-600 p-2 border border-slate-200 rounded-xl transition-all duration-200 shadow-sm"
                  title="Copy location"
                >
                  {copiedFields.location ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {customer.lastContactedDate && (
              <div className="flex items-center text-slate-500 group/date">
                <Clock className="h-3.5 w-3.5 mr-2 group-hover/date:text-brand-500 transition-colors" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Last Contact: <span className="text-slate-600">{formatDate(customer.lastContactedDate)}</span></span>
              </div>
            )}
            {totalSalesAmount > 0 && (
              <div className="flex items-center px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600 mr-1" />
                <span className="text-[11px] font-black text-emerald-700">{formatCurrency(totalSalesAmount)}</span>
              </div>
            )}
          </div>

          {nextFollowUp && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center text-slate-900">
                  <div className="p-1 px-2.5 bg-white border border-slate-200 rounded-lg shadow-sm mr-2.5">
                    <Calendar className="h-3.5 w-3.5 text-brand-600" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500">Next Action</span>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${getStatusColor(nextFollowUp.status)}`}>
                  {nextFollowUp.status === 'Scheduled next follow-up' ? 'Scheduled' : nextFollowUp.status}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-800 mb-2">{formatDate(nextFollowUp.date)}</div>
              {nextFollowUp.remarks && (
                <div className="text-xs text-slate-500 italic leading-relaxed line-clamp-2 mt-2 p-2 bg-white/50 rounded-xl border border-white">"{nextFollowUp.remarks}"</div>
              )}
              {nextFollowUp.status === 'Sales completed' && nextFollowUp.salesAmount && (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200/50">
                  <span className="text-xs font-bold text-emerald-700">Sale: {formatCurrency(nextFollowUp.salesAmount)}</span>
                  {nextFollowUp.amountReceived ? (
                    <span className="inline-flex items-center text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                      Received
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                      Pending
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sales Representative</span>
              <span className="text-xs font-black text-slate-700 mt-0.5">{customer.salesPerson.name}</span>
            </div>

            <button
              onClick={() => setShowFollowUps(true)}
              className="flex items-center space-x-2 text-xs font-black text-brand-600 hover:text-brand-700 bg-brand-50 px-4 py-2 rounded-xl transition-all duration-300 active:scale-95"
            >
              <span>View Logs ({customer.followUps.length})</span>
            </button>
          </div>
        </div>
      </div>

      {showEditForm && (
        <CustomerForm
          customer={customer}
          onClose={() => setShowEditForm(false)}
          salesPersons={salesPersons}
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