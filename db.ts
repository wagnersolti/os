
import { Customer, ServiceOrder, Item, OSStatus, CompanyInfo } from './types';

const STORAGE_KEYS = {
  CUSTOMERS: 'os_pro_customers',
  OS: 'os_pro_service_orders',
  ITEMS: 'os_pro_items',
  CONFIG: 'os_pro_config',
  COMPANY: 'os_pro_company'
};

const get = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const set = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const DB = {
  // Company Info
  getCompany: () => get<CompanyInfo>(STORAGE_KEYS.COMPANY, { name: 'OS PRO' }),
  saveCompany: (info: CompanyInfo) => set(STORAGE_KEYS.COMPANY, info),

  // Customers
  getCustomers: () => get<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  saveCustomer: (customer: Customer) => {
    const customers = DB.getCustomers();
    const index = customers.findIndex(c => c.id === customer.id);
    if (index >= 0) customers[index] = customer;
    else customers.push(customer);
    set(STORAGE_KEYS.CUSTOMERS, customers);
  },
  deleteCustomer: (id: string) => {
    const customers = DB.getCustomers().filter(c => c.id !== id);
    set(STORAGE_KEYS.CUSTOMERS, customers);
  },

  // Service Orders
  getOS: () => get<ServiceOrder[]>(STORAGE_KEYS.OS, []),
  saveOS: (os: ServiceOrder) => {
    const allOS = DB.getOS();
    const index = allOS.findIndex(o => o.id === os.id);
    if (index >= 0) allOS[index] = os;
    else {
      os.orderNumber = allOS.length > 0 ? Math.max(...allOS.map(o => o.orderNumber)) + 1 : 1001;
      allOS.push(os);
    }
    set(STORAGE_KEYS.OS, allOS);
    return os;
  },

  // Items (Products/Services)
  getItems: () => get<Item[]>(STORAGE_KEYS.ITEMS, [
    { id: '1', name: 'Mão de Obra Básica', description: 'Serviço padrão', price: 150, type: 'SERVICE' },
    { id: '2', name: 'Limpeza de Sistema', description: 'Limpeza geral', price: 80, type: 'SERVICE' }
  ]),
  saveItem: (item: Item) => {
    const items = DB.getItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) items[index] = item;
    else items.push(item);
    set(STORAGE_KEYS.ITEMS, items);
  }
};
