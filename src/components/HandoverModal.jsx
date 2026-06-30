import { useEffect, useRef, useState } from 'react'

function SignaturePad({ onChange }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const hasDrawn = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#1c2230'
  }, [])

  function pos(e) {
    const rect = canvasRef.current.getBoundingClientRect()
    const point = e.touches ? e.touches[0] : e
    return { x: point.clientX - rect.left, y: point.clientY - rect.top }
  }

  function start(e) {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  function move(e) {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = pos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    hasDrawn.current = true
  }

  function end() {
    drawing.current = false
    if (hasDrawn.current) {
      onChange(canvasRef.current.toDataURL('image/png'))
    }
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasDrawn.current = false
    onChange('')
  }

  return (
    <div className="sigpad">
      <canvas
        ref={canvasRef}
        className="sigpad__canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div className="sigpad__hint">Ký tên bằng ngón tay hoặc chuột vào khung trên</div>
      <button type="button" className="sigpad__clear" onClick={clear}>
        Xóa chữ ký
      </button>

      <style>{`
        .sigpad { display: flex; flex-direction: column; gap: 6px; }
        .sigpad__canvas {
          width: 100%;
          height: 140px;
          background: #fff;
          border: 1px dashed #c9c2b0;
          border-radius: var(--radius-sm);
          touch-action: none;
        }
        .sigpad__hint { font-size: 11.5px; color: var(--ink-text-muted); }
        .sigpad__clear {
          align-self: flex-start;
          background: none;
          border: none;
          color: var(--accent-dim);
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

export default function HandoverModal({ asset, onConfirm, onClose }) {
  const [toUser, setToUser] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [signature, setSignature] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!toUser.trim()) return
    onConfirm({
      id: `h-${Date.now()}`,
      date,
      fromUser: asset.assignee || '(Kho)',
      toUser: toUser.trim(),
      note: note.trim(),
      signature,
    })
  }

  return (
    <div className="handover__overlay" onClick={onClose}>
      <form className="handover" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="handover__header">
          <h2>Bàn giao tài sản</h2>
          <button type="button" onClick={onClose} aria-label="Đóng">×</button>
        </div>

        <div className="handover__asset">
          <span className="mono">{asset.id}</span>
          <span>{asset.name}</span>
        </div>

        <div className="handover__from-to">
          <div>
            <span className="handover__label">Từ</span>
            <span className="handover__value">{asset.assignee || '(Kho)'}</span>
          </div>
          <span className="handover__arrow">→</span>
          <div>
            <span className="handover__label">Đến</span>
            <input
              autoFocus
              required
              placeholder="Tên người nhận"
              value={toUser}
              onChange={(e) => setToUser(e.target.value)}
            />
          </div>
        </div>

        <label>
          Ngày bàn giao
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          Ghi chú bàn giao
          <textarea
            rows={2}
            placeholder="VD: tình trạng máy lúc bàn giao, phụ kiện đi kèm…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>

        <label>Chữ ký người nhận</label>
        <SignaturePad onChange={setSignature} />

        <button type="submit" className="handover__confirm">
          Xác nhận bàn giao
        </button>

        <style>{`
          .handover__overlay {
            position: fixed;
            inset: 0;
            background: rgba(10, 12, 16, 0.65);
            display: flex;
            align-items: flex-end;
            z-index: 70;
          }
          .handover {
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
          .handover__header {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .handover__header h2 {
            margin: 0;
            font-family: "Space Grotesk", sans-serif;
            font-size: 18px;
          }
          .handover__header button {
            background: none;
            border: none;
            font-size: 26px;
            line-height: 1;
            color: var(--ink-text-muted);
            cursor: pointer;
          }
          .handover__asset {
            display: flex;
            gap: 8px;
            font-size: 13px;
            background: var(--paper-dim);
            border-radius: var(--radius-sm);
            padding: 8px 12px;
          }
          .handover__asset .mono { color: var(--accent-dim); }
          .handover__from-to {
            display: flex;
            align-items: flex-end;
            gap: 10px;
          }
          .handover__from-to > div { flex: 1; display: flex; flex-direction: column; gap: 5px; }
          .handover__arrow { font-size: 18px; color: var(--ink-text-muted); padding-bottom: 10px; }
          .handover__label {
            font-size: 12px;
            color: var(--ink-text-muted);
            font-weight: 500;
          }
          .handover__value {
            font-size: 14px;
            padding: 10px 0 0;
          }
          .handover label {
            display: flex;
            flex-direction: column;
            gap: 5px;
            font-size: 12.5px;
            color: var(--ink-text-muted);
            font-weight: 500;
          }
          .handover input,
          .handover textarea {
            font-family: inherit;
            font-size: 14px;
            padding: 10px 11px;
            border-radius: var(--radius-sm);
            border: 1px solid #ddd7c9;
            background: #fff;
            color: var(--ink-text);
          }
          .handover__confirm {
            margin-top: 4px;
            padding: 13px;
            border-radius: var(--radius-sm);
            border: none;
            background: var(--accent);
            color: var(--ink);
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
          }
        `}</style>
      </form>
    </div>
  )
}
