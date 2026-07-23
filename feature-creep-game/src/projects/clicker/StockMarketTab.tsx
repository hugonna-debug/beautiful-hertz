import React, { useRef, useEffect } from 'react';
import { GameState, Stock } from './types';

interface StockMarketTabProps {
  state: GameState;
  buyStock: (symbol: string, sharesCount: number) => void;
  sellStock: (symbol: string, sharesCount: number) => void;
  convertCreepToCash: (amount: number) => void;
  convertCashToCreep: (amount: number) => void;
}

// Mini-chart drawing component
const StockChart: React.FC<{ history: number[] }> = ({ history }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate dimensions
    const width = canvas.width;
    const height = canvas.height;
    const padding = 4;

    const min = Math.min(...history) * 0.95;
    const max = Math.max(...history) * 1.05;
    const range = max - min || 1;

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Chart path
    ctx.beginPath();
    ctx.strokeStyle = history[history.length - 1] >= history[0] ? '#10b981' : '#ef4444';
    ctx.lineWidth = 2;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * (width - padding * 2) + padding;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return { x, y };
    });

    if (points.length > 0) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();

      // Draw shadow area below line
      ctx.lineTo(points[points.length - 1].x, height);
      ctx.lineTo(points[0].x, height);
      ctx.closePath();
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, history[history.length - 1] >= history[0] ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [history]);

  return (
    <canvas 
      ref={canvasRef} 
      width={120} 
      height={45} 
      style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '4px', backgroundColor: '#050505' }} 
    />
  );
};

export const StockMarketTab: React.FC<StockMarketTabProps> = ({
  state,
  buyStock,
  sellStock,
  convertCreepToCash,
  convertCashToCreep
}) => {
  const { stocks, portfolio, creep, wanderingBugs } = state;

  const totalStockValuation = stocks.reduce((acc, stock) => {
    const owned = portfolio.shares[stock.symbol] || 0;
    return acc + (owned * stock.price);
  }, 0);

  const netWorth = portfolio.balance + totalStockValuation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Portfolio status */}
      <div className="terminal-panel gravity-item">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          💼 BROKERAGE ACCOUNT METRICS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Broker Cash Balance:</div>
            <strong style={{ fontSize: '1.3rem', color: '#10b981' }}>${portfolio.balance.toFixed(2)}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Stock Value:</div>
            <strong style={{ fontSize: '1.3rem', color: '#3b82f6' }}>${totalStockValuation.toFixed(2)}</strong>
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Total Portfolio Value:</div>
            <strong style={{ fontSize: '1.3rem', color: '#fbbf24' }}>${netWorth.toFixed(2)}</strong>
          </div>
        </div>

        {/* Currency Conversions */}
        <h4 style={{ margin: '0 0 0.8rem 0', borderBottom: '1px dashed currentColor', paddingBottom: '0.2rem', fontSize: '0.9rem' }}>
          💱 INTEGRATED EXCHANGE EXCHANGE
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div>
            <button 
              disabled={creep < 100}
              onClick={() => convertCreepToCash(100)}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
            >
              Exchange 100 Creep → $10.00
            </button>
          </div>
          <div>
            <button 
              disabled={portfolio.balance < 10}
              onClick={() => convertCashToCreep(10)}
              style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
            >
              Exchange $10.00 → 100 Creep
            </button>
          </div>
        </div>
        {wanderingBugs.length > 0 && (
          <p style={{ margin: '0.8rem 0 0 0', fontSize: '0.75rem', color: '#ef4444' }}>
            ⚠️ WARNING: {wanderingBugs.length} bugs detected in codebase! Stock price drifts are experiencing negative drag coefficients!
          </p>
        )}
      </div>

      {/* Stocks trading list */}
      <div className="stock-grid">
        {stocks.map(stock => {
          const owned = portfolio.shares[stock.symbol] || 0;
          const costFor1 = stock.price;
          const costFor10 = stock.price * 10;
          const isUp = stock.history.length > 1 ? stock.price >= stock.history[stock.history.length - 2] : true;

          return (
            <div key={stock.symbol} className="stock-card card gravity-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                    {stock.name} ({stock.symbol})
                  </h4>
                  <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>Vol: {Math.floor(stock.volatility * 100)}%</span>
                </div>
                <StockChart history={stock.history} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Price: </span>
                  <strong style={{ fontSize: '1.2rem', color: isUp ? '#10b981' : '#ef4444' }}>
                    ${stock.price.toFixed(2)}
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Owned: </span>
                  <strong>{owned} shares</strong>
                </div>
              </div>

              {/* Trading controls */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  disabled={portfolio.balance < costFor1}
                  onClick={() => buyStock(stock.symbol, 1)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Buy 1
                </button>
                <button
                  disabled={owned < 1}
                  onClick={() => sellStock(stock.symbol, 1)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Sell 1
                </button>
                <button
                  disabled={portfolio.balance < costFor10}
                  onClick={() => buyStock(stock.symbol, 10)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Buy 10
                </button>
                <button
                  disabled={owned < 10}
                  onClick={() => sellStock(stock.symbol, 10)}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                >
                  Sell 10
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default StockMarketTab;
