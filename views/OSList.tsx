
import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Edit2, Trash2, Eye, FileText, Share2, MessageCircle } from 'lucide-react';
import { ServiceOrder, OSStatus } from '../types';
import { DB } from '../db';
import { pdfService } from '../services/pdf';

interface OSListProps {
  orders: ServiceOrder[];
  onEdit: (os: ServiceOrder) => void;
  onRefresh: () => void;
}

const OSList: React.FC<OSListProps> = ({ orders, onEdit, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredOrders = orders.filter(os => {
    const matchesSearch = os.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          os.orderNumber.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || os.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleWhatsAppShare = (os: ServiceOrder) => {
    const company = DB.getCompany();
    const itemsList = os.items.map(i => `- ${i.name} (x${i.quantity}): R$ ${i.total.toFixed(2)}`).join('%0A');
    const message = `*ORDEM DE SERVIÇO #${os.orderNumber}*%0A%0A` +
                    `*Empresa:* ${company.name}%0A` +
                    `*Cliente:* ${os.customerName}%0A` +
                    `*Status:* ${os.status}%0A` +
                    `*Serviços/Peças:*%0A${itemsList}%0A%0A` +
                    `*TOTAL:* R$ ${os.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%0A%0A` +
                    `_Enviado via ${company.name}_`;
    
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const handleDownloadPDF = (os: ServiceOrder) => {
    const company = DB.getCompany();
    pdfService.generateOS(os, company);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente ou número da OS..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-white border border-gray-200 rounded-xl px-3 py-1">
            <Filter size={18} className="text-gray-400" />
            <select 
              className="bg-transparent py-2 outline-none text-sm font-medium text-gray-700"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Todos os Status</option>
              {Object.values(OSStatus).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400">
            <tr>
              <th className="px-6 py-4">Nº OS</th>
              <th className="px-6 py-4">Cliente</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Data Criada</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredOrders.length > 0 ? filteredOrders.map((os) => (
              <tr key={os.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4 font-bold text-blue-600">#{os.orderNumber}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-800">{os.customerName}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase inline-flex items-center ${
                    os.status === OSStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                    os.status === OSStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                    os.status === OSStatus.CANCELLED ? 'bg-gray-100 text-gray-500' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {os.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(os.createdAt).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  R$ {os.totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-1 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(os)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(os)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Gerar PDF"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => handleWhatsAppShare(os)}
                      className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Compartilhar WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  Nenhuma ordem de serviço encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OSList;
