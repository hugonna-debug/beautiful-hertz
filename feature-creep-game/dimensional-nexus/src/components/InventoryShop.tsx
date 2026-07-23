import React from 'react';
import { RpgHero, RpgItem } from '../types/game';

interface InventoryShopProps {
  hero: RpgHero;
  buyShopItem: (itemId: string) => void;
  equipItem: (itemId: string) => void;
  useConsumable: (itemId: string) => void;
}

export const InventoryShop: React.FC<InventoryShopProps> = ({
  hero,
  buyShopItem,
  equipItem,
  useConsumable
}) => {
  const { equippedWeapon, equippedArmor, equippedAccessory, inventory, gold } = hero;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
      
      {/* Equipped HUD Cards */}
      <div className="terminal-panel">
        <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
          🛡️ EQUIPPED NEXUS HARDWARE
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          
          {/* Weapon Slot */}
          <div style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '0.8rem 1.2rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>[WEAPON_SLOT]</div>
            {equippedWeapon ? (
              <div style={{ marginTop: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--gold-myth)' }}>{equippedWeapon.name}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                  {equippedWeapon.description}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.45, fontStyle: 'italic', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                No custom weapon equipped.
              </div>
            )}
          </div>
          
          {/* Armor Slot */}
          <div style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '0.8rem 1.2rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>[ARMOR_SLOT]</div>
            {equippedArmor ? (
              <div style={{ marginTop: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--gold-myth)' }}>{equippedArmor.name}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                  {equippedArmor.description}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.45, fontStyle: 'italic', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                No custom armor equipped.
              </div>
            )}
          </div>

          {/* Accessory Slot */}
          <div style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '0.8rem 1.2rem', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>[ACCESSORY_SLOT]</div>
            {equippedAccessory ? (
              <div style={{ marginTop: '0.4rem' }}>
                <strong style={{ fontSize: '0.95rem', color: 'var(--gold-myth)' }}>{equippedAccessory.name}</strong>
                <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '2px' }}>
                  {equippedAccessory.description}
                </div>
              </div>
            ) : (
              <div style={{ opacity: 0.45, fontStyle: 'italic', marginTop: '0.4rem', fontSize: '0.8rem' }}>
                No accessory equipped.
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Backpack and Store split */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* Backpack Cache */}
        <div className="terminal-panel">
          <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
            🎒 BACKPACK LOCAL CACHE
          </h3>

          {inventory.filter(i => i.count > 0).length === 0 ? (
            <div style={{ opacity: 0.4, textAlign: 'center', padding: '2rem', fontSize: '0.85rem' }}>
              Backpack cache empty. Purchase gear from the Nexus merchants.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {inventory.filter(i => i.count > 0).map((item: RpgItem) => {
                const isConsumable = item.type === 'consumable';
                const buttonLabel = isConsumable ? 'CONSUME' : 'EQUIP HARDWARE';
                
                return (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.8rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.85rem',
                      backgroundColor: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    <div>
                      <strong>{item.name}</strong>
                      <span style={{ opacity: 0.5, marginLeft: '0.4rem' }}>({item.count} owned)</span>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                        {item.description}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => isConsumable ? useConsumable(item.id) : equipItem(item.id)}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      {buttonLabel}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Merchants Catalog */}
        <div className="terminal-panel">
          <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.4rem' }}>
            🛒 STACK MERCHANTS CATALOG
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '350px', overflowY: 'auto' }}>
            {inventory.map(item => {
              const canAfford = gold >= item.cost;
              return (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '2px' }}>
                      {item.description}
                    </div>
                  </div>

                  <button
                    disabled={!canAfford}
                    onClick={() => buyShopItem(item.id)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '0.75rem',
                      minWidth: '80px'
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
export default InventoryShop;
