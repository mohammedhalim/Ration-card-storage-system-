
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RationCard, AppView } from './types.ts';
import { storage } from './storage.ts';
import { Plus, Search, Trash2, Edit3, Info, History, Download, Upload, BarChart3, X } from 'lucide-react';
import CardForm from './components/CardForm.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LIST');
  const [cards, setCards] = useState<RationCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCard, setEditingCard] = useState<RationCard | null>(null);
  const [showStats, setShowStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCards(storage.getCards());
  }, []);

  const handleSave = (card: RationCard) => {
    storage.saveCard(card);
    setCards(storage.getCards());
    setView('LIST');
    setEditingCard(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه البطاقة؟')) {
      storage.deleteCard(id);
      setCards(storage.getCards());
    }
  };

  const handleEdit = (card: RationCard) => {
    setEditingCard(card);
    setView('EDIT');
  };

  const exportData = () => {
    const dataStr = JSON.stringify(cards, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `back_tamween_${new Date().toISOString().slice(0, 10)}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCards = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedCards)) {
          if (confirm('سيتم استبدال جميع البيانات الحالية بالبيانات المستوردة. هل أنت متأكد؟')) {
            localStorage.setItem('ration_cards_db', JSON.stringify(importedCards));
            setCards(importedCards);
            alert('تم استيراد البيانات بنجاح!');
          }
        }
      } catch (err) {
        alert('فشل استيراد الملف. تأكد من أنه ملف JSON صحيح.');
      }
    };
    reader.readAsText(file);
  };

  const stats = useMemo(() => {
    return cards.reduce((acc, card) => ({
      totalMembers: acc.totalMembers + card.membersCount,
      totalLoaves: acc.totalLoaves + card.withdrawnLoaves,
      unpaidAmount: acc.unpaidAmount + (card.isPaid ? 0 : 1), // Count unpaid cards
      totalDebt: acc.totalDebt + (card.isPaid ? 0 : (card.withdrawnLoaves * 0.20)) // Example calc: 0.20 per loaf debt
    }), { totalMembers: 0, totalLoaves: 0, unpaidAmount: 0, totalDebt: 0 });
  }, [cards]);

  const filteredCards = useMemo(() => {
    return cards
      .filter(card => card.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.lastWithdrawalDate).getTime() - new Date(a.lastWithdrawalDate).getTime());
  }, [cards, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800">
      <header className="bg-emerald-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">بطاقات التموين</h1>
          </div>
          
          <div className="flex gap-2">
            {view === 'LIST' && (
              <button onClick={() => setShowStats(!showStats)} className="p-2 hover:bg-emerald-600 rounded-lg transition-colors">
                <BarChart3 size={20} />
              </button>
            )}
            {view !== 'LIST' && (
              <button 
                onClick={() => { setView('LIST'); setEditingCard(null); }}
                className="text-white flex items-center gap-1 text-sm bg-emerald-800 px-3 py-1 rounded-lg"
              >
                إلغاء
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'LIST' ? (
          <>
            {/* Stats Overview */}
            {showStats && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 mb-6 grid grid-cols-2 gap-3 animate-in fade-in zoom-in-95">
                <div className="bg-emerald-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-emerald-600">إجمالي الأفراد</p>
                  <p className="text-xl font-bold text-emerald-800">{stats.totalMembers}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-blue-600">إجمالي العيش</p>
                  <p className="text-xl font-bold text-blue-800">{stats.totalLoaves}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-amber-600">غير مدفوع</p>
                  <p className="text-xl font-bold text-amber-800">{stats.unpaidAmount}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center">
                  <p className="text-xs text-slate-500">إدارة البيانات</p>
                  <div className="flex justify-center gap-2 mt-1">
                    <button onClick={exportData} title="نسخ احتياطي"><Download size={18} className="text-emerald-600" /></button>
                    <button onClick={() => fileInputRef.current?.click()} title="استيراد"><Upload size={18} className="text-blue-600" /></button>
                    <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                  </div>
                </div>
              </div>
            )}

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="ابحث عن اسم صاحب البطاقة..."
                className="w-full pr-12 pl-4 py-3 rounded-xl border border-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
            </div>

            {filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
                <Info size={48} strokeWidth={1.5} />
                <p>{searchQuery ? 'لا توجد نتائج للبحث' : 'لم يتم تسجيل أي بطاقات بعد'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCards.map((card) => (
                  <div key={card.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 transition-active hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-slate-800">{card.ownerName}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <History size={14} />
                          {new Date(card.lastWithdrawalDate).toLocaleString('ar-EG')}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-bold ${card.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {card.isPaid ? 'مدفوع' : 'غير مدفوع'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 mb-3">
                      <div>
                        <p className="text-xs text-slate-400">عدد الأفراد</p>
                        <p className="font-medium text-emerald-700">{card.membersCount} أفراد</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">العيش المسحوب</p>
                        <p className="font-medium text-emerald-700">{card.withdrawnLoaves} رغيف</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(card.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleEdit(card)}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setView('ADD')}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-200 flex items-center justify-center hover:bg-emerald-700 active:scale-95 transition-all z-20"
            >
              <Plus size={32} />
            </button>
          </>
        ) : (
          <CardForm 
            initialData={editingCard} 
            onSave={handleSave} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
