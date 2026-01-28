import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Login } from './components/Login';
import { OperatorDashboard } from './components/OperatorDashboard';
import { SupervisorDashboard } from './components/SupervisorDashboard';
import { Loader2 } from 'lucide-react';

function App() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica se já tem sessão ativa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // 2. Escuta mudanças no login (entrar/sair)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id);
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Busca o cargo (role) no banco de dados
  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (data) {
        console.log("Cargo encontrado:", data.role); // Para debug
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Erro ao buscar cargo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tela de Carregamento (enquanto decide para onde ir)
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020005] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  // Se não estiver logado, mostra Login
  if (!session) {
    return <Login />;
  }

  // --- AQUI ESTÁ A MÁGICA ---
  // Se for Supervisor, mostra o Painel Supremo
  if (userRole === 'supervisor') {
    return <SupervisorDashboard />;
  }

  // Se for qualquer outra coisa (operator), mostra o Painel Padrão
  return <OperatorDashboard />;
}

export default App;