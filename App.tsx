
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Package, 
  Settings as SettingsIcon, 
  Plus, 
  Menu,
  X,
  Home
} from 'lucide-react';
import { DB } from './db';
import { Customer, ServiceOrder, OSStatus, Item, CompanyInfo } from './types';
import Dashboard from './views/Dashboard';
import CustomerList from './views/CustomerList';
import OSList from './views/OSList';
import OSForm from './views/OSForm';
import ItemList from './views/ItemList';
import Settings from './views/Settings';

type View = 'dashboard' | 'customers' | 'os_list' | 'os_new' | 'os_edit' | 'items' | 'settings';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingOS, setEditingOS] = useState<ServiceOrder | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({ name: 'OS PRO' });

  const loadData = () => {
    setCustomers(DB.getCustomers());
    setItems(DB.getItems());
    setOrders(DB.getOS());
    setCompanyInfo(DB.getCompany());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditOS = (os: ServiceOrder) => {
    setEditingOS(os);
    setCurrentView('os_edit');
  };

  const handleSaveOS = (os: ServiceOrder) => {
    DB.saveOS(os);
    loadData();
    setCurrentView('os_list');
    setEditingOS(null);
  };

  const NavigationItem = ({ id, icon: Icon, label }: { id: View; icon: any; label: string }) => (
    <button
      onClick={() => {
        setCurrentView(id);
        setIsMobileMenuOpen(false);
        if (id !== 'os_edit') setEditingOS(null);
      }}
      className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all ${
        currentView === id || (id === 'os_list' && currentView === 'os_edit')
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      <Icon size={20} />
      <span className="font-semibold text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:block
      `}>
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2 text-blue-600 font-black text-2xl">
              <ClipboardList size={32} />
              <span className="truncate">{companyInfo.name}</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400">
              <X size={24} />
            </button>
          </div>
          
          <nav className="flex-1 space-y-1">
            <NavigationItem id="dashboard" icon={LayoutDashboard} label="Painel Geral" />
            <NavigationItem id="os_list" icon={ClipboardList} label="Ordens de Serviço" />
            <NavigationItem id="customers" icon={Users} label="Gestão de Clientes" />
            <NavigationItem id="items" icon={Package} label="Produtos e Serviços" />
            <NavigationItem id="settings" icon={SettingsIcon} label="Configurações" />
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-2xl flex items-center space-x-3">
              {companyInfo.logo ? (
                <img src={companyInfo.logo} className="w-10 h-10 rounded-full object-cover border-2 border-white" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {companyInfo.name.charAt(0)}
                </div>
              )}
              <div className="truncate">
                <p className="text-sm font-bold text-gray-800 truncate">{companyInfo.name}</p>
                <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">Premium Plan</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-xl font-black text-gray-800 tracking-tight capitalize">
                {currentView.replace('_', ' ')}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setCurrentView('os_new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all shadow-md shadow-blue-100"
              >
                <Plus size={18} />
                <span className="hidden sm:inline font-bold text-sm">Nova OS</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8">
          {currentView === 'dashboard' && <Dashboard orders={orders} onEdit={handleEditOS} />}
          {currentView === 'customers' && <CustomerList customers={customers} onRefresh={loadData} />}
          {currentView === 'os_list' && <OSList orders={orders} onEdit={handleEditOS} onRefresh={loadData} />}
          {currentView === 'os_new' && <OSForm onSave={handleSaveOS} onCancel={() => setCurrentView('os_list')} customers={customers} items={items} />}
          {currentView === 'os_edit' && <OSForm initialData={editingOS!} onSave={handleSaveOS} onCancel={() => setCurrentView('os_list')} customers={customers} items={items} />}
          {currentView === 'items' && <ItemList items={items} onRefresh={loadData} />}
          {currentView === 'settings' && <Settings companyInfo={companyInfo} onRefresh={loadData} customers={customers} orders={orders} items={items} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between md:hidden z-40">
        <button onClick={() => setCurrentView('dashboard')} className={`p-2 ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Home size={24} />
        </button>
        <button onClick={() => setCurrentView('os_list')} className={`p-2 ${currentView === 'os_list' ? 'text-blue-600' : 'text-gray-400'}`}>
          <ClipboardList size={24} />
        </button>
        <button onClick={() => setCurrentView('os_new')} className="bg-blue-600 text-white p-3 rounded-full -mt-10 shadow-lg shadow-blue-200 border-4 border-gray-50">
          <Plus size={24} />
        </button>
        <button onClick={() => setCurrentView('customers')} className={`p-2 ${currentView === 'customers' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Users size={24} />
        </button>
        <button onClick={() => setCurrentView('settings')} className={`p-2 ${currentView === 'settings' ? 'text-blue-600' : 'text-gray-400'}`}>
          <SettingsIcon size={24} />
        </button>
      </nav>
    </div>
  );
};

export default App;
