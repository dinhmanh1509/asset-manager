import { useEffect, useState } from 'react'
import AssetList from './components/AssetList'
import AssetForm from './components/AssetForm'
import HandoverModal from './components/HandoverModal'
import QRScanner from './components/QRScanner'
import Reports from './components/Reports'
import {
  fetchAssets,
  upsertAsset,
  deleteAsset,
  subscribeToAssetChanges,
  nextAssetId,
  isSupabaseConfigured,
} from './data/store'

export default function App() {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [tab, setTab] = useState('list') // 'list' | 'reports'
  const [editing, setEditing] = useState(null) // asset being edited, or null
  const [showForm, setShowForm] = useState(false)
  const [scannerTarget, setScannerTarget] = useState(null) // callback to receive scanned code
  const [handoverAsset, setHandoverAsset] = useState(null) // asset currently being handed over

  async function reload() {
    try {
      const data = await fetchAssets()
      setAssets(data)
      setErrorMsg('')
    } catch (err) {
      setErrorMsg('Không tải được dữ liệu từ Supabase. Kiểm tra lại cấu hình .env và kết nối mạng.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // Tự tải lại khi có thiết bị khác thêm/sửa/xóa tài sản
    const unsubscribe = subscribeToAssetChanges(() => reload())
    return unsubscribe
  }, [])

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(asset) {
    setEditing(asset)
    setShowForm(true)
  }

  async function handleSave(asset) {
    try {
      await upsertAsset(asset)
      await reload()
      setShowForm(false)
    } catch (err) {
      setErrorMsg('Lưu tài sản thất bại. Thử lại sau.')
      console.error(err)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteAsset(id)
      await reload()
      setShowForm(false)
    } catch (err) {
      setErrorMsg('Xóa tài sản thất bại. Thử lại sau.')
      console.error(err)
    }
  }

  function handleScanResult(code) {
    if (scannerTarget) scannerTarget(code)
    setScannerTarget(null)
  }

  async function handleHandoverConfirm(record) {
    try {
      const updated = {
        ...handoverAsset,
        assignee: record.toUser,
        status: 'in-use',
        history: [...(handoverAsset.history || []), record],
      }
      await upsertAsset(updated)
      await reload()
      setHandoverAsset(null)
      setShowForm(false)
    } catch (err) {
      setErrorMsg('Bàn giao thất bại. Thử lại sau.')
      console.error(err)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo display">📦 Kho Tài Sản</span>
        <span className="app__tagline">
          Quản lý tài sản công ty
          {isSupabaseConfigured ? (
            <span className="app__sync-badge app__sync-badge--on">● Đã đồng bộ</span>
          ) : (
            <span className="app__sync-badge app__sync-badge--off">● Chỉ lưu trên máy này</span>
          )}
        </span>
      </header>

      {errorMsg && <div className="app__error">{errorMsg}</div>}

      <main className="app__main">
        {loading ? (
          <div className="app__loading">Đang tải dữ liệu…</div>
        ) : tab === 'list' ? (
          <AssetList assets={assets} onSelect={openEdit} onAddNew={openNew} />
        ) : (
          <Reports assets={assets} />
        )}
      </main>

      <nav className="app__nav">
        <button className={tab === 'list' ? 'active' : ''} onClick={() => setTab('list')}>
          <span>📋</span>
          Danh sách
        </button>
        <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
          <span>📊</span>
          Báo cáo
        </button>
      </nav>

      {showForm && (
        <AssetForm
          initial={editing}
          generatedId={nextAssetId(assets)}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setShowForm(false)}
          onScanRequest={(cb) => setScannerTarget(() => cb)}
          onHandoverRequest={(asset) => setHandoverAsset(asset)}
        />
      )}

      {handoverAsset && (
        <HandoverModal
          asset={handoverAsset}
          onConfirm={handleHandoverConfirm}
          onClose={() => setHandoverAsset(null)}
        />
      )}

      {scannerTarget && (
        <QRScanner onResult={handleScanResult} onClose={() => setScannerTarget(null)} />
      )}

      <style>{`
        .app {
          max-width: 480px;
          margin: 0 auto;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--ink);
        }
        .app__header {
          padding: 18px 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          border-bottom: 1px solid var(--surface-2);
        }
        .app__logo {
          font-size: 19px;
          font-weight: 700;
        }
        .app__tagline {
          font-size: 12px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .app__sync-badge {
          font-size: 11px;
          font-weight: 600;
        }
        .app__sync-badge--on { color: var(--ok); }
        .app__sync-badge--off { color: var(--warn); }
        .app__error {
          margin: 10px 14px 0;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          background: rgba(239, 91, 91, 0.12);
          border: 1px solid var(--danger);
          color: var(--danger);
          font-size: 12.5px;
        }
        .app__loading {
          padding: 60px 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 13px;
        }
        .app__main {
          flex: 1;
        }
        .app__nav {
          position: sticky;
          bottom: 0;
          display: flex;
          background: var(--surface);
          border-top: 1px solid var(--surface-2);
        }
        .app__nav button {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 10px 0 12px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 11.5px;
          cursor: pointer;
        }
        .app__nav button span {
          font-size: 18px;
        }
        .app__nav button.active {
          color: var(--accent);
        }
      `}</style>
    </div>
  )
}
