export interface Sale {
  id: string;
  date: string;
  client: string;
  agreement: string;
  product: 'Empréstimo' | 'Cartão RMC' | 'Cartão Benefício';
  value: number;
}

export interface User {
  name: string;
  role: 'operator' | 'supervisor';
  avatar: string;
}

// Simulando banco de dados de usuários
export const MOCK_USERS = {
  operator: { name: 'Christian Serello', role: 'operator', avatar: 'Christian' },
  supervisor: { name: 'Fernanda Gomes', role: 'supervisor', avatar: 'Fernanda' }
};

export const COMMISSION_TIERS = [
  { limit: 50000, rate: 0.0050 },
  { limit: 80000, rate: 0.0100 },
  { limit: 101000, rate: 0.0125 },
  { limit: 150000, rate: 0.0150 }
];