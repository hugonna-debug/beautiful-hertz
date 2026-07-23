import React from 'react';
import { RpgHero, RpgItem } from '../types';

interface RpgInventoryProps {
  hero: RpgHero;
  buyShopItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  useConsumable: (itemId: string) => void;
}

const SHOP_CATALOG = [
  // Weapons
  { id: 'w-key', name: 'Mechanical Keyboard (Blue Switches)', desc: 'Clicks loudly. Adds +12 Attack.', type: 'weapon', cost: 50 },
  { id: 'w-mouse', name: 'Optical Gaming Mouse (RGB)', desc: 'DPI settings over 9000. Adds +8 Attack, +8% Crit Rate.', type: 'weapon', cost: 80 },
  { id: 'w-monitor', name: '4K Ultra-Wide Monitor', desc: 'See bugs before they compile. Adds +25 Attack, +5% Crit Rate.', type: 'weapon', cost: 220 },
  
  // Armors
  { id: 'a-hood', name: 'Corporate Branded Hoodie', desc: 'Gives maximum comfort. Adds +5 Defense, +30 Max HP.', type: 'armor', cost: 40 },
  { id: 'a-phones', name: 'Active Noise-Cancelling Headphones', desc: 'Blocks manager complaints. Adds +10 Defense, +20 Max MP.', type: 'armor', cost: 90 },
  { id: 'a-glasses', name: 'Blue-Light Filtering Glasses', desc: 'Blocks harmful radiation. Adds +18 Defense, +50 Max HP.', type: 'armor', cost: 180 },

  // Consumables
  { id: 'c-coffee', name: 'Double Shot Espresso', desc: 'Restores 45 Mana. Speeds up brain ticks.', type: 'consumable', cost: 10 },
  { id: 'c-pizza', name: 'Cold leftover Pizza', desc: 'Heals 50 HP. Classic programmer fuel.', type: 'consumable', cost: 15 },
  { id: 'c-energy', name: 'RedBull of Stamina', desc: 'Heals 100 HP, Restores 100 MP.', type: 'consumable', cost: 35 }
];

export const RpgInventory: React.FC<RpgInventoryProps> = ({
  hero,
  buyShopItem,
  equipItem,
  useConsumable
}) => {
  const { equippedWeapon, equippedArmor, inventory, gold } = hero;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* Equipped HUD cards */}
      <div className="terminal-panel">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
          🛡️ EQUIPPED HARDWARE SYSTEM CONTROLLERS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* Weapon slot */}
          <div style={{ border: '1px dashed currentColor', padding: '0.8rem 1.2rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>[WEAPON_SLOT]</div>
            {equippedWeapon ? (
              <div style={{ marginTop: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: '#fbbf24' }}>{equippedWeapon.name}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.2rem' }}>
                  {equippedWeapon.description}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                No custom hardware equipped (using bare hands/rusty keyboard).
              </div>
            )}
          </div>
          
          {/* Armor slot */}
          <div style={{ border: '1px dashed currentColor', padding: '0.8rem 1.2rem', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>[ARMOR_SLOT]</div>
            {equippedArmor ? (
              <div style={{ marginTop: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: '#fbbf24' }}>{equippedArmor.name}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.2rem' }}>
                  {equippedArmor.description}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.5, fontStyle: 'italic', marginTop: '0.4rem', fontSize: '0.85rem' }}>
                No custom armor equipped (using simple corporate dress code).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two columns: Backpack and Store */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        
        {/* Backpack Inventory */}
        <div className="terminal-panel">
          <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
            🎒 BACKPACK LOCAL CACHE INVENTORY
          </h3>

          {inventory.filter(i => i.count > 0).length === 0 ? (
            <div style={{ opacity: 0.5, textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
              Backpack cache empty. Purchase items from the hardware catalog.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {inventory.filter(i => i.count > 0).map((item: RpgItem) => {
                const isConsumable = item.type === 'consumable';
                const buttonLabel = isConsumable ? 'CONSUME' : 'EQUIP HARDWARE';
                
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid currentColor',
                      borderRadius: '8px',
                      padding: '0.6rem 1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      backgroundColor: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <span style={{ opacity: 0.6, marginLeft: '0.5rem' }}>({item.count} owned)</span>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                        {item.description}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => isConsumable ? useConsumable(item.id) : equipItem(item.id)}
                      style={{ padding: '2px 8px', fontSize: '0.75rem' }}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Shop Store */}
        <div className="terminal-panel">
          <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid currentColor', paddingBottom: '0.2rem' }}>
            🛒 STACK OVERFLOW HARDWARE STORE
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '350px', overflowY: 'auto' }}>
            {SHOP_CATALOG.map(item => {
              const canAfford = gold >= item.cost;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '0.6rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => buyShopItem(item.id)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '0.75rem',
                      minWidth: '75px'
                    }}
                  >
                    Buy ({item.cost}g)
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
export default RpgInventory;
