import { useMemo, useState } from 'react'
import AssetCard from './AssetCard'
import { CATEGORIES, STATUSES } from '../data/store'

export default function AssetList({ assets, onSelect, onAddNew }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchQuery =
        !query ||
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.id.toLowerCase().includes(query.toLowerCase()) ||
        a.assignee.toLowerCase().includes(query.toLowerCase())
      const matchCategory = category === 'all' || a.category === category
      const matchStatus = status === 'all' || a.status === status
      return matchQuery && matchCategory && matchStatus
    })
  }, [assets, query, category, status])

  return (
    <div className="asset-list">
      <div className="asset-list__search">
        <input
          type="search"
          placeholder="Tìm theo tên, mã tài sản, người dùng…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="asset-list__filters">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="all">Tất cả trạng thái</option>
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="asset-list__count">
        {filtered.length} / {assets.length} tài sản
      </div>

      <div className="asset-list__items">
        {filtered.length === 0 && (
          <div className="asset-list__empty">
            Không tìm thấy tài sản nào khớp. Thử đổi từ khóa hoặc bộ lọc.
          </div>
        )}
        {filtered.map((a) => (
          <AssetCard key={a.id} asset={a} onClick={() => onSelect(a)} />
        ))}
      </div>

      <button className="asset-list__fab" onClick={onAddNew} aria-label="Thêm tài sản mới">
        +
      </button>

      <style>{`
        .asset-list {
          position: relative;
          padding: 14px 14px 90px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .asset-list__search input {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-2);
          background: var(--surface);
          color: var(--text);
          font-size: 14px;
        }
        .asset-list__filters {
          display: flex;
          gap: 8px;
        }
        .asset-list__filters select {
          flex: 1;
          padding: 9px 10px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-2);
          background: var(--surface);
          color: var(--text);
          font-size: 13px;
        }
        .asset-list__count {
          font-size: 12px;
          color: var(--text-muted);
          padding: 2px 2px;
        }
        .asset-list__items {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .asset-list__empty {
          padding: 30px 10px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }
        .asset-list__fab {
          position: fixed;
          right: 18px;
          bottom: 84px;
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: var(--accent);
          color: var(--ink);
          font-size: 26px;
          border: none;
          box-shadow: 0 8px 20px rgba(255, 138, 61, 0.35);
          cursor: pointer;
          line-height: 1;
        }
      `}</style>
    </div>
  )
}
