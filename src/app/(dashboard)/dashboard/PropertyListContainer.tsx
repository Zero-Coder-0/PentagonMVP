'use client'
import styles from './Dashboard.module.css'

interface Props {
  properties: any[], selectedId: string | null, hoveredId: string | null
  filters: any, onSelect: (id: string | null) => void, onHover: (id: string | null) => void
  onFiltersChange: (filters: any) => void
}

export default function PropertyListContainer({ properties, selectedId, hoveredId, filters, onSelect, onHover, onFiltersChange }: Props) {
  const filtered = properties.filter((p: any) => {
    if (filters.status && filters.status !== p.status) return false
    if (filters.maxPrice && p.price_value > parseInt(filters.maxPrice)) return false
    return true
  })

  return (
    <div className={styles.listContainer}>
      <div className={styles.filtersHeader}>
        <div className={styles.filterButtons}>
          <button className={styles.filterButton}>Status: {filters.status || 'All'}</button>
          <button className={styles.filterButton}>💰 Max Price</button>
        </div>
        <div className={styles.propertiesCount}>{filtered.length} / {properties.length}</div>
      </div>
      <div className={styles.propertiesList}>
        {filtered.map((prop: any) => (
          <div
            key={prop.id}
            className={[
              styles.propertyCard,
              selectedId === prop.id && styles.selected,
              hoveredId === prop.id && styles.hovered,
              styles[prop.zone?.toLowerCase()]
            ].filter(Boolean).join(' ')}
            onClick={() => onSelect(prop.id)}
            onMouseEnter={() => onHover(prop.id)}
            onMouseLeave={() => onHover(null)}
          >
            <div className={styles.propertyHeader}>
              <div>
                <div className={styles.propertyName}>{prop.name}</div>
                <div className={styles.propertyLocation}>{prop.location_area}, {prop.zone}</div>
              </div>
              <div className={styles.propertyPrice}>
                <div className={styles.propertyPriceValue}>{prop.price_display}</div>
              </div>
            </div>
            <div className={styles.propertySpecs}>
              <span>{prop.sq_ft_range}</span>
              <span>{prop.facing_direction}</span>
              <span>{prop.balcony_count} Balc.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
