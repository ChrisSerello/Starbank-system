import React, { useState, useMemo, useEffect } from 'react';
import { Rocket, Target, DollarSign, Zap, TrendingUp, LogOut, User, Cpu, Activity, Medal, Star, ShieldCheck, Crown, Globe, Trash2, Loader2 } from 'lucide-react';
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

// --- META DA EQUIPE (PLANETA) ---
const TEAM_MISSION_GOAL = 500000;

// --- COMPONENTES VISUAIS ---
const MiniHoloChart = ({ color }: { color: string }) => {
  const pathColor = color === 'cyan' ? '#00d4ff' : color === 'purple' ? '#8a2be2' : '#22c55e';
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
    const iconColor = colorName === 'cyan' ? 'text-cyan-400' : colorName === 'purple' ? 'text-purple-400' : 'text-green-400';
    const glowColor = colorName === 'cyan' ? 'shadow-cyan-500/20' : colorName === 'purple' ? 'shadow-purple-500/20' : 'shadow-green-500/20';
    return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} className={`relative group holo-card rounded-2xl p-6 hover:scale-[1.01] transition-transform duration-300 ${glowColor}`}>
        <MiniHoloChart color={colorName} />
        <div className="relative z-10 flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl bg-[#0a0a15]/50 border border-white/10 ${iconColor}`}><Icon className="w-6 h-6" /></div>
        <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-300 bg-cyan-950/50 px-2 py-1 rounded-sm border border-cyan-500/30"><Activity size={10}/> STREAM</span>
        </div>
        <h3 className="relative z-10 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{title}</h3>
        <div className="relative z-10 text-2xl md:text-3xl font-black text-white font-sans">{value}</div>
    </motion.div>
    );
};

// --- COMPONENTE DO PLANETA (TERRAFORMAÇÃO) ---
const PlanetView = ({ progress }: { progress: number }) => {
    let planetClass = "from-gray-800 to-gray-900"; 
    let atmosphereClass = "opacity-0";
    let statusText = "PLANETA MORTO";
    
    if (progress >= 25) { 
        planetClass = "from-blue-900 to-gray-800";
        statusText = "HIDROSFERA DETECTADA";
    }
    if (progress >= 50) {
        planetClass = "from-green-800 via-blue-900 to-gray-900";
        atmosphereClass = "opacity-20 bg-blue-500";
        statusText = "VEGETAÇÃO EM CRESCIMENTO";
    }
    if (progress >= 75) {
        planetClass = "from-green-600 via-blue-600 to-blue-900";
        atmosphereClass = "opacity-40 bg-cyan-400";
        statusText = "ATMOSFERA ESTÁVEL";
    }
    if (progress >= 100) {
        planetClass = "from-yellow-200 via-blue-500 to-green-500";
        atmosphereClass = "opacity-60 bg-yellow-200 shadow-[0_0_50px_rgba(255,255,0,0.3)]";
        statusText = "COLÔNIA ESTABELECIDA";
    }

    return (
        <div className="relative w-full h-48 flex items-center justify-center overflow-hidden rounded-2xl bg-[#0a0a15]/60 border border-cyan-500/20 mb-4 group shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
            
            <motion.div 
                className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${planetClass} shadow-[inset_-10px_-10px_20px_rgba(0,0,0,1)] transition-all duration-1000`}
                animate={{ rotate: 360 }}
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            >
                <div className={`absolute inset-[-5px] rounded-full blur-md transition-all duration-1000 ${atmosphereClass}`}></div>
                <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] mix-blend-multiply rounded-full"></div>
            </motion.div>

            <div className="absolute top-3 left-3">
                 <div className="text-[9px] text-cyan-500 font-mono flex items-center gap-1"><Globe size={10}/> TERRAFORMAÇÃO</div>
                 <div className="text-xl font-black text-white">{progress.toFixed(1)}%</div>
            </div>
             <div className="absolute bottom-3 right-3 text-right">
                 <div className="text-[9px] text-gray-500 font-mono">STATUS DA FROTA</div>
                 <div className={`text-[10px] font-bold tracking-widest ${progress >= 100 ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`}>{statusText}</div>
            </div>
        </div>
    );
};

export const OperatorDashboard = () => {
  const navigate = useNavigate();
  
  // DADOS
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teamAgents, setTeamAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', agreement: '', product: 'Empréstimo', value: '' });

  useEffect(() => {
    const loadData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }

        const { data: salesData } = await supabase.from('sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (salesData) setSales(salesData);

        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        const { data: allProfiles } = await supabase.from('profiles').select('sales_total');
        if (allProfiles) setTeamAgents(allProfiles);
        
        setLoading(false);
    };
    loadData();

    const channel = supabase.channel('operator-global')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, async () => {
             const { data } = await supabase.from('profiles').select('sales_total');
             if(data) setTeamAgents(data);
        })
        .subscribe();
    
    return () => { supabase.removeChannel(channel); }

  }, [navigate]);

  // --- FUNÇÃO DE LOGOUT CORRIGIDA ---
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Desloga do Banco
    navigate('/'); // Redireciona para Login
  };

  // CÁLCULOS FINANCEIROS
  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + Number(curr.value), 0), [sales]);
  const { rate, nextGoal } = useMemo(() => {
    if (totalSales >= 150000) return { rate: 0.0150, nextGoal: null };
    if (totalSales >= 101000) return { rate: 0.0125, nextGoal: 150000 };
    if (totalSales >= 80000) return { rate: 0.0100, nextGoal: 101000 };
    if (totalSales >= 50000) return { rate: 0.0050, nextGoal: 80000 };
    return { rate: 0, nextGoal: 50000 };
  }, [totalSales]);

  const commissionValue = totalSales * rate;
  const progressPercent = nextGoal ? Math.min(100, (totalSales / nextGoal) * 100) : 100;
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatK = (val: number) => `R$ ${val / 1000}k`;

  // --- CÁLCULO DE PATENTES ---
  const currentRankIndex = RANKS.slice().reverse().findIndex(r => totalSales >= r.threshold);
  const rankIndex = currentRankIndex >= 0 ? RANKS.length - 1 - currentRankIndex : 0;
  const currentRank = RANKS[rankIndex];
  const nextRank = RANKS[rankIndex + 1];
  
  let rankProgress = 100;
  let distToNext = 0;
  if (nextRank) {
      const prevThreshold = currentRank.threshold;
      const range = nextRank.threshold - prevThreshold;
      const currentInRank = totalSales - prevThreshold;
      rankProgress = Math.min(100, Math.max(0, (currentInRank / range) * 100));
      distToNext = nextRank.threshold - totalSales;
  }

  // --- CÁLCULO DO PLANETA (TIME) ---
  const teamTotalSales = teamAgents.reduce((acc, curr) => acc + (curr.sales_total || 0), 0);
  const planetProgress = Math.min(100, (teamTotalSales / TEAM_MISSION_GOAL) * 100);

  // AÇÕES
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value || !userProfile) return;
    const val = Number(formData.value);
    const { data, error } = await supabase.from('sales').insert([{ user_id: userProfile.id, client_name: formData.client, agreement: formData.agreement, product: formData.product, value: val }]).select();
    if (!error && data) {
        setSales([data[0], ...sales]);
        setFormData({ ...formData, client: '', value: '' });
        await supabase.from('profiles').update({ sales_total: totalSales + val }).eq('id', userProfile.id);
    }
  };

  const handleDeleteSale = async (id: string, val: number) => {
    if(confirm("Confirma a exclusão deste registro?")) {
        const { error } = await supabase.from('sales').delete().eq('id', id);
        if (!error) {
            setSales(prev => prev.filter(s => s.id !== id));
            await supabase.from('profiles').update({ sales_total: totalSales - val }).eq('id', userProfile?.id);
        }
    }
  };

  if (loading) return <div className="min-h-screen bg-[#030008] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-500 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden bg-[#030008]">
      <div className="fixed inset-0 bg-[size:400%_400%] animate-nebula-flow bg-gradient-to-br from-[#120524] via-[#090317] to-[#000814] -z-20"></div>
      <div className="fixed inset-0 cyber-grid opacity-30 mix-blend-screen -z-10" style={{backgroundSize: '30px 30px'}}></div>
      <div className="scanline"></div>
      
      <div className="warp-speed-container font-sans fixed inset-0 -z-10 opacity-50 mix-blend-screen">
        {[...Array(15)].map((_, i) => (<div key={i} className="warp-star" style={{ '--angle': `${Math.random() * 360}deg`, '--rotation': `${Math.random() * 360}deg`, animationDelay: `${Math.random() * 3}s`, width: '1px', height: '2px' } as React.CSSProperties} />))}
      </div>

      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1, duration: 0.8 }} className="fixed bottom-5 right-5 w-28 h-28 pointer-events-none z-50 hidden lg:block mix-blend-screen filter drop-shadow-[0_0_20px_rgba(0,212,255,0.6)]">
        <img src="https://cdn-icons-png.flaticon.com/512/2026/2026465.png" alt="Mascote" className="w-full h-full object-contain" />
      </motion.div>

      <header className="fixed top-0 w-full z-40 holo-card border-b-0 border-b-white/5 px-6 py-3 flex justify-between items-center bg-[#050510]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="relative"><div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0a0a15] to-[#1a1a2e] flex items-center justify-center border border-cyan-500/50 relative z-10"><Cpu className="text-cyan-400 w-5 h-5" /></div></div>
          <div><h1 className="text-xl font-black tracking-[0.3em] text-white leading-none flex gap-1">STAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">BANK</span></h1><div className="flex items-center gap-2 mt-1"><span className="h-[2px] w-4 bg-cyan-500"></span><p className="text-[9px] text-cyan-300 font-mono tracking-[0.2em] uppercase glow-text">OPERADOR</p></div></div>
        </div>
        <div className="flex items-center gap-6">
           <div className="text-right hidden sm:block">
             <div className="text-xs font-bold text-white flex items-center justify-end gap-2"><User size={14} className="text-purple-400"/> {userProfile?.name || 'Agente'}</div>
             <div className="text-[10px] text-green-400 font-mono flex justify-end items-center gap-1">ONLINE <span className="text-gray-600">|</span> CONECTADO(A)</div>
           </div>
           {/* AQUI ESTÁ A CORREÇÃO DO BOTÃO SAIR */}
           <button onClick={handleLogout} className="group holo-card p-2.5 rounded-lg text-red-400 hover:text-red-300 hover:border-red-500/50 transition-all active:scale-95"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="pt-28 px-6 pb-10 max-w-[1700px] mx-auto grid grid-cols-12 gap-6 relative z-10 h-screen overflow-y-auto custom-scrollbar">
        
        {/* KPI CARDS */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-4">
          <KpiCardHolo title="Vendas Totais" value={formatCurrency(totalSales)} icon={Target} colorName="purple" delay={0.1} />
          <KpiCardHolo title="Comissão (%)" value={`${(rate * 100).toFixed(2)}%`} icon={TrendingUp} colorName="cyan" delay={0.2} />
          <KpiCardHolo title="Sua Comissão" value={formatCurrency(commissionValue)} icon={DollarSign} colorName="green" delay={0.3} />
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="sm:col-span-2 lg:col-span-1 holo-card rounded-2xl p-6 bg-gradient-to-br from-cyan-950/30 to-transparent relative overflow-visible">
            <div className="absolute -top-2 -right-2"><Zap className="text-yellow-400" size={24} /></div>
            <div className="flex justify-between items-center mb-4"><h3 className="text-cyan-300 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">Energia da Meta</h3><span className="text-sm font-mono text-white font-bold drop-shadow-lg">{progressPercent.toFixed(0)}%</span></div>
            {nextGoal ? (<><div className="text-lg font-bold text-gray-300 mb-3 font-mono">Falta: <span className="text-white text-xl">{formatCurrency(nextGoal - totalSales)}</span></div><div className="relative w-full h-5 energy-bar-container rounded-full bg-[#050510] overflow-hidden"><motion.div className="h-full energy-bar-fill rounded-full" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 2, ease: "circOut" }} /></div></>) : (<div className="flex flex-col items-center justify-center h-full text-green-400 animate-pulse font-bold tracking-[0.3em] text-lg">CAPACIDADE MÁXIMA</div>)}
          </motion.div>
        </div>

        {/* COLUNA ESQUERDA: FORMULÁRIO + PATENTES */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="holo-card rounded-3xl p-7 relative overflow-hidden group">
            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-3 tracking-wider"><span className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,212,255,0.2)]"><Rocket size={18} className="text-cyan-300"/></span>LANÇAMENTO DE DADOS</h2>
            <form onSubmit={handleSubmit} className="space-y-5 font-mono">
              <div className="space-y-1"><label className="text-[9px] text-cyan-500 uppercase font-bold tracking-[0.1em] ml-2">Cliente</label><input type="text" required placeholder="Nome Completo" value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full bg-[#0a0a15]/80 border border-cyan-900/50 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 outline-none transition-all font-sans" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[9px] text-cyan-500 uppercase font-bold tracking-[0.1em] ml-2">Produto</label><select value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} className="w-full bg-[#0a0a15]/80 border border-cyan-900/50 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-400 transition-all font-sans"><option className="bg-[#0a0a15]">Empréstimo</option><option className="bg-[#0a0a15]">Cartão RMC</option><option className="bg-[#0a0a15]">Cartão Benefício</option></select></div>
                <div className="space-y-1"><label className="text-[9px] text-cyan-500 uppercase font-bold tracking-[0.1em] ml-2">Convênio</label><input type="text" required placeholder="Ex: BARCARENA" value={formData.agreement} onChange={e => setFormData({...formData, agreement: e.target.value})} className="w-full bg-[#0a0a15]/80 border border-cyan-900/50 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-400 outline-none transition-all font-sans" /></div>
              </div>
              <div className="space-y-1"><label className="text-[9px] text-cyan-500 uppercase font-bold tracking-[0.1em] ml-2">Valor</label><input type="number" required step="0.01" placeholder="0.00" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="w-full bg-[#0a0a15]/80 border border-cyan-900/50 rounded-xl px-4 py-3 text-lg font-bold text-white focus:border-green-500 outline-none transition-all font-sans tracking-wider" /></div>
              <button className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-500 hover:via-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl uppercase tracking-[0.2em] text-xs shadow-lg transform hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3"><Rocket size={18}/> INICIAR PROTOCOLO</button>
            </form>
          </motion.div>

          {/* --- SISTEMA DE PATENTES --- */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="holo-card rounded-3xl p-6 bg-gradient-to-b from-[#101015] to-[#050010] border border-white/10 relative overflow-hidden">
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
                        <p className="text-[10px] text-gray-500 mt-1 font-mono">XP: {formatK(totalSales)}</p>
                    </div>
                </div>

                {nextRank ? (
                    <div className="space-y-2">
                         <div className="flex justify-between text-[10px] font-bold">
                             <span className="text-gray-400">Progresso</span>
                             <span className="text-white">{rankProgress.toFixed(0)}%</span>
                         </div>
                         <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                             <motion.div className={`h-full ${currentRank.bg}`} initial={{ width: 0 }} animate={{ width: `${rankProgress}%` }} />
                         </div>
                         <p className="text-[9px] text-center text-gray-500 mt-2 font-mono">Faltam {formatCurrency(distToNext)} para promoção</p>
                    </div>
                ) : (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-center">
                        <p className="text-xs font-bold text-yellow-500">NÍVEL MÁXIMO ATINGIDO</p>
                        <p className="text-[9px] text-yellow-200/70">Você é uma lenda do Starbank.</p>
                    </div>
                )}
            </motion.div>
        </div>

        {/* COLUNA DIREITA: PLANETA + TABELA */}
        <div className="col-span-12 lg:col-span-8">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }} className="holo-card rounded-3xl p-1 h-full min-h-[600px] flex flex-col overflow-hidden">
             <div className="p-5 border-b border-cyan-500/20 flex justify-between items-center bg-[#0a0a15]/40 relative z-10">
                <h3 className="font-black text-white text-sm flex items-center gap-3 tracking-[0.2em] uppercase">Fluxo de Dados</h3>
                <div className="flex gap-3 text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest bg-cyan-950/30 px-3 py-1 rounded-full border border-cyan-500/10"><Activity size={10}/> Transmissão Segura</div>
             </div>
             
             <div className="overflow-auto flex-1 p-4 relative z-10 bg-[#050510]/30 font-mono custom-scrollbar">
               
               {/* --- PLANETA (TOPO DA LISTA) --- */}
               <PlanetView progress={planetProgress} />

               <table className="w-full text-left text-sm border-separate border-spacing-y-2 mt-4">
                 <thead className="text-[9px] text-cyan-500/70 uppercase tracking-[0.2em]"><tr><th className="p-3 pl-5">Data</th><th className="p-3">Cliente</th><th className="p-3">Ativo</th><th className="p-3 text-right">Valor</th><th className="p-3"></th></tr></thead>
                 <tbody className="font-sans">
                   <AnimatePresence mode='popLayout'>
                     {sales.map((sale) => (
                       <motion.tr key={sale.id} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="group bg-gradient-to-r from-white/5 to-transparent hover:from-cyan-500/10 transition-all border-l-[3px] border-transparent hover:border-cyan-400">
                         <td className="p-4 rounded-l-lg font-mono text-xs text-cyan-300/70">{new Date(sale.created_at || Date.now()).toLocaleDateString('pt-BR')}</td>
                         <td className="p-4 font-bold text-white group-hover:text-cyan-200 text-sm">{sale.client_name}</td>
                         <td className="p-4"><span className="px-3 py-1 rounded-sm text-[9px] font-bold uppercase tracking-wider bg-cyan-950/50 border border-cyan-500/30 text-cyan-300">{sale.product}</span></td>
                         <td className="p-4 text-right font-mono font-bold text-lg text-green-400 group-hover:text-green-300">{formatCurrency(sale.value)}</td>
                         <td className="p-4 rounded-r-lg text-center"><button onClick={() => handleDeleteSale(sale.id, sale.value)} className="btn-delete p-2 rounded-lg text-gray-500 hover:text-red-500 transition-all" title="Remover"><Trash2 size={16}/></button></td>
                       </motion.tr>
                     ))}
                   </AnimatePresence>
                   {sales.length === 0 && (<tr><td colSpan={5} className="p-20 text-center"><div className="flex flex-col items-center gap-4 opacity-40"><Target size={50} className="text-cyan-400"/><p className="text-sm font-mono uppercase tracking-[0.3em] text-cyan-300">Aguardando Dados...</p></div></td></tr>)}
                 </tbody>
               </table>
             </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};