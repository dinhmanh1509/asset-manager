import { useState } from 'react'
import { CATEGORIES, STATUSES } from '../data/store'

const emptyAsset = {
  id: '',
  name: '',
  category: CATEGORIES[0],
  status: 'storage',
  assignee: '',
  location: '',
  purchaseDate: '',
  value: 0,
  note: '',
}

export default function AssetForm({ initial, generatedId, onSave, onDelete, onClose, onScanRequest, onHandoverRequest }) {
  const isNew = !initial
  const [form, setForm] = useState(initial ?? { ...emptyAsset, id: generatedId })

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({ ...form, value: Number(form.value) || 0 })
  }

  return (
    <div className="asset-form__overlay" onClick={onClose}>
      <form className="asset-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="asset-form__header">
          <h2>{isNew ? 'Thêm tài sản mới' : 'Sửa tài sản'}</h2>
          <button type="button" className="asset-form__close" onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>

        <div className="asset-form__id-row">
          <span className="mono">{form.id}</span>
          <button type="button" className="asset-form__scan-btn" onClick={() => onScanRequest((code) => update('id', code))}>
            Quét mã ↗
          </button>
        </div>

        <label>
          Tên tài sản
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="VD: Laptop Dell Latitude 5440" />
        </label>

        <div className="asset-form__row">
          <label>
            Danh mục
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label>
            Trạng thái
            <select value={form.status} onChange={(e) => update('status', e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Người sử dụng
          <input value={form.assignee} onChange={(e) => update('assignee', e.target.value)} placeholder="Để trống nếu trong kho" />
        </label>

        <label>
          Vị trí
          <input value={form.location} onChange={(e) => update('location', e.target.value)} placeholder="VD: Phòng IT - Tầng 3" />
        </label>

        <div className="asset-form__row">
          <label>
            Ngày mua
            <input type="date" value={form.purchaseDate} onChange={(e) => update('purchaseDate', e.target.value)} />
          </label>
          <label>
            Giá trị (VNĐ)
            <input type="number" min="0" value={form.value} onChange={(e) => update('value', e.target.value)} />
          </label>
        </div>

        <label>
          Ghi chú
          <textarea rows={2} value={form.note} onChange={(e) => update('note', e.target.value)} />
        </label>

        <div className="asset-form__actions">
          {!isNew && (
            <button type="button" className="asset-form__delete" onClick={() => onDelete(form.id)}>
              Xóa tài sản
            </button>
          )}
          <button type="submit" className="asset-form__save">
            {isNew ? 'Thêm tài sản' : 'Lưu thay đổi'}
          </button>
        </div>

        {!isNew && (
          <>
            <button
              type="button"
              className="asset-form__handover-btn"
              onClick={() => onHandoverRequest(form)}
            >
              ↪ Bàn giao tài sản này
            </button>

            {form.history && form.history.length > 0 && (
              <div className="asset-form__history">
                <h3>Lịch sử bàn giao</h3>
                {[...form.history].reverse().map((h) => (
                  <div className="asset-form__history-item" key={h.id}>
                    <div className="asset-form__history-row">
                      <span>{h.fromUser}</span>
                      <span>→</span>
                      <span>{h.toUser}</span>
                      <span className="asset-form__history-date mono">{h.date}</span>
                    </div>
                    {h.note && <div className="asset-form__history-note">{h.note}</div>}
                    {h.signature && (
                      <img className="asset-form__history-sig" src={h.signature} alt={`Chữ ký của ${h.toUser}`} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </form>

      <style>{`
        .asset-form__overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 12, 16, 0.6);
          display: flex;
          align-items: flex-end;
          z-index: 50;
        }
        .asset-form {
          width: 100%;
          max-height: 92vh;
          overflow-y: auto;
          background: var(--paper);
          color: var(--ink-text);
          border-radius: 20px 20px 0 0;
          padding: 18px 18px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .asset-form__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .asset-form__header h2 {
          margin: 0;
          font-family: "Space Grotesk", sans-serif;
          font-size: 18px;
        }
        .asset-form__close {
          background: none;
          border: none;
          font-size: 26px;
          line-height: 1;
          color: var(--ink-text-muted);
          cursor: pointer;
        }
        .asset-form__id-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--paper-dim);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 13px;
        }
        .asset-form__scan-btn {
          background: none;
          border: none;
          color: var(--accent-dim);
          font-weight: 600;
          font-size: 12.5px;
          cursor: pointer;
        }
        .asset-form label {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 12.5px;
          color: var(--ink-text-muted);
          font-weight: 500;
        }
        .asset-form input,
        .asset-form select,
        .asset-form textarea {
          font-family: inherit;
          font-size: 14px;
          padding: 10px 11px;
          border-radius: var(--radius-sm);
          border: 1px solid #ddd7c9;
          background: #fff;
          color: var(--ink-text);
        }
        .asset-form__row {
          display: flex;
          gap: 10px;
        }
        .asset-form__row label {
          flex: 1;
        }
        .asset-form__actions {
          display: flex;
          gap: 10px;
          margin-top: 6px;
        }
        .asset-form__delete {
          flex: 1;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--danger);
          background: none;
          color: var(--danger);
          font-weight: 600;
          cursor: pointer;
        }
        .asset-form__save {
          flex: 2;
          padding: 12px;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--accent);
          color: var(--ink);
          font-weight: 700;
          cursor: pointer;
        }
        .asset-form__handover-btn {
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--ink-text);
          background: none;
          color: var(--ink-text);
          font-weight: 600;
          font-size: 13.5px;
          cursor: pointer;
        }
        .asset-form__history {
          display: flex;
          flex-direction: column;
          gap: 10px;
          border-top: 1px solid #ddd7c9;
          padding-top: 12px;
        }
        .asset-form__history h3 {
          margin: 0;
          font-size: 12.5px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--ink-text-muted);
        }
        .asset-form__history-item {
          background: var(--paper-dim);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .asset-form__history-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          flex-wrap: wrap;
        }
        .asset-form__history-date {
          margin-left: auto;
          font-size: 11.5px;
          color: var(--ink-text-muted);
        }
        .asset-form__history-note {
          font-size: 12.5px;
          color: var(--ink-text-muted);
        }
        .asset-form__history-sig {
          height: 50px;
          align-self: flex-start;
          border-radius: 6px;
          background: #fff;
          border: 1px solid #ddd7c9;
        }
      `}</style>
    </div>
  )
}
