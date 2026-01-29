import React, { useState, useMemo, useEffect } from 'react';
import { Rocket, Target, DollarSign, Zap, LogOut, User, Cpu, Swords, Search, Crown, LayoutDashboard, History, ShieldCheck, Crosshair, StopCircle, Trophy, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

// --- CONFIGURAÇÃO DE METAS ---
const GOALS = [50000, 80000, 100000, 150000];

// --- COMPONENTES VISUAIS (EFEITOS) ---
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

export const SupervisorDashboard = () => {
  const navigate = useNavigate();
  
  // DADOS DO SISTEMA
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [teamAgents, setTeamAgents] = useState<any[]>([]);
  const [formData, setFormData] = useState({ client: '', agreement: '', product: 'Empréstimo', value: '' });

  // INTERFACE
  const [activeTab, setActiveTab] = useState<'history' | 'team'>('team');
  const [searchQuery, setSearchQuery] = useState('');

  // DUELO REAL (DB)
  const [selectedOpponentId, setSelectedOpponentId] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<number>(50000);
  const [activeDuelData, setActiveDuelData] = useState<any>(null);
  const [sentNotification, setSentNotification] = useState<{show: boolean, name: string}>({ show: false, name: '' });

  // --- 1. CARREGAMENTO INICIAL E REALTIME ---
  useEffect(() => {
    let myUserId = '';

    const init = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/'); return; }
        myUserId = user.id;

        // Carrega Perfil
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setUserProfile(profile);

        // Carrega Vendas
        const { data: mySales } = await supabase.from('sales').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        if (mySales) setSales(mySales);

        // Carrega Time e Duelos
        await fetchTeamData();
        await fetchActiveDuel(user.id);
        setLoading(false);
    };

    init();

    // CANAL DE TEMPO REAL (O SEGREDO DO DUELO)
    const channel = supabase.channel('starbank-realtime')
        // Escuta Vendas (para atualizar ranking)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
            fetchTeamData();
        })
        // Escuta Duelos (INSERT e DELETE)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'duels' }, (payload) => {
            // Verifica se o duelo envolve o usuário atual
            const duel = payload.new as any || payload.old as any;
            if (myUserId && (duel.challenger_id === myUserId || duel.opponent_id === myUserId)) {
                console.log("Alteração no duelo detectada!", payload);
                fetchActiveDuel(myUserId);
            }
        })
        .subscribe();

    return () => { supabase.removeChannel(channel); }
  }, [navigate]);

  // --- FUNÇÕES AUXILIARES ---
  const fetchTeamData = async () => {
      const { data } = await supabase.from('profiles').select('*').order('sales_total', { ascending: false });
      if (data) setTeamAgents(data);
  }

  const fetchActiveDuel = async (myId: string) => {
      // Busca se existe algum duelo onde eu sou desafiante OU oponente
      const { data } = await supabase
        .from('duels')
        .select('*')
        .or(`challenger_id.eq.${myId},opponent_id.eq.${myId}`)
        .single();
      
      setActiveDuelData(data); // Se não tiver nada, data vem null (o que é correto)
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // CÁLCULOS MATEMÁTICOS
  const totalSales = useMemo(() => sales.reduce((acc, curr) => acc + Number(curr.value), 0), [sales]);
  const nextGoal = GOALS.find(g => g > totalSales) || GOALS[GOALS.length - 1];
  const progressPercent = Math.min(100, (totalSales / nextGoal) * 100);
  const commission = totalSales * (totalSales > 100000 ? 0.015 : 0.01);
  const formatCurrency = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatK = (val: number) => `R$ ${val / 1000}k`;

  // --- INTELIGÊNCIA DO DUELO ---
  // Transforma os dados brutos do banco em informações para a tela
  const duelInfo = useMemo(() => {
    if (!activeDuelData || !userProfile || teamAgents.length === 0) return null;

    const isChallenger = activeDuelData.challenger_id === userProfile.id;
    const opponentId = isChallenger ? activeDuelData.opponent_id : activeDuelData.challenger_id;
    const opponent = teamAgents.find(a => a.id === opponentId);

    if (!opponent) return null;

    return {
        id: activeDuelData.id,
        goal: Number(activeDuelData.goal),
        mySales: userProfile.sales_total || 0,
        opponentName: opponent.name,
        opponentSales: opponent.sales_total || 0,
    };
  }, [activeDuelData, userProfile, teamAgents]);

  // ENVIAR VENDA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value || !userProfile) return;
    const val = Number(formData.value);

    // 1. Salva a Venda
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
        
        // 2. Atualiza o Total no Perfil (Isso dispara o Realtime para o duelo!)
        await supabase.from('profiles').update({ sales_total: totalSales + val }).eq('id', userProfile.id);
        
        // 3. Atualiza localmente
        fetchTeamData();
        if(duelInfo) fetchActiveDuel(userProfile.id);
    }
  };

  // COMEÇAR DUELO
  const handleStartDuel = async () => {
    if (selectedOpponentId && userProfile) {
        const opponent = teamAgents.find(op => op.id === selectedOpponentId);
        
        // Insere no banco
        await supabase.from('duels').insert([{
            challenger_id: userProfile.id,
            opponent_id: selectedOpponentId,
            goal: selectedGoal
        }]);

        setSentNotification({ show: true, name: opponent?.name || '' });
        setTimeout(() => setSentNotification({ show: false, name: '' }), 3000);
        setSelectedOpponentId(null);
        // O Realtime vai atualizar a tela automaticamente
    }
  };

  // ENCERRAR DUELO
  const handleStopDuel = async () => {
      if(activeDuelData) {
          await supabase.from('duels').delete().eq('id', activeDuelData.id);
          setActiveDuelData(null);
      }
  }

  const filteredTeam = teamAgents.filter(agent => agent.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) return <div className="min-h-screen bg-[#020005] flex items-center justify-center"><Loader2 className="animate-spin text-yellow-500 w-10 h-10"/></div>;

  return (
    <div className="min-h-screen relative font-sans text-white overflow-hidden bg-[#020005]">
      {/* Background FX */}
      <div className="fixed inset-0 bg-[size:400%_400%] animate-nebula-flow bg-gradient-to-br from-[#0f0014] via-[#05000a] to-[#000000] -z-20"></div>
      <div className="fixed inset-0 cyber-grid opacity-10 mix-blend-screen -z-10"></div>
      <div className="scanline opacity-20"></div>

      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="fixed bottom-5 right-5 w-32 h-32 pointer-events-none z-50 hidden lg:block mix-blend-screen filter drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">
        <img src="https://cdn-icons-png.flaticon.com/512/2026/2026465.png" alt="Mascote" className="w-full h-full object-contain" style={{filter: 'hue-rotate(45deg)'}} />
      </motion.div>

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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="sm:col-span-2 lg:col-span-2 holo-card rounded-2xl p-6 bg-gradient-to-r from-[#1a1025] to-transparent border border-purple-500/30 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-20"><Zap size={100} className="text-purple-500"/></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-purple-400 text-[10px] font-bold uppercase tracking-[0.2em]">Meta Pessoal Atual</h3>
                        <span className="text-white font-mono font-bold">{progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="flex items-end gap-2 mb-3">
                         <span className="text-3xl font-black text-white">{formatK(nextGoal)}</span>
                         <span className="text-xs text-gray-400 mb-1 font-mono">Próximo Nível</span>
                    </div>
                    <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-white/10">
                        <motion.div className="h-full bg-gradient-to-r from-purple-600 to-yellow-500" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} />
                    </div>
                </div>
            </motion.div>
        </div>

        {/* INPUT DE VENDAS */}
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

            {/* ÁREA DE DUELO (AGORA REAL) */}
            <AnimatePresence mode="wait">
            {duelInfo ? (
                 <motion.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} className="holo-card rounded-3xl p-6 border border-red-500/30 relative overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-black text-red-500 text-xs flex items-center gap-2 uppercase tracking-widest animate-pulse"><Swords size={16} /> Duelo Ativo: {formatK(duelInfo.goal)}</h3>
                        <button onClick={handleStopDuel} className="text-[10px] text-red-400 hover:text-white border border-red-900/50 px-2 py-1 rounded bg-red-950/30 flex items-center gap-1"><StopCircle size={10} /> ENCERRAR</button>
                    </div>
                    <div className="space-y-6">
                        {/* Eu */}
                        <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider items-end"><span className="text-yellow-500 flex items-center gap-1"><User size={12}/> Você</span><span className="text-white font-mono">{formatCurrency(duelInfo.mySales)}</span></div>
                            <div className="h-3 bg-black rounded-full overflow-hidden border border-yellow-500/30"><motion.div className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (duelInfo.mySales / duelInfo.goal) * 100)}%` }} /></div>
                        </div>
                        <div className="text-center text-xs font-black text-gray-600 italic">VS</div>
                        {/* Oponente */}
                        <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-wider items-end"><span className="text-red-500 flex items-center gap-1"><Cpu size={12}/> {duelInfo.opponentName}</span><span className="text-gray-400 font-mono">{formatCurrency(duelInfo.opponentSales)}</span></div>
                            <div className="h-3 bg-black rounded-full overflow-hidden border border-red-500/30"><motion.div className="h-full bg-gradient-to-r from-red-900 to-red-500" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (duelInfo.opponentSales / duelInfo.goal) * 100)}%` }} /></div>
                        </div>
                    </div>
                 </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="holo-card rounded-3xl p-1 overflow-hidden flex flex-col h-[300px]">
                    <div className="p-4 bg-[#151020] border-b border-white/5 flex justify-between items-center">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2"><Swords size={14} className="text-purple-400"/> Iniciar Duelo</h3>
                        <div className="flex gap-1">{GOALS.map(g => (<button key={g} onClick={() => setSelectedGoal(g)} className={`text-[9px] px-2 py-1 rounded border ${selectedGoal === g ? 'bg-purple-600 text-white border-purple-400' : 'text-gray-500 border-transparent hover:border-purple-500/30'}`}>{g/1000}k</button>))}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-[#0a0510]/50">
                        {teamAgents.filter(a => a.id !== userProfile?.id).map(agent => (
                            <div key={agent.id} onClick={() => setSelectedOpponentId(agent.id)} className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${selectedOpponentId === agent.id ? 'bg-purple-900/30 border-purple-500/50' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${selectedOpponentId === agent.id ? 'border-purple-400 text-purple-400' : 'border-white/10 text-gray-500'}`}><User size={14}/></div>
                                    <div><p className={`text-xs font-bold ${selectedOpponentId === agent.id ? 'text-white' : 'text-gray-400'}`}>{agent.name}</p><p className="text-[9px] text-gray-600">{formatCurrency(agent.sales_total || 0)}</p></div>
                                </div>
                                {selectedOpponentId === agent.id && <Crosshair size={16} className="text-purple-400 animate-spin-slow"/>}
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-[#151020] border-t border-white/5">
                        <button onClick={handleStartDuel} disabled={!selectedOpponentId} className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-widest ${selectedOpponentId ? 'bg-purple-600 text-white shadow-lg' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}>Desafiar</button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* LISTAGEM DE TIME / HISTÓRICO */}
        <div className="col-span-12 lg:col-span-8 h-full flex flex-col">
             <div className="flex gap-4 mb-4 border-b border-white/5 pb-1">
                <button onClick={() => setActiveTab('team')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'team' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                    <LayoutDashboard size={14}/> Visão Global (Raio-X)
                </button>
                <button onClick={() => setActiveTab('history')} className={`pb-2 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>
                    <History size={14}/> Meu Histórico
                </button>
             </div>

             <div className="flex-1 bg-[#0a0510]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
                {activeTab === 'team' ? (
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-white/5 bg-[#151020]/50 flex justify-between items-center">
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                                <input type="text" placeholder="Pesquisar qualquer agente..." className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-yellow-500 outline-none" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            </div>
                            <div className="flex gap-2 text-[9px] font-mono text-gray-500">
                                <span>TOTAL AGENTES: {teamAgents.length}</span>
                                <span className="text-green-500">ONLINE: {teamAgents.filter(a => a.status === 'online').length}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
                            {filteredTeam.map((agent, index) => {
                                const agentTotal = agent.sales_total || 0;
                                const agentNextGoal = GOALS.find(g => g > agentTotal) || GOALS[GOALS.length - 1];
                                const agentProgress = Math.min(100, (agentTotal / agentNextGoal) * 100);
                                const isLeader = index === 0 && agentTotal > 0;

                                return (
                                    <motion.div key={agent.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0, transition: { delay: index * 0.05 } }}
                                        className={`p-4 rounded-2xl border transition-all ${isLeader ? 'bg-gradient-to-r from-yellow-900/20 to-transparent border-yellow-500/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm ${isLeader ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}>{index + 1}</div>
                                                <div>
                                                    <p className={`text-sm font-bold flex items-center gap-2 ${isLeader ? 'text-yellow-400' : 'text-white'}`}>
                                                        {agent.name} {agent.id === userProfile?.id && <span className="text-[9px] bg-purple-900/50 text-purple-300 px-1 rounded border border-purple-500/20">VOCÊ</span>}
                                                    </p>
                                                    <p className="text-[9px] text-gray-500 uppercase">{agent.role}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-mono font-bold ${isLeader ? 'text-yellow-400 text-lg' : 'text-gray-300'}`}>{formatCurrency(agentTotal)}</p>
                                                <p className="text-[9px] text-gray-600">Meta: {formatK(agentNextGoal)}</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-black rounded-full overflow-hidden flex items-center">
                                            <div className={`h-full rounded-full ${isLeader ? 'bg-yellow-500' : 'bg-purple-600'}`} style={{ width: `${agentProgress}%` }}></div>
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