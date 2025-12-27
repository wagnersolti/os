
import React, { useState, useMemo } from 'react';
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Sparkles,
  Loader2,
  MessageSquareText,
  Copy,
  BrainCircuit,
  ClipboardList
} from 'lucide-react';
import { Customer, Item, OSItem, OSStatus, ServiceOrder } from '../types';
import { aiAssistant } from '../services/gemini';

interface OSFormProps {
  initialData?: ServiceOrder;
  customers: Customer[];
  items: Item[];
  onSave: (os: ServiceOrder) => void;
  onCancel: () => void;
}

const OSForm: React.FC<OSFormProps> = ({ initialData, customers, items, onSave, onCancel }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialData?.customerId || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [status, setStatus] = useState<OSStatus>(initialData?.status || OSStatus.OPEN);
  const [selectedItems, setSelectedItems] = useState<OSItem[]>(initialData?.items || []);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [aiSummary, setAiSummary] = useState('');

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [selectedItems]);

  const handleAddItem = (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const existing = selectedItems.find(i => i.itemId === itemId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice } : i
      ));
    } else {
      setSelectedItems([...selectedItems, {
        itemId: item.id,
        name: item.name,
        quantity: 1,
        unitPrice: item.price,
        total: item.price
      }]);
    }
  };

  const handleUpdateQty = (itemId: string, qty: number) => {
    if (qty < 1) return;
    setSelectedItems(selectedItems.map(i => 
      i.itemId === itemId ? { ...i, quantity: qty, total: qty * i.unitPrice } : i
    ));
  };

  const handleAISuggestion = async () => {
    if (!description) return;
    setIsGeneratingAI(true);
    setAiInsight('');
    const suggestion = await aiAssistant.suggestTechnicalFix(description);
    setAiInsight(suggestion);
    setIsGeneratingAI(false);
  };

  const handleGenerateSummary = async () => {
    if (!description || selectedItems.length === 0) {
      alert('Preencha a descrição e adicione itens primeiro.');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    const tempOS: ServiceOrder = {
      id: initialData?.id || 'temp',
      orderNumber: initialData?.orderNumber || 0,
      customerId: selectedCustomerId,
      customerName: customer?.name || 'Cliente',
      description,
      status,
      items: selectedItems,
      totalAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setIsGeneratingSummary(true);
    setAiSummary('');
    const summary = await aiAssistant.summarizeOS(tempOS);
    setAiSummary(summary || '');
    setIsGeneratingSummary(false);
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl shadow-blue-50 overflow-hidden">
        <div className="bg-blue-600 px-6 py-8 flex items-center justify-between text-white">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              {/* Using the newly imported ClipboardList icon */}
              <ClipboardList size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black">{initialData ? `Editando OS #${initialData.orderNumber}` : 'Nova Ordem de Serviço'}</h2>
              <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-0.5">Gestão Técnica & Financeira</p>
            </div>
          </div>
          <button onClick={onCancel} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Cliente e Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Cliente Principal</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                  >
                    <option value="">Selecionar Cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Estado do Serviço</label>
                  <select 
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold text-sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OSStatus)}
                  >
                    {Object.values(OSStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Descrição e AI */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Descrição Detalhada</label>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handleAISuggestion}
                      disabled={isGeneratingAI || !description}
                      className="flex items-center space-x-1.5 text-blue-600 text-xs font-black hover:bg-blue-50 px-3 py-1.5 rounded-lg disabled:opacity-30 transition-all"
                    >
                      <Sparkles size={14} />
                      <span>Sugestão Técnica</span>
                    </button>
                    <button 
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary || !description || selectedItems.length === 0}
                      className="flex items-center space-x-1.5 text-indigo-600 text-xs font-black hover:bg-indigo-50 px-3 py-1.5 rounded-lg disabled:opacity-30 transition-all"
                    >
                      <MessageSquareText size={14} />
                      <span>Resumo AI</span>
                    </button>
                  </div>
                </div>
                <textarea 
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-sm font-medium"
                  placeholder="Quais são os problemas relatados?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>

                {/* Resultados AI */}
                {isGeneratingAI && <div className="flex items-center space-x-2 text-blue-500 text-xs mt-2 animate-pulse font-bold"><Loader2 className="animate-spin" size={14}/><span>Gemini diagnosticando...</span></div>}
                {aiInsight && (
                  <div className="mt-4 p-5 bg-blue-50 border border-blue-100 rounded-2xl flex items-start space-x-3">
                    <BrainCircuit className="text-blue-600 mt-1" size={20} />
                    <p className="text-xs text-blue-800 leading-relaxed font-semibold italic">{aiInsight}</p>
                  </div>
                )}

                {isGeneratingSummary && <div className="flex items-center space-x-2 text-indigo-500 text-xs mt-4 animate-pulse font-bold"><Loader2 className="animate-spin" size={14}/><span>Compilando resumo para cliente...</span></div>}
                {aiSummary && (
                  <div className="mt-4 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Resumo Automático para o Cliente</span>
                      <button onClick={() => {navigator.clipboard.writeText(aiSummary); alert('Copiado!')}} className="text-indigo-600 p-1.5 hover:bg-indigo-100 rounded-lg"><Copy size={16}/></button>
                    </div>
                    <div className="bg-white/70 p-4 rounded-xl text-sm text-indigo-900 leading-relaxed italic border border-indigo-50 shadow-sm">
                      {aiSummary}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Itens e Financeiro */}
            <div className="bg-gray-50 rounded-3xl p-6 border border-dashed border-gray-300 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-gray-700 uppercase tracking-tight text-sm">Itens e Peças</h3>
                <select 
                  className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  onChange={(e) => { if(e.target.value) handleAddItem(e.target.value); e.target.value = ''; }}
                >
                  <option value="">+ Adicionar Item</option>
                  {items.map(item => <option key={item.id} value={item.id}>{item.name} - R$ {item.price}</option>)}
                </select>
              </div>

              <div className="flex-1 space-y-3 min-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedItems.map(item => (
                  <div key={item.itemId} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-gray-800">{item.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">R$ {item.unitPrice.toFixed(2)}/un</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-gray-100 rounded-xl px-1">
                        <button onClick={() => handleUpdateQty(item.itemId, item.quantity - 1)} className="p-1.5 hover:text-blue-600 transition-colors">-</button>
                        <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                        <button onClick={() => handleUpdateQty(item.itemId, item.quantity + 1)} className="p-1.5 hover:text-blue-600 transition-colors">+</button>
                      </div>
                      <p className="text-sm font-black text-gray-800 w-24 text-right">R$ {item.total.toFixed(2)}</p>
                      <button onClick={() => setSelectedItems(selectedItems.filter(i => i.itemId !== item.itemId))} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={18}/></button>
                    </div>
                  </div>
                ))}
                {selectedItems.length === 0 && <div className="h-full flex flex-col items-center justify-center text-gray-400 italic text-sm">Nenhum item adicionado</div>}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center text-gray-800">
                  <span className="font-bold text-sm uppercase tracking-widest text-gray-400">Total Geral</span>
                  <span className="text-3xl font-black text-blue-600">R$ {totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-100">
            <button onClick={onCancel} className="px-6 py-3 text-gray-400 font-black uppercase text-xs tracking-widest hover:text-gray-600 transition-colors">Cancelar</button>
            <button 
              onClick={() => {
                if(!selectedCustomerId || selectedItems.length === 0) return alert('Cliente e Itens são obrigatórios.');
                onSave({
                  id: initialData?.id || crypto.randomUUID(),
                  orderNumber: initialData?.orderNumber || 0,
                  customerId: selectedCustomerId,
                  customerName: customers.find(c => c.id === selectedCustomerId)?.name || '',
                  status,
                  items: selectedItems,
                  description,
                  totalAmount,
                  createdAt: initialData?.createdAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                });
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black flex items-center space-x-3 shadow-xl shadow-blue-100 transition-all transform active:scale-95"
            >
              <Save size={20} />
              <span>Gravar Ordem de Serviço</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSForm;
