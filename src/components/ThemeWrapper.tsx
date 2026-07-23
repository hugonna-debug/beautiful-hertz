import React from 'react';
import { GameState } from '../types/game';

interface ThemeWrapperProps {
  state: GameState;
  children: React.ReactNode;
}

export const ThemeWrapper: React.FC<ThemeWrapperProps> = ({ children }) => {
  return (
    <div className="main-wrapper" style={{ position: 'relative' }}>
      {/* Neo-Brutalist clean container */}
      <div style={{ position: 'relative', zIndex: 10, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
export default ThemeWrapper;
