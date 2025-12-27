
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  ClipboardList, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  BrainCircuit,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ServiceOrder, OSStatus } from '../types';

interface DashboardProps {
  orders: ServiceOrder[];
  onEdit: (os: ServiceOrder) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, onEdit }) => {
  const stats = useMemo(() => {
    const totalRevenue = orders
      .filter(o => o.status === OSStatus.COMPLETED)
      .reduce((acc, curr) => acc + curr.totalAmount, 0);
    
    const pending = orders.filter(o => o.status === OSStatus.OPEN || o.status === OSStatus.IN_PROGRESS).length;
    const completed = orders.filter(o => o.status === OSStatus.COMPLETED).length;

    // Detectar ordens críticas (Aguardando Peças há mais de 3 dias)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const criticalDelayed = orders.filter(o => 
      o.status === OSStatus.PENDING_PARTS && 
      new Date(o.updatedAt || o.createdAt) < threeDaysAgo
    );

    // Dados simulados para o gráfico
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const monthlyData = months.map(m => ({
      name: m,
      value: Math.floor(Math.random() * 5000) + 1000
    }));

    return { totalRevenue, pending, completed, monthlyData, criticalDelayed };
  }, [orders]);

  const recentOrders = orders.slice(-5).reverse();

  const StatCard = ({ icon: Icon, label, value, color, secondaryLabel }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon size={24} />
        </div>
        <div className="text-green-500 flex items-center text-sm font-black">
          <ArrowUpRight size={16} className="mr-1" />
          +12%
        </div>
      </div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{label}</p>
      <h3 className="text-2xl font-black text-gray-800 mt-1">{value}</h3>
      {secondaryLabel && <p className="text-[10px] text-gray-400 mt-2 font-medium">{secondaryLabel}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Alerta de Atraso Crítico */}
      {stats.criticalDelayed.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-4 md:p-6 rounded-2xl shadow-sm animate-pulse-slow">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg shadow-red-100">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="text-red-800 font-black text-lg">Atenção: Atraso em Peças</h4>
                <p className="text-red-600 text-sm">
                  {stats.criticalDelayed.length} {stats.criticalDelayed.length === 1 ? 'ordem' : 'ordens'} travadas há mais de 3 dias.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.criticalDelayed.map(os => (
                <button 
                  key={os.id}
                  onClick={() => onEdit(os)}
                  className="bg-white hover:bg-red-50 text-red-700 text-xs font-bold px-4 py-2 rounded-lg border border-red-100 transition-all flex items-center space-x-2"
                >
                  <span>#{os.orderNumber}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          icon={TrendingUp} 
          label="Receita Bruta" 
          value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} 
          color="bg-emerald-500"
          secondaryLabel="Faturamento real confirmado"
        />
        <StatCard 
          icon={ClipboardList} 
          label="Volume Total" 
          value={orders.length} 
          color="bg-blue-600"
          secondaryLabel="Ordens cadastradas"
        />
        <StatCard 
          icon={Clock} 
          label="Em Aberto" 
          value={stats.pending} 
          color="bg-amber-500"
          secondaryLabel="Aguardando execução"
        />
        <StatCard 
          icon={CheckCircle} 
          label="Finalizadas" 
          value={stats.completed} 
          color="bg-indigo-600"
          secondaryLabel="Serviços entregues"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Desempenho */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-gray-800 tracking-tight">Evolução Mensal</h3>
            <select className="bg-gray-50 border-none text-xs font-bold text-gray-400 rounded-lg px-3 py-2 outline-none">
              <option>Últimos 6 meses</option>
            </select>
          </div>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.monthlyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === stats.monthlyData.length - 1 ? '#2563EB' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Insight Inteligente */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-2xl text-white shadow-xl flex flex-col justify-between">
          <div>
            <div className="bg-white/20 backdrop-blur-md w-fit p-3 rounded-xl mb-6">
              <BrainCircuit size={28} />
            </div>
            <h3 className="text-xl font-black mb-3">Assistente de Negócios</h3>
            <p className="text-blue-50 text-sm leading-relaxed font-medium opacity-90">
              Notamos uma tendência de crescimento em reparos preventivos. Sugerimos focar em campanhas para "Limpeza de Sistema" para aumentar o ticket médio semanal.
            </p>
          </div>
          <button className="bg-white text-blue-700 font-black py-4 rounded-xl mt-8 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2 text-sm">
            <span>Relatório Completo AI</span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
