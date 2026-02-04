import React from 'react';
import { Plus, Trash2, UserCheck } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { FollowUpStatus } from '../../types';

interface CustomerFollowUpSectionProps {
    followUps: any[];
    errors: Record<string, string>;
    handleFollowUpChange: (index: number, field: string, value: any) => void;
    addNewFollowUp: () => void;
    removeFollowUp: (index: number) => void;
    disabled?: boolean;
}

export const CustomerFollowUpSection: React.FC<CustomerFollowUpSectionProps> = ({
    followUps,
    errors,
    handleFollowUpChange,
    addNewFollowUp,
    removeFollowUp,
    disabled
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <Label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1">Follow Ups</Label>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5 ml-1 italic">Track customer interactions</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={addNewFollowUp}
                    className="h-9 px-4 border-brand-200 text-brand-600 hover:bg-brand-50 hover:border-brand-300 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                    disabled={disabled}
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Follow Up</span>
                </Button>
            </div>

            <div className="space-y-4">
                {followUps.map((followUp, index) => (
                    <div key={followUp.id} className="bg-slate-50/40 border border-slate-200/50 rounded-3xl p-6 space-y-6 transition-all duration-300 hover:border-slate-300/60 hover:bg-white shadow-sm hover:shadow-md group">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:text-brand-600 group-hover:border-brand-100 transition-colors">
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <span className="text-sm font-black text-slate-800 tracking-tight">Follow Up #{followUps.length - index}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${followUp.amountReceived ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{followUp.amountReceived ? 'Received' : 'Pending'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                                    <Checkbox
                                        id={`received-${index}`}
                                        checked={followUp.amountReceived || false}
                                        onCheckedChange={(checked) => handleFollowUpChange(index, 'amountReceived', !!checked)}
                                        disabled={disabled}
                                        className="w-4 h-4 rounded border-slate-300 data-[state=checked]:bg-brand-600 data-[state=checked]:border-brand-600 transition-all duration-300"
                                    />
                                    <Label htmlFor={`received-${index}`} className="text-[10px] font-black text-slate-500 cursor-pointer uppercase tracking-wider">Amount Received</Label>
                                </div>

                                {followUps.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeFollowUp(index)}
                                        className="h-9 w-9 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300"
                                        disabled={disabled}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</Label>
                                <Input
                                    type="date"
                                    value={followUp.date}
                                    onChange={(e) => handleFollowUpChange(index, 'date', e.target.value)}
                                    className="h-11 bg-white border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-brand-500/20"
                                    disabled={disabled}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</Label>
                                <Select
                                    value={followUp.status}
                                    onValueChange={(value) => handleFollowUpChange(index, 'status', value as FollowUpStatus)}
                                    disabled={disabled}
                                >
                                    <SelectTrigger className="h-11 bg-white border-slate-200/60 rounded-2xl text-sm font-medium focus:ring-brand-500/20">
                                        <SelectValue placeholder="Set Status" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-slate-200 shadow-xl overflow-hidden">
                                        <SelectItem value="Not yet contacted" className="py-2.5 focus:bg-brand-50">Not yet contacted</SelectItem>
                                        <SelectItem value="Scheduled next follow-up" className="py-2.5 focus:bg-brand-50">Scheduled next follow-up</SelectItem>
                                        <SelectItem value="Sales completed" className="py-2.5 focus:bg-brand-50">Sales completed</SelectItem>
                                        <SelectItem value="Sales rejected" className="py-2.5 focus:bg-brand-50">Sales rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {followUp.status === 'Sales completed' && (
                            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Amount (₹)</Label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-sm font-black text-brand-600 italic">₹</span>
                                    </div>
                                    <Input
                                        type="number"
                                        value={followUp.salesAmount || ''}
                                        onChange={(e) => handleFollowUpChange(index, 'salesAmount', e.target.value)}
                                        className={`h-11 pl-9 bg-white border-slate-200/60 rounded-2xl text-sm font-black text-slate-800 focus:ring-brand-500/20 ${errors[`followUp_${index}_salesAmount`] ? 'border-red-500 bg-red-50/20' : ''}`}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        disabled={disabled}
                                    />
                                </div>
                                {errors[`followUp_${index}_salesAmount`] && (
                                    <p className="text-red-500 text-[10px] font-black uppercase tracking-wider ml-1 mt-1.5">{errors[`followUp_${index}_salesAmount`]}</p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks</Label>
                            <Textarea
                                value={followUp.remarks}
                                onChange={(e) => handleFollowUpChange(index, 'remarks', e.target.value)}
                                rows={2}
                                className="bg-white border-slate-200/60 rounded-2xl text-sm font-medium resize-none placeholder:text-slate-300 focus:ring-brand-500/20 p-4"
                                placeholder="Add highlights from the interaction..."
                                disabled={disabled}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
