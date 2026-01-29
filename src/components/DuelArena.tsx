import React from 'react';
import { Swords } from 'lucide-react';

interface DuelArenaProps {
  myScore: number;
}

export const DuelArena: React.FC<DuelArenaProps> = ({ myScore }) => {

  const rivalScore = Math.max(15000, myScore * 1.1 + 2000); 
  const maxScale = Math.max(myScore, rivalScore) * 1.2;

  const getWidth = (score: number) => `${Math.min((score / maxScale) * 100, 100)}%`;

  return (
    <div className="bg-starbank-glass backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Swords className="text-red-500 animate-pulse" />
        <h3 className="text-xl font-bold italic tracking-wider text-red-500">ARENA DE DUELO</h3>
        <Swords className="text-red-500 animate-pulse transform scale-x-[-1]" />
      </div>

      <div className="space-y-4">
        {/* Jogador */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-starbank-gold">VOCÊ</span>
            <span className="text-xs text-gray-400">R$ {myScore.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-starbank-primary to-starbank-gold transition-all duration-1000"
              style={{ width: getWidth(myScore) }}
            />
          </div>
        </div>

        {/* Rival */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-red-400">RIVAL (TOP 1)</span>
            <span className="text-xs text-gray-400">R$ {rivalScore.toLocaleString('pt-BR')}</span>
          </div>
          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-900 to-red-500 transition-all duration-1000"
              style={{ width: getWidth(rivalScore) }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};