
import React from 'react';
import { ImageIcon, Upload, Trash2, Database, Briefcase } from 'lucide-react';
import { CompanyInfo, Customer, ServiceOrder, Item } from '../types';
import { DB } from '../db';

interface SettingsProps {
  companyInfo: CompanyInfo;
  onRefresh: () => void;
  customers: Customer[];
  orders: ServiceOrder[];
  items: Item[];
}

const Settings: React.FC<SettingsProps> = ({ companyInfo, onRefresh, customers, orders, items }) => {
  const handleUpdateCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: CompanyInfo = {
      ...companyInfo,
      name: formData.get('companyName') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
    };
    DB.saveCompany(updated);
    onRefresh();
    alert('Informações atualizadas!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        DB.saveCompany({ ...companyInfo, logo: base64 });
        onRefresh();
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Branding */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-black mb-8 flex items-center space-x-3 text-gray-800 uppercase tracking-tight">
          <Briefcase size={24} className="text-blue-600" />
          <span>Perfil da Empresa</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <div className="w-40 h-40 rounded-3xl bg-gray-50 flex items-center justify-center border-4 border-dashed border-gray-200 overflow-hidden transition-all group-hover:border-blue-400">
                {companyInfo.logo ? (
                  <img src={companyInfo.logo} className="w-full h-full object-contain p-4" />
                ) : (
                  <ImageIcon size={48} className="text-gray-300" />
                )}
                <label className="absolute inset-0 bg-blue-600/80 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all p-4 text-center">
                  <Upload size={24} />
                  <span className="text-[10px] font-black mt-2 uppercase">Alterar Logomarca</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase text-center max-w-[150px]">PNG ou JPG recomendado</p>
          </div>

          <form onSubmit={handleUpdateCompany} className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nome Fantasia</label>
              <input name="companyName" defaultValue={companyInfo.name} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">WhatsApp / Fone</label>
              <input name="phone" defaultValue={companyInfo.phone} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">E-mail Comercial</label>
              <input name="email" defaultValue={companyInfo.email} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Endereço Completo</label>
              <input name="address" defaultValue={companyInfo.address} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-3.5 outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-sm" />
            </div>
            <div className="sm:col-span-2 pt-4">
              <button type="submit" className="bg-blue-600 text-white font-black py-4 px-10 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 uppercase text-xs tracking-widest">
                Atualizar Branding
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Backup e Reset */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-black mb-4 text-gray-800 uppercase tracking-tight flex items-center space-x-3">
          <Database size={24} className="text-indigo-600" />
          <span>Gestão de Dados</span>
        </h2>
        <p className="text-gray-500 text-sm mb-8 font-medium">Os dados do sistema são armazenados localmente neste navegador para sua segurança e privacidade.</p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            onClick={() => {
              const data = { customers, orders, items, companyInfo };
              const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `backup_ospro_${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }}
          >
            Exportar Backup JSON
          </button>
          <button 
            className="bg-red-50 hover:bg-red-100 text-red-600 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
            onClick={() => {
              if(confirm("ATENÇÃO: Deseja apagar todos os dados permanentemente?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Apagar Tudo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
