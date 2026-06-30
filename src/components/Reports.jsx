import { useMemo } from 'react'
import * as XLSX from 'xlsx'
import { STATUSES } from '../data/store'

export default function Reports({ assets }) {
  const stats = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0)
    const byStatus = STATUSES.map((s) => ({
      ...s,
      count: assets.filter((a) => a.status === s.value).length,
    }))
    const byCategory = {}
    assets.forEach((a) => {
      byCategory[a.category] = (byCategory[a.category] || 0) + 1
    })
    return { totalValue, byStatus, byCategory }
  }, [assets])

  function exportExcel() {
    const rows = assets.map((a) => ({
      'Mã tài sản': a.id,
      'Tên tài sản': a.name,
      'Danh mục': a.category,
      'Trạng thái': STATUSES.find((s) => s.value === a.status)?.label ?? a.status,
      'Người sử dụng': a.assignee,
      'Vị trí': a.location,
      'Ngày mua': a.purchaseDate,
      'Giá trị (VNĐ)': a.value,
      'Ghi chú': a.note,
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [
      { wch: 10 }, { wch: 28 }, { wch: 14 }, { wch: 14 },
      { wch: 16 }, { wch: 18 }, { wch: 12 }, { wch: 14 }, { wch: 24 },
    ]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tài sản')
    const today = new Date().toISOString().slice(0, 10)
    XLSX.writeFile(wb, `bao-cao-tai-san-${today}.xlsx`)
  }

  const maxCategoryCount = Math.max(1, ...Object.values(stats.byCategory))

  return (
    <div className="reports">
      <div className="reports__summary">
        <span className="reports__summary-label">Tổng giá trị tài sản</span>
        <span className="reports__summary-value display">
          {stats.totalValue.toLocaleString('vi-VN')} ₫
        </span>
        <span className="reports__summary-count">{assets.length} tài sản</span>
      </div>

      <section>
        <h3>Theo trạng thái</h3>
        <div className="reports__status-grid">
          {stats.byStatus.map((s) => (
            <div className="reports__status-item" key={s.value}>
              <span className="reports__status-dot" style={{ background: s.color }} />
              <span className="reports__status-label">{s.label}</span>
              <span className="reports__status-count mono">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Theo danh mục</h3>
        <div className="reports__bars">
          {Object.entries(stats.byCategory).map(([cat, count]) => (
            <div className="reports__bar-row" key={cat}>
              <span className="reports__bar-label">{cat}</span>
              <div className="reports__bar-track">
                <div
                  className="reports__bar-fill"
                  style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                />
              </div>
              <span className="reports__bar-count mono">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <button className="reports__export" onClick={exportExcel}>
        Xuất báo cáo Excel (.xlsx)
      </button>

      <style>{`
        .reports {
          padding: 14px 14px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .reports__summary {
          background: var(--surface);
          border: 1px solid var(--surface-2);
          border-radius: var(--radius);
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .reports__summary-label {
          font-size: 12.5px;
          color: var(--text-muted);
        }
        .reports__summary-value {
          font-size: 26px;
          font-weight: 700;
          color: var(--accent);
        }
        .reports__summary-count {
          font-size: 12px;
          color: var(--text-muted);
        }
        section h3 {
          font-size: 13px;
          font-family: "Space Grotesk", sans-serif;
          color: var(--text-muted);
          margin: 0 0 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .reports__status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .reports__status-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--surface);
          border: 1px solid var(--surface-2);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          font-size: 13px;
        }
        .reports__status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .reports__status-label {
          flex: 1;
          color: var(--text);
        }
        .reports__status-count {
          color: var(--text-muted);
        }
        .reports__bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .reports__bar-row {
          display: grid;
          grid-template-columns: 100px 1fr 24px;
          align-items: center;
          gap: 10px;
          font-size: 12.5px;
        }
        .reports__bar-label {
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .reports__bar-track {
          height: 8px;
          background: var(--surface-2);
          border-radius: 6px;
          overflow: hidden;
        }
        .reports__bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 6px;
        }
        .reports__bar-count {
          text-align: right;
          color: var(--text-muted);
        }
        .reports__export {
          padding: 13px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--accent);
          background: none;
          color: var(--accent);
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
