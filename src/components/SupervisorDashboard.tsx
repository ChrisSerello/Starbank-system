import React, { useState, useMemo, useEffect } from 'react';
import { Rocket, Target, DollarSign, Zap, LogOut, Search, Crown, LayoutDashboard, History, ShieldCheck, Medal, Star, Globe, Loader2, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// --- CONFIGURAÇÃO DE NÍVEIS (PATENTES) ---
const RANKS = [
  { name: 'Cadete Espacial', threshold: 0, icon: Star, color: 'text-gray-400', bg: 'bg-gray-500' },
  { name: 'Agente de Campo', threshold: 20000, icon: ShieldCheck, color: 'text-green-400', bg: 'bg-green-500' },
  { name: 'Capitão de Fragata', threshold: 50000, icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500' },
  { name: 'Comandante Estelar', threshold: 80000, icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500' },
  { name: 'Almirante da Frota', threshold: 100000, icon: Crown, color: 'text-yellow-400', bg: 'bg-yellow-500' },
];

// --- META DA EQUIPE (PLANETA GIGANTE) ---
const TEAM_MISSION_GOAL = 500000;

// --- COMPONENTES VISUAIS ---
const MiniHoloChart = ({ color }: { color: string }) => {
  const pathColor = color === 'gold' ? '#ffd700' : color === 'purple' ? '#a855f7' : '#22c55e';
  return (
    <div className="absolute bottom-0 left-0 right-0 h-16 opacity-20 pointer-events-none overflow-hidden rounded-b-2xl">
      <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
        <path d="M0,30 Q25,10 50,30 T100,30 V40 H0 Z" fill={`url(#grad-${color})`} stroke={pathColor} strokeWidth="0.5" />
        <defs><linearGradient id={`grad-${color}`}><stop offset="0%" style={{ stopColor: pathColor, stopOpacity: 0.4 }} /><stop offset="100%" style={{ stopColor: pathColor, stopOpacity: 0 }} /></linearGradient></defs>
      </svg>
    </div>
  );
};

const KpiCardHolo = ({ title, value, icon: Icon, colorName, delay }: any) => {
    const theme = colorName === 'gold' ? 'text-yellow-400 shadow-yellow-500/20' : colorName === 'purple' ? 'text-purple-400 shadow-purple-500/20' : 'text-green-400 shadow-green-500/20';
    return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className={`relative group holo-card rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] ${theme} border border-white/5 bg-[#0a0510]/60`}>
        <MiniHoloChart color={colorName} />
        <div className="relative z-10 flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-[#1a1025] border border-white/10 shadow-inner ${colorName === 'gold' ? 'text-yellow-500' : colorName === 'purple' ? 'text-purple-500' : 'text-green-500'}`}><Icon className="w-6 h-6" /></div>
            {colorName === 'gold' && <Crown size={12} className="text-yellow-500 animate-pulse"/>}
        </div>
        <h3 className="relative z-10 text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</h3>
        <div className="relative z-10 text-2xl md:text-3xl font-black text-white font-sans">{value}</div>
    </motion.div>
    );
};

// --- COMPONENTE DO PLANETA (COM EFEITOS) ---
const PlanetView = ({ progress, isAnimating }: { progress: number, isAnimating: boolean }) => {
    let planetClass = "from-gray-800 to-gray-900"; 
    let atmosphereClass = "opacity-0";
    let statusText = "PLANETA MORTO";
    
    if (progress >= 25) { 
        planetClass = "from-blue-900 to-gray-800"; // Fase 1: Água
        statusText = "HIDROSFERA DETECTADA";
    }
    if (progress >= 50) {
        planetClass = "from-green-800 via-blue-900 to-gray-900"; // Fase 2: Vida
        atmosphereClass = "opacity-20 bg-blue-500";
        statusText = "VEGETAÇÃO EM CRESCIMENTO";
    }
    if (progress >= 75) {
        planetClass = "from-green-600 via-blue-600 to-blue-900"; // Fase 3: Atmosfera
        atmosphereClass = "opacity-40 bg-cyan-400";
        statusText = "ATMOSFERA ESTÁVEL";
    }
    if (progress >= 100) {
        planetClass = "from-yellow-200 via-blue-500 to-green-500"; // Fase 4: Utopia (Luzes)
        atmosphereClass = "opacity-60 bg-yellow-200 shadow-[0_0_50px_rgba(255,255,0,0.3)]";
        statusText = "COLÔNIA ESTABELECIDA";
    }

    return (
        <div className="relative w-full h-48 flex items-center justify-center overflow-hidden rounded-2xl bg-[#05000a] border border-white/5 mb-4 group">
            {/* Estrelas de fundo */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            {/* O Planeta */}
            <motion.div 
                className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${planetClass} shadow-[inset_-10px_-10px_20px_rgba(0,0,0,1)] transition-all duration-1000`}
                // ANIMAÇÃO DE GIRO E PULSO (IGUAL AO OPERADOR)
                animate={isAnimating ? { 
                    rotate: [0, 360], 
                    scale: [1, 1.2, 1],
                    filter: ["brightness(1)", "brightness(2)", "brightness(1)"]
                } : { 
                    rotate: 360 
                }}
                transition={isAnimating ? { duration: 2, ease: "easeInOut" } : { duration: 100, repeat: Infinity, ease: "linear" }}
            >
                {/* Atmosfera */}
                <div className={`absolute inset-[-5px] rounded-full blur-md transition-all duration-1000 ${atmosphereClass}`}></div>
                {/* Textura simulada */}
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-multiply rounded-full"></div>
            </motion.div>

             {/* Efeitos de Partículas quando vende */}
             {isAnimating && (
                <>
                    <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 2, opacity: 0 }} transition={{ duration: 1 }} className="absolute w-24 h-24 rounded-full border-2 border-yellow-400"></motion.div>
                    <motion.div initial={{ scale: 0, opacity: 1 }} animate={{ scale: 3, opacity: 0 }} transition={{ duration: 1.5 }} className="absolute w-24 h-24 rounded-full border border-white"></motion.div>
                </>
            )}

            {/* HUD Overlay */}
            <div className="absolute top-3 left-3">
                 <div className="text-[9px] text-gray-500 font-mono flex items-center gap-1"><Globe size={10}/> MUNDO DA FROTA</div>
                 <div className="text-xl font-black text-white">{progress.toFixed(1)}%</div>
            </div>
             <div className="absolute bottom-3 right-3 text-right">
                 <div className="text-[9px] text-gray-500 font-mono">STATUS</div>
                 <div className={`text-[10px] font-bold tracking-widest ${progress >= 100 ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`}>{statusText}</div>
            </div>
        </div>
    );
};

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  
  // DADOS DO SISTEMA
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teamAgents, setTeamAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', agreement: '', product: 'Empréstimo', value: '' });

  // INTERFACE E ANIMAÇÃO
  const [activeTab, setActiveTab] = useState<'history' | 'team'>('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [planetAnimating, setPlanetAnimating] = useState(false);

  useEffect(() => {
    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        const { data: mySales } = await supabase.from('sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (mySales) setSales(mySales);

        await fetchTeamData();
        setLoading(false);
    };

    init();

    const channel = supabase.channel('starbank-supervisor')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            fetchTeamData();
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [navigate]);

  const fetchTeamData = async () => {
      const { data } = await supabase.from('profiles').select('*').order('sales_total', { ascending: false });
      if (data) setTeamAgents(data);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // CÁLCULOS MATEMÁTICOS
  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + Number(curr.value), 0), [sales]);
  const commission = totalSales * (totalSales > 100000 ? 0.015 : 0.01);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatK = (val: number) => `R$ ${val / 1000}k`;

  // --- LÓGICA DE PATENTES (RANK SYSTEM) ---
  const currentRankIndex = RANKS.slice().reverse().findIndex(r => totalSales >= r.threshold);
  const rankIndex = currentRankIndex >= 0 ? RANKS.length - 1 - currentRankIndex : 0;
  const currentRank = RANKS[rankIndex];
  const nextRank = RANKS[rankIndex + 1];
  
  // Progresso para a próxima patente
  let rankProgress = 100;
  let distToNext = 0;
  if (nextRank) {
      const prevThreshold = currentRank.threshold;
      const range = nextRank.threshold - prevThreshold;
      const currentInRank = totalSales - prevThreshold;
      rankProgress = Math.min(100, Math.max(0, (currentInRank / range) * 100));
      distToNext = nextRank.threshold - totalSales;
  }

  // --- LÓGICA DO PLANETA (TIME) ---
  const teamTotalSales = teamAgents.reduce((acc, curr) => acc + (curr.sales_total || 0), 0);
  const planetProgress = Math.min(100, (teamTotalSales / TEAM_MISSION_GOAL) * 100);

  // ENVIAR VENDA
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
        await supabase.from('profiles').update({ sales_total: totalSales + val }).eq('id', userProfile.id);
        fetchTeamData();

        // DISPARAR ANIMAÇÃO DO PLANETA (IGUAL OPERADOR)
        setPlanetAnimating(true);
        setTimeout(() => setPlanetAnimating(false), 3000);
    }
  };

  const filteredTeam = teamAgents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-[#020005] flex items-center justify-center"><Loader2 className="animate-spin text-yellow-500 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden bg-[#020005]">
      {/* Background FX */}
      <div className="fixed inset-0 bg-[size:400%_400%] animate-nebula-flow bg-gradient-to-br from-[#0f0014] via-[#05000a] to-[#000000] -z-20"></div>
      <div className="fixed inset-0 cyber-grid opacity-10 mix-blend-screen -z-10"></div>
      <div className="scanline opacity-20"></div>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 px-6 py-3 bg-[#0a0510]/90 backdrop-blur-xl border-b border-yellow-500/10 flex justify-between items-center shadow-2xl">
        <div className="flex items-center gap-4">
            <div className="relative group">
                <div className="absolute inset-0 bg-yellow-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-[#1a1030] to-black rounded-xl border border-yellow-500/30 flex items-center justify-center">
                    <ShieldCheck className="text-yellow-500 w-5 h-5" />
                </div>
            </div>
            <div>
                <h1 className="text-xl font-black tracking-[0.2em] text-white leading-none">STAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-purple-600">BANK</span></h1>
                <p className="text-[9px] text-yellow-600/80 font-mono tracking-[0.4em] uppercase mt-1 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></span> Supreme Access
                </p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white flex items-center justify-end gap-2">
                    {userProfile?.name || 'Supervisor'} <Crown size={14} className="text-yellow-500 fill-yellow-500"/>
                </div>
                <div className="text-[9px] text-gray-500 font-mono">GOD MODE ENABLED</div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg bg-white/5 hover:bg-red-900/20 text-gray-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/30 cursor-pointer">
                <LogOut size={18} />
            </button>
        </div>
      </header>

      <main className="pt-24 px-6 pb-10 max-w-[1800px] mx-auto grid grid-cols-12 gap-6 relative z-10 h-screen overflow-y-auto custom-scrollbar">
        
        {/* KPI CARDS */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KpiCardHolo title="Suas Vendas" value={formatCurrency(totalSales)} icon={Target} colorName="gold" delay={0.1} />
            <KpiCardHolo title="Sua Comissão" value={formatCurrency(commission)} icon={DollarSign} colorName="green" delay={0.2} />
            {/* KPI DE RANK RESUMIDO */}
             <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sm:col-span-2 lg:col-span-2 holo-card rounded-2xl p-6 bg-gradient-to-r from-[#1a1025] to-transparent border border-purple-500/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10"><currentRank.icon size={100} className={currentRank.color}/></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em]">PATENTE ATUAL</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded border ${currentRank.color} border-current bg-black/50`}>{currentRank.name}</span>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                         <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentRank.bg} text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]`}>
                             <currentRank.icon size={24} />
                         </div>
                         <div>
                             <span className="text-2xl font-black text-white">{rankProgress.toFixed(0)}%</span>
                             <p className="text-[10px] text-gray-400">Progresso de Carreira</p>
                         </div>
                    </div>
                    <div className="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <motion.div className={`h-full ${currentRank.bg}`} initial={{ width: 0 }} animate={{ width: `${rankProgress}%` }} />
                    </div>
                </div>
            </motion.div>
        </div>

        {/* INPUT DE VENDAS + RANK SYSTEM */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="holo-card rounded-3xl p-6 bg-[#0a0510]/80 border border-yellow-500/20 relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                <h2 className="text-sm font-black text-yellow-500 mb-5 flex items-center gap-2 tracking-wider uppercase"><Rocket size={16}/> Lançar Venda (Master)</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 font-mono">
                    <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold ml-1">Cliente</label>
                        <input type="text" placeholder="Nome Completo" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-1">Convênio</label>
                            <input type="text" placeholder="Ex: INSS" value={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.value})} className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-all" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] text-gray-500 uppercase font-bold ml-1">Produto</label>
                            <select value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-yellow-500"><option>Empréstimo</option><option>Cartão RMC</option><option>Cartão Benefício</option></select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] text-gray-500 uppercase font-bold ml-1">Valor (R$)</label>
                        <input type="number" step="0.01" placeholder="0.00" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-[#151020] border border-white/10 rounded-xl px-4 py-3 text-lg font-bold text-white focus:border-green-500 outline-none" />
                    </div>

                    <button className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 rounded-xl uppercase tracking-widest text-xs shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                       <Rocket size={16}/> Registrar
                    </button>
                </form>
            </motion.div>

            {/* --- RANK SYSTEM COMPLETO --- */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="holo-card rounded-3xl p-6 bg-gradient-to-b from-[#101015] to-black border border-white/10 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-sm font-black text-white flex items-center gap-2 tracking-[0.2em] uppercase">
                        <Medal size={16} className={currentRank.color}/> Carreira
                    </h2>
                    {nextRank && <span className="text-[9px] text-gray-500 font-mono">PRÓX: {nextRank.name.split(' ')[0]}</span>}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${currentRank.bg} text-black shadow-lg shadow-${currentRank.color.split('-')[1]}-500/20`}>
                         <currentRank.icon size={32} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Patente Atual</p>
                        <h3 className={`text-lg font-black ${currentRank.color} uppercase leading-none`}>{currentRank.name}</h3>
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">ID: {userProfile?.id?.slice(0,8)}</p>
                    </div>
                </div>

                {nextRank ? (
                    <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold">
                             <span className="text-gray-400">XP Atual</span>
                             <span className="text-white">{formatCurrency(totalSales)} / {formatK(nextRank.threshold)}</span>
                         </div>
                         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                             <motion.div className={`h-full ${currentRank.bg}`} initial={{ width: 0 }} animate={{ width: `${rankProgress}%` }} />
                         </div>
                         <p className="text-[9px] text-center text-gray-600 mt-2 font-mono">Faltam {formatCurrency(distToNext)} para promoção</p>
                    </div>
                ) : (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                        <p className="text-xs font-bold text-yellow-500">NÍVEL MÁXIMO ATINGIDO</p>
                        <p className="text-[9px] text-yellow-200/70">Você é uma lenda do Starbank.</p>
                    </div>
                )}
            </motion.div>
        </div>

        {/* LISTAGEM DE TIME + PLANETA */}
        <div className="col-span-12 lg:col-span-8 h-full flex flex-col">
             <div className="flex gap-4 mb-4 border-b border-white/5 pb-1">
                <button onClick={() => setActiveTab('team')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'team' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                    <LayoutDashboard size={14}/> Visão Global (Raio-X)
                </button>
                <button onClick={() => setActiveTab('history')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                    <History size={14}/> Meu Histórico
                </button>
             </div>

             <div className="flex-1 bg-[#0a0510]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col">
                {activeTab === 'team' ? (
                    <div className="h-full flex flex-col p-4">
                        
                        {/* --- AQUI ESTÁ O PLANETA (COM ANIMAÇÃO) --- */}
                        <PlanetView progress={planetProgress} isAnimating={planetAnimating} />

                        {/* Barra de Pesquisa */}
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                            <input type="text" placeholder="Pesquisar agente..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-yellow-500 outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>

                        {/* Lista de Agentes */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {filteredTeam.map((agent, index) => {
                                const agentTotal = agent.sales_total || 0;
                                // Calcula patente de cada agente para exibir
                                const agentRank = RANKS.slice().reverse().find(r => agentTotal >= r.threshold) || RANKS[0];
                                const isLeader = index === 0 && agentTotal > 0;

                                return (
                                    <motion.div key={agent.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                                        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${isLeader ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${isLeader ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>{index + 1}</div>
                                            <div>
                                                <p className={`text-xs font-bold flex items-center gap-2 ${isLeader ? 'text-yellow-400' : 'text-white'}`}>
                                                    {agent.name} 
                                                    {agent.id === userProfile?.id && <span className="text-[8px] bg-purple-900/50 text-purple-300 px-1 rounded border border-purple-500/20">VOCÊ</span>}
                                                </p>
                                                <div className="flex items-center gap-1">
                                                    <agentRank.icon size={10} className={agentRank.color} />
                                                    <p className="text-[9px] text-gray-500 uppercase">{agentRank.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-mono font-bold text-sm ${isLeader ? 'text-yellow-400' : 'text-gray-300'}`}>{formatCurrency(agentTotal)}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="h-full overflow-auto p-4 custom-scrollbar">
                         <table className="w-full text-left text-sm border-separate border-spacing-y-2">
                            <thead className="text-[9px] text-gray-500 uppercase tracking-widest"><tr><th className="p-2">Data</th><th className="p-2">Cliente</th><th className="p-2">Convênio</th><th className="p-2">Produto</th><th className="p-2 text-right">Valor</th></tr></thead>
                            <tbody className="font-mono text-xs">
                                {sales.map(sale => (
                                    <tr key={sale.id} className="bg-white/5 hover:bg-white/10">
                                        <td className="p-3 rounded-l-lg text-gray-400">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</td>
                                        <td className="p-3 text-white font-sans font-bold">{sale.client_name}</td>
                                        <td className="p-3 text-gray-300">{sale.agreement || '-'}</td>
                                        <td className="p-3 text-purple-400">{sale.product}</td>
                                        <td className="p-3 rounded-r-lg text-right text-green-400 font-bold">{formatCurrency(sale.value)}</td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                         {sales.length === 0 && <div className="text-center py-10 text-gray-500 text-xs">Nenhuma venda registrada</div>}
                    </div>
                )}
             </div>
        </div>

      </main>
    </div>
  );
};