
import React, { useState } from 'react';
import { Package, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import { Item } from '../types';
import { DB } from '../db';

interface ItemListProps {
  items: Item[];
  onRefresh: () => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome do produto ou serviço..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2">
          <Plus size={20} />
          <span className="font-bold">Novo Item</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
            <tr>
              <th className="px-6 py-4">Nome</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Preço Base</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${item.type === 'SERVICE' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                      <Package size={18} />
                    </div>
                    <span className="font-bold text-gray-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                    item.type === 'SERVICE' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {item.type === 'SERVICE' ? 'Serviço' : 'Produto'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm italic truncate max-w-[200px]">
                  {item.description}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  R$ {item.price.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit3 size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemList;
