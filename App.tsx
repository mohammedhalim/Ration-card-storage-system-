
import React, { useState, useEffect, useMemo } from 'react';
import { RationCard, AppView } from './types';
import { storage } from './storage';
import { Plus, Search, Trash2, Edit3, ChevronRight, Info, AlertCircle, CheckCircle2, History } from 'lucide-react';
import CardForm from './components/CardForm';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LIST');
  const [cards, setCards] = useState<RationCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCard, setEditingCard] = useState<RationCard | null>(null);

  // Load cards on mount
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

  const filteredCards = useMemo(() => {
    return cards
      .filter(card => card.ownerName.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.lastWithdrawalDate).getTime() - new Date(a.lastWithdrawalDate).getTime());
  }, [cards, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 text-slate-800">
      {/* Header */}
      <header className="bg-emerald-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">بطاقات التموين</h1>
          {view === 'LIST' && (
            <div className="bg-emerald-600 px-3 py-1 rounded-full text-sm font-medium">
              الإجمالي: {cards.length}
            </div>
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
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'LIST' ? (
          <>
            {/* Search Box */}
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

            {/* List */}
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

            {/* Floating Action Button */}
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
