import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom'; // <--- O IMPORT QUE FALTAVA
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
    // 1. Verifica sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserRole(session.user.id);
      else setLoading(false);
    });

    // 2. Escuta mudanças (Login/Logout)
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

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error('Erro ao buscar cargo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tela de Carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020005] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  
  // Envolvemos tudo no BrowserRouter para o "useNavigate" funcionar
  return (
    <BrowserRouter>
      {!session ? (
        <Login />
      ) : userRole === 'supervisor' ? (
        <SupervisorDashboard />
      ) : (
        <OperatorDashboard />
      )}
    </BrowserRouter>
  );
}

export default App;