'use client'
import styles from './Dashboard.module.css'

export default function MegaPopup({ prop, onClose }: { prop: any, onClose: () => void }) {
  return (
    <div className={styles.megaPopup} onMouseLeave={onClose}>
      <div style={{ padding: '24px', background: `linear-gradient(135deg, ${prop.zone === 'North' ? '#3b82f6' : '#10b981'}20 0%, transparent 70%)`, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h2 style={{ fontSize: '22px', margin: 0, color: 'white' }}>{prop.name}</h2>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>{prop.location_area}</div>
      </div>
      <div style={{ padding: '20px' }}>
        <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>{prop.price_display}</div>
        <div>Sq Ft: {prop.sq_ft_range} | Facing: {prop.facing_direction}</div>
        <div style={{ marginTop: '12px', color: '#047857' }}>Contact: {prop.contact_person}</div>
      </div>
    </div>
  )
}
