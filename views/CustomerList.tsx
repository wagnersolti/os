
import React, { useState } from 'react';
import { Search, UserPlus, Phone, Mail, MapPin, MoreHorizontal, Edit, Trash, X as XIcon } from 'lucide-react';
import { Customer } from '../types';
import { DB } from '../db';

interface CustomerListProps {
  customers: Customer[];
  onRefresh: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({ customers, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.document.includes(searchTerm) ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const customer: Customer = {
      id: editingCustomer?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      document: formData.get('document') as string,
    };
    DB.saveCustomer(customer);
    onRefresh();
    setShowModal(false);
    setEditingCustomer(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Deseja realmente excluir este cliente?')) {
      DB.deleteCustomer(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nome, ID ou documento..." 
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl shadow-lg shadow-blue-100 transition-all"
        >
          <UserPlus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl uppercase">
                {customer.name.charAt(0)}
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => { setEditingCustomer(customer); setShowModal(true); }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(customer.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{customer.name}</h3>
            <p className="text-[10px] text-gray-400 mb-1">ID: {customer.id}</p>
            <p className="text-xs text-gray-500 mb-4">{customer.document}</p>
            
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Phone size={16} className="mr-3 text-gray-400" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail size={16} className="mr-3 text-gray-400" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-3 text-gray-400" />
                <span className="truncate">{customer.address}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 italic">
            Nenhum cliente encontrado para sua busca.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-lg font-bold">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => { setShowModal(false); setEditingCustomer(null); }}><XIcon size={24}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nome Completo</label>
                <input required name="name" defaultValue={editingCustomer?.name} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CPF/CNPJ</label>
                  <input required name="document" defaultValue={editingCustomer?.document} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefone</label>
                  <input required name="phone" defaultValue={editingCustomer?.phone} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">E-mail</label>
                <input required type="email" name="email" defaultValue={editingCustomer?.email} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Endereço</label>
                <input name="address" defaultValue={editingCustomer?.address} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerList;
