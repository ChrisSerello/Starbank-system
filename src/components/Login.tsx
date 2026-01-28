import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, Zap, User, AlertTriangle, RefreshCw, Cpu, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { supabase } from '../supabase';

const ALLOWED_SUPERVISORS = ['fernanda gomes', 'nair oliveira', 'brunno leonard', 'maicon nascimento'];

const InteractiveAstronaut = ({ eyePosition, isEyesClosed, isIdle }: any) => {
  return (
    <div className="w-24 h-24 mx-auto mb-2 relative z-20">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
        <circle cx="50" cy="50" r="45" fill="#f0f0f0" stroke="#e2e8f0" strokeWidth="2" />
        <rect x="20" y="30" width="60" height="40" rx="15" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
        <path d="M 25 35 Q 35 35 40 45" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
        <g className="transition-all duration-300 ease-in-out">
            {isEyesClosed || (isIdle && Math.floor(Date.now() / 1000) % 2 === 0) ? ( 
                <g><path d="M 35 50 Q 40 55 45 50" stroke="white" strokeWidth="3" fill="none" /><path d="M 55 50 Q 60 55 65 50" stroke="white" strokeWidth="3" fill="none" /></g>
            ) : (
                <g style={{ transform: `translateX(${Math.min(15, Math.max(-15, eyePosition))}px)` }} className="transition-transform duration-100">
                    <circle cx="40" cy="50" r="5" fill="white" /><circle cx="60" cy="50" r="5" fill="white" />
                </g>
            )}
        </g>
      </svg>
    </div>
  );
};

const FloatingAstronaut = () => (
  <div className="absolute w-32 h-32 animate-float-complex pointer-events-none z-10 opacity-60 mix-blend-screen">
     <img src="https://cdn-icons-png.flaticon.com/512/2026/2026465.png" alt="Astronauta" className="w-full h-full object-contain" />
  </div>
);

export const Login = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'operator' | 'supervisor'>('operator');
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimerRef = useRef<number | null>(null);

  const resetIdleTimer = () => {
    setIsIdle(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 5000);
  };

  useEffect(() => {
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    resetIdleTimer();
    return () => {
        window.removeEventListener('mousemove', resetIdleTimer);
        window.removeEventListener('keydown', resetIdleTimer);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, []);
  
  const eyePosition = (name.length * 1.5) - 10; 
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [2, -2]); // Reduzi o range de rotação 3D
  const rotateY = useTransform(x, [-100, 100], [-2, 2]);

  const handleMouseMove = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  };

  const validateSupervisor = (inputName: string) => ALLOWED_SUPERVISORS.includes(inputName.trim().toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
        if (mode === 'register') {
            if (role === 'supervisor' && !validateSupervisor(name)) throw new Error('ACESSO NEGADO: Identificação não autorizada.');
            const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
            if (authError) throw authError;
            if (authData.user) {
                const { error: profileError } = await supabase.from('profiles').insert([{ id: authData.user.id, name: name, role: role, status: 'online', avatar_id: 1 }]);
                if (profileError) throw profileError;
                setSuccess(`Bem-vindo(a), ${name}!`);
                setTimeout(() => navigate(role === 'operator' ? '/operator' : '/supervisor'), 1500);
            }
        } else if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            navigate('/operator'); 
        }
    } catch (err: any) { setError(err.message || 'Erro ao conectar.'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden perspective-1000" onMouseMove={handleMouseMove}>
      <div className="absolute inset-0 bg-[size:400%_400%] animate-nebula-flow bg-gradient-to-br from-[#1a0b2e] via-[#310f4a] to-[#0f172a]"></div>
      <div className="absolute inset-0 cyber-grid opacity-20 mix-blend-overlay"></div>
      <div className="warp-speed-container font-sans">
        {[...Array(15)].map((_, i) => (<div key={i} className="warp-star" style={{ '--angle': `${Math.random() * 360}deg`, '--rotation': `${Math.random() * 360}deg`, animationDelay: `${Math.random() * 3}s` } as React.CSSProperties} />))}
      </div>
      <FloatingAstronaut />

      <motion.div style={{ rotateX, rotateY, z: 50 }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md relative z-50">
        <div className="glass-panel border border-white/20 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-visible group">
          <div className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-none">
             <InteractiveAstronaut eyePosition={eyePosition} isEyesClosed={isPasswordFocused} isIdle={isIdle} />
          </div>
          <div className="text-center mb-6 mt-8">
            <h1 className="text-3xl font-black text-white tracking-tighter mb-1 font-sans">STAR<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">BANK</span></h1>
            <p className="text-[10px] font-mono text-cyan-500 tracking-[0.3em] uppercase glow-text">{mode === 'login' ? 'Acesso Seguro' : 'Novo Agente'}</p>
          </div>
          <AnimatePresence>
            {error && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-red-900/60 border border-red-500/50 rounded-lg flex items-center gap-2 text-xs text-red-100"><AlertTriangle size={16} /> {error}</motion.div>)}
            {success && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-green-900/60 border border-green-500/50 rounded-lg flex items-center gap-2 text-xs text-green-100"><Cpu size={16} /> {success}</motion.div>)}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex bg-[#0a0a15]/60 p-1.5 rounded-xl border border-white/10 relative overflow-hidden backdrop-blur-md">
              <motion.div className="absolute top-1.5 bottom-1.5 w-[48%] bg-gradient-to-r from-cyan-700 to-blue-700 rounded-lg shadow-lg z-0" animate={{ x: role === 'operator' ? 0 : '100%' }} transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              <button type="button" onClick={() => setRole('operator')} className="flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors text-white">OPERADOR</button>
              <button type="button" onClick={() => setRole('supervisor')} className="flex-1 py-2 text-xs font-bold rounded-lg relative z-10 transition-colors text-white">SUPERVISOR</button>
            </div>
            <div className="space-y-4">
              {mode === 'register' && (<div className="group relative"><User className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" /><input type="text" placeholder="Nome" className="w-full bg-[#050510]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none backdrop-blur-md" value={name} onChange={e => setName(e.target.value)} required /></div>)}
              <div className="group relative"><div className="absolute left-3 top-3.5 w-5 h-5 text-gray-500">@</div><input type="email" placeholder="E-mail" className="w-full bg-[#050510]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-cyan-500 outline-none backdrop-blur-md" value={email} onChange={e => setEmail(e.target.value)} onFocus={() => setIsPasswordFocused(false)} required /></div>
              <div className="group relative"><div className="absolute left-3 top-3.5 w-5 h-5 text-gray-500">{isPasswordFocused ? <EyeOff size={20} /> : <Eye size={20} />}</div><input type="password" placeholder="Senha" className="w-full bg-[#050510]/60 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-purple-500 outline-none backdrop-blur-md" value={password} onChange={e => setPassword(e.target.value)} onFocus={() => setIsPasswordFocused(true)} onBlur={() => setIsPasswordFocused(false)} required /></div>
            </div>
            <button disabled={loading} className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-cyan-600 to-blue-700 hover:shadow-lg text-white flex items-center justify-center gap-2 transition-all">{loading ? <RefreshCw className="animate-spin" /> : <Zap className="fill-current" />}{mode === 'login' ? 'Conectar' : 'Registrar'}</button>
          </form>
          <div className="mt-6 text-center">{mode === 'login' ? <button onClick={() => setMode('register')} className="text-cyan-400 text-[10px] font-bold uppercase hover:underline">Criar Nova Conta</button> : <button onClick={() => setMode('login')} className="text-gray-400 text-[10px] font-bold uppercase hover:text-white">Voltar ao Login</button>}</div>
        </div>
      </motion.div>
    </div>
  );
};