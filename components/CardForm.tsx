
import React, { useState } from 'react';
import { RationCard } from '../types.ts';
import { MAX_LOAVES_PER_PERSON } from '../constants.ts';
import { CheckCircle } from 'lucide-react';

interface Props {
  initialData: RationCard | null;
  onSave: (card: RationCard) => void;
}

const CardForm: React.FC<Props> = ({ initialData, onSave }) => {
  const [formData, setFormData] = useState<Omit<RationCard, 'id' | 'createdAt'>>({
    ownerName: initialData?.ownerName || '',
    membersCount: initialData?.membersCount || 1,
    withdrawnLoaves: initialData?.withdrawnLoaves || 0,
    lastWithdrawalDate: initialData?.lastWithdrawalDate || new Date().toISOString().slice(0, 16),
    isPaid: initialData?.isPaid ?? false,
    paidAmount: initialData?.paidAmount || 0,
    notes: initialData?.notes || '',
  });

  const maxPossible = formData.membersCount * MAX_LOAVES_PER_PERSON;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: RationCard = {
      ...formData,
      id: initialData?.id || Date.now().toString(),
      createdAt: initialData?.createdAt || new Date().toISOString(),
      lastWithdrawalDate: new Date().toISOString() 
    };
    onSave(newCard);
  };

  const handleNumberChange = (field: string, val: string) => {
    const num = parseInt(val) || 0;
    setFormData(prev => ({ ...prev, [field]: num }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-bold text-slate-800 mb-2 border-r-4 border-emerald-500 pr-3">
        {initialData ? 'تعديل بيانات البطاقة' : 'إضافة بطاقة جديدة'}
      </h2>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-500 block">اسم صاحب البطاقة</label>
        <input
          required
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-all"
          placeholder="أدخل الاسم بالكامل"
          value={formData.ownerName}
          onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-500 block">عدد الأفراد</label>
          <input
            required
            type="number"
            min="1"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            value={formData.membersCount}
            onChange={(e) => handleNumberChange('membersCount', e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-500 block">العيش المسحوب</label>
          <input
            required
            type="number"
            min="0"
            max={maxPossible}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            value={formData.withdrawnLoaves}
            onChange={(e) => handleNumberChange('withdrawnLoaves', e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-xl flex items-start gap-3 text-blue-800 text-sm">
        <div className="mt-0.5"><CheckCircle size={16} /></div>
        <div>
          <p className="font-bold">حساب تلقائي:</p>
          <p>أقصى سحب مسموح: {maxPossible} رغيف ({formData.membersCount} أفراد × 15 رغيف لكل فرد).</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-500 block">تاريخ السحب</label>
        <input
          type="datetime-local"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
          value={formData.lastWithdrawalDate.slice(0, 16)}
          onChange={(e) => setFormData(prev => ({ ...prev, lastWithdrawalDate: e.target.value }))}
        />
      </div>

      <div className="space-y-3 pt-2">
        <p className="text-sm font-medium text-slate-500">حالة الدفع</p>
        <div className="flex gap-4">
          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${formData.isPaid ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'border-slate-200'}`}>
            <input 
              type="radio" 
              className="hidden" 
              checked={formData.isPaid} 
              onChange={() => setFormData(prev => ({ ...prev, isPaid: true }))} 
            />
            نعم
          </label>
          <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${!formData.isPaid ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'border-slate-200'}`}>
            <input 
              type="radio" 
              className="hidden" 
              checked={!formData.isPaid} 
              onChange={() => setFormData(prev => ({ ...prev, isPaid: false }))} 
            />
            لا
          </label>
        </div>
      </div>

      {formData.isPaid && (
        <div className="space-y-1 animate-in zoom-in-95 duration-200">
          <label className="text-sm font-medium text-slate-500 block">المبلغ المدفوع (جنيه)</label>
          <input
            type="number"
            step="0.5"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
            placeholder="0.00"
            value={formData.paidAmount}
            onChange={(e) => handleNumberChange('paidAmount', e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-500 block">ملاحظات</label>
        <textarea
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white transition-all resize-none"
          placeholder="أي تفاصيل إضافية..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
      >
        حفظ البيانات
      </button>
    </form>
  );
};

export default CardForm;
