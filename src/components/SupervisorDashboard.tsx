import React, { useState, useMemo, useEffect } from 'react';
import { Rocket, Target, DollarSign, Zap, TrendingUp, LogOut, User, Cpu, Activity, Swords, Search, Crown, Trophy, LayoutDashboard, Eye, ShieldCheck, Database, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// --- COMPONENTES AUXILIARES SUPREMOS ---

// Gráfico de Fundo (Mais sutil e elegante)
const SupremeChartBg = () => (
  <div className="absolute bottom-0 left-0 right-0 h-24 opacity-10 pointer-events-none overflow-hidden rounded-b-3xl">
    <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
      <path d="M0,40 Q25,35 50,20 T100,10 V40 H0 Z" fill="url(#grad-supreme)" />
      <defs>
        <linearGradient id="grad-supreme" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#ffd700', stopOpacity: 0.5 }} />
          <stop offset="100%" style={{ stopColor: '#4b0082', stopOpacity: 0 }} />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

// Card KPI Supremo
const SupremeKpi = ({ title, value, subtext, icon: Icon, delay }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="relative group overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5 hover:border-yellow-500/30 transition-all duration-500"
    >
        <div className="absolute inset-0 bg-[#0a0510] rounded-3xl m-[1px]"></div>
        <SupremeChartBg />
        
        <div className="relative z-10 p-6">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[#1a1030] to-[#0a0510] border border-white/5 shadow-[inset_0_0_15px_rgba(0,0,0,1)] group-hover:border-yellow-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-mono text-purple-300 uppercase tracking-widest bg-purple-900/20 px-2 py-1 rounded border border-purple-500/20">Live Data</span>
                </div>
            </div>
            <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-1">{title}</h3>
            <div className="text-3xl md:text-4xl font-black text-white font-sans tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 group-hover:to-yellow-200 transition-all">{value}</div>
            {subtext && <p className="text-xs text-gray-500 font-mono mt-2 flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-green-500"></div> {subtext}</p>}
        </div>
    </motion.div>
);

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  
  // DADOS REAIS
  const [sales, setSales] = useState<any[]>([]); // Minhas vendas
  const [userProfile, setUserProfile] = useState<any>(null); // Meu perfil
  const [teamAgents, setTeamAgents] = useState<any[]>([]); // Todos os agentes (ranking)
  const [loading, setLoading] = useState(true);

  // INPUT DE VENDA (Igual ao Operador, mas visualmente atualizado)
  const [formData, setFormData] = useState({ client: '', agreement: '', product: 'Empréstimo', value: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // 1. CARREGAMENTO INICIAL
  useEffect(() => {
    const initSystem = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        // Carrega vendas pessoais
        const { data: mySales } = await supabase.from('sales').select('*').eq('user_id', user.id);
        if (mySales) setSales(mySales);

        // Carrega perfil
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        // Carrega Time
        fetchTeamData();
        setLoading(false);
    };
    initSystem();

    // Realtime Updates
    const sub = supabase.channel('supervisor-room')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchTeamData)
        .subscribe();

    return () => { supabase.removeChannel(sub); }
  }, [navigate]);

  const fetchTeamData = async () => {
      const { data } = await supabase.from('profiles').select('*').order('sales_total', { ascending: false });
      if (data) setTeamAgents(data);
  }

  // Lógica de Metas Pessoais
  const totalMySales = useMemo(() => sales.reduce((acc, curr) => acc + Number(curr.value), 0), [sales]);
  const myCommission = totalMySales * (totalMySales > 100000 ? 0.015 : 0.01);
  
  // Lógica da Equipe
  const totalTeamSales = useMemo(() => teamAgents.reduce((acc, curr) => acc + (curr.sales_total || 0), 0), [teamAgents]);
  
  // Filtragem e Ranking
  const filteredAgents = teamAgents.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const topAgent = teamAgents.length > 0 && teamAgents[0].sales_total > 0 ? teamAgents[0] : null;
  const runnerUp = teamAgents.length > 1 && teamAgents[1].sales_total > 0 ? teamAgents[1] : null;
  const hasActiveDuel = topAgent && runnerUp; // Só exibe duelo se houver pelo menos 2 pessoas com vendas

  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // AÇÃO: LANÇAR VENDA (SUPERVISOR TAMBÉM VENDE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value || !userProfile) return;
    const val = Number(formData.value);

    const { data, error } = await supabase.from('sales').insert([{
        user_id: userProfile.id,
        client_name: formData.client,
        agreement: formData.agreement,
        product: formData.product,
        value: val
    }]).select();

    if (!error && data) {
        setSales([data[0], ...sales]);
        setFormData({ ...formData, client: '', value: '' });
        // Atualiza meu total na tabela pública para o ranking
        await supabase.from('profiles').update({ sales_total: totalMySales + val }).eq('id', userProfile.id);
        fetchTeamData();
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden bg-[#020005]">
      {/* Background Supremo */}
      <div className="fixed inset-0 bg-[size:400%_400%] animate-nebula-flow bg-gradient-to-br from-[#0f0014] via-[#05000a] to-[#000000] -z-20"></div>
      <div className="fixed inset-0 cyber-grid opacity-10 mix-blend-screen -z-10"></div>
      <div className="scanline opacity-20"></div>
      
      {/* Header Supremo */}
      <header className="fixed top-0 w-full z-50 px-8 py-4 bg-[#0a0510]/90 backdrop-blur-xl border-b border-white/5 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-[#1a1030] to-black rounded-xl border border-yellow-500/30 flex items-center justify-center">
                    <ShieldCheck className="text-yellow-500 w-6 h-6" />
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-[0.2em] text-white leading-none">STAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-600">BANK</span></h1>
                <p className="text-[9px] text-yellow-600/80 font-mono tracking-[0.4em] uppercase mt-1 flex items-center gap-2">
                    <span className="w-1 h-1 bg-yellow-500 rounded-full animate-pulse"></span> Supreme Access
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-2">
                    {userProfile?.name || 'Supervisor'} <Crown size={14} className="text-yellow-500 fill-yellow-500"/>
                </div>
                <div className="text-[9px] text-gray-500 font-mono">ID: SUPER-01 • <span className="text-green-500">SECURE</span></div>
            </div>
            <button onClick={() => navigate('/')} className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30">
                <LogOut size={18} />
            </button>
        </div>
      </header>

      <main className="pt-32 px-8 pb-12 max-w-[1800px] mx-auto grid grid-cols-12 gap-8 relative z-10 h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar">
        
        {/* === LINHA 1: COMANDO CENTRAL (Formulário + KPIs) === */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            
            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SupremeKpi title="Performance Pessoal" value={formatCurrency(totalMySales)} subtext="Suas Vendas" icon={User} delay={0.1} />
                <SupremeKpi title="Equipe Total" value={formatCurrency(totalTeamSales)} subtext={`${teamAgents.length} Agentes Ativos`} icon={Database} delay={0.2} />
                <SupremeKpi title="Comissão Master" value={formatCurrency(myCommission)} subtext="Previsão Atual" icon={DollarSign} delay={0.3} />
            </div>

            {/* Input de Vendas (Estilo Terminal) */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative group rounded-3xl p-[1px] bg-gradient-to-r from-yellow-500/20 via-purple-500/20 to-transparent">
                <div className="bg-[#08040d] rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><Rocket size={100}/></div>
                    <h3 className="text-white font-bold text-sm mb-6 flex items-center gap-2 uppercase tracking-widest"><Rocket size={16} className="text-purple-500"/> Terminal de Lançamento (Master)</h3>
                    
                    <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-4">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-2 mb-1 block">Cliente</label>
                            <input type="text" placeholder="Nome Completo" className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 focus:shadow-[0_0_20px_rgba(168,85,247,0.2)] outline-none transition-all" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-2 mb-1 block">Produto</label>
                            <select className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500 appearance-none" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})}>
                                <option>Empréstimo</option><option>Cartão RMC</option><option>Cartão Benefício</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-2 mb-1 block">Convênio</label>
                            <input type="text" placeholder="INSS" className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none" value={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-2 mb-1 block">Valor (R$)</label>
                            <input type="number" step="0.01" placeholder="0.00" className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-green-500 focus:shadow-[0_0_20px_rgba(34,197,94,0.2)] outline-none" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} />
                        </div>
                        <div className="col-span-2">
                            <button className="w-full bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center">
                                <Rocket size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>

            {/* === ÁREA DO DUELO (CONDICIONAL) === */}
            {hasActiveDuel ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-b from-[#1a1005] to-[#050200] p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-yellow-500 font-black italic text-lg tracking-widest flex items-center gap-3"><Swords size={20}/> CLASH OF LEADERS</h3>
                        <span className="text-[9px] font-mono text-gray-500 border border-gray-800 px-2 py-1 rounded">LIVE UPDATE</span>
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                        {/* Líder */}
                        <div className="text-left w-1/3">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-yellow-900/20 flex items-center justify-center text-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"><Crown size={24}/></div>
                                <div>
                                    <p className="text-yellow-500 font-bold text-lg leading-none">{topAgent.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Top 1 Global</p>
                                </div>
                            </div>
                            <div className="text-3xl font-mono text-white">{formatCurrency(topAgent.sales_total)}</div>
                        </div>

                        {/* VS */}
                        <div className="text-6xl font-black italic text-white/5 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none">VS</div>

                        {/* Desafiante */}
                        <div className="text-right w-1/3">
                            <div className="flex items-center justify-end gap-3 mb-2">
                                <div>
                                    <p className="text-gray-300 font-bold text-lg leading-none">{runnerUp.name}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">Top 2 (Desafiante)</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border border-gray-600 bg-gray-800/50 flex items-center justify-center text-gray-400"><User size={20}/></div>
                            </div>
                            <div className="text-2xl font-mono text-gray-400">{formatCurrency(runnerUp.sales_total)}</div>
                        </div>
                    </div>

                    {/* Barra de Domínio */}
                    <div className="mt-8 relative h-3 bg-[#0a0a0a] rounded-full overflow-hidden border border-white/5">
                        <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)]" style={{ width: `${(topAgent.sales_total / ((topAgent.sales_total + runnerUp.sales_total) || 1)) * 100}%` }}></div>
                    </div>
                </motion.div>
            ) : (
                // EMPTY STATE DO DUELO
                <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center text-center h-[250px]">
                    <Swords size={40} className="text-gray-600 mb-4" />
                    <h3 className="text-gray-400 font-bold uppercase tracking-widest text-sm">Aguardando Dados de Campo</h3>
                    <p className="text-gray-600 text-xs max-w-md mt-2">O sistema de duelo tático será ativado automaticamente assim que dois ou mais agentes registrarem vendas no banco de dados.</p>
                </div>
            )}
        </div>

        {/* === LINHA 2: RANKING GLOBAL (COLUNA DIREITA) === */}
        <div className="col-span-12 lg:col-span-4 h-full flex flex-col">
            <div className="bg-[#0a0510]/80 backdrop-blur-xl border border-white/10 rounded-3xl flex-1 flex flex-col overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-gradient-to-r from-purple-900/20 to-transparent">
                    <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                        <Trophy className="text-yellow-500" size={16} /> Elite Ranking
                    </h3>
                    
                    {/* Barra de Pesquisa */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                        <input 
                            type="text" 
                            placeholder="Localizar Agente..." 
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-purple-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
                    <AnimatePresence>
                        {filteredAgents.length === 0 ? (
                            <div className="text-center py-10 text-gray-600 text-xs uppercase tracking-widest">Nenhum agente encontrado</div>
                        ) : (
                            filteredAgents.map((agent, index) => (
                                <motion.div 
                                    key={agent.id}
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                                    className={`p-4 rounded-2xl flex items-center justify-between border ${index === 0 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent border-yellow-500/20' : 'bg-white/5 border-transparent hover:bg-white/10'} transition-all`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${
                                            index === 0 ? 'bg-yellow-500 text-black shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 
                                            index === 1 ? 'bg-gray-400 text-black' : 
                                            index === 2 ? 'bg-orange-700 text-white' : 'bg-gray-800 text-gray-500'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className={`text-sm font-bold ${index === 0 ? 'text-yellow-500' : 'text-white'}`}>{agent.name} {agent.id === userProfile?.id && <span className="text-[9px] text-gray-500 ml-1">(Você)</span>}</p>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'online' ? 'bg-green-500' : 'bg-gray-600'}`}></div> {agent.role}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${index === 0 ? 'text-yellow-400 text-lg' : 'text-gray-300 text-sm'}`}>
                                        {formatCurrency(agent.sales_total || 0)}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
                
                <div className="p-4 bg-black/40 border-t border-white/5 text-[9px] text-center text-gray-600 font-mono uppercase tracking-widest">
                    Database Connected • {teamAgents.length} Records
                </div>
            </div>
        </div>

      </main>
    </div>
  );
};