import { useState } from 'react'
import AssetList from './components/AssetList'
import AssetForm from './components/AssetForm'
import HandoverModal from './components/HandoverModal'
import QRScanner from './components/QRScanner'
import Reports from './components/Reports'
import { loadAssets, saveAssets, nextAssetId } from './data/store'

export default function App() {
  const [assets, setAssets] = useState(loadAssets)
  const [tab, setTab] = useState('list') // 'list' | 'reports'
  const [editing, setEditing] = useState(null) // asset being edited, or null
  const [showForm, setShowForm] = useState(false)
  const [scannerTarget, setScannerTarget] = useState(null) // callback to receive scanned code
  const [handoverAsset, setHandoverAsset] = useState(null) // asset currently being handed over

  function persist(next) {
    setAssets(next)
    saveAssets(next)
  }

  function openNew() {
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(asset) {
    setEditing(asset)
    setShowForm(true)
  }

  function handleSave(asset) {
    const exists = assets.some((a) => a.id === asset.id)
    const next = exists
      ? assets.map((a) => (a.id === asset.id ? asset : a))
      : [asset, ...assets]
    persist(next)
    setShowForm(false)
  }

  function handleDelete(id) {
    persist(assets.filter((a) => a.id !== id))
    setShowForm(false)
  }

  function handleScanResult(code) {
    if (scannerTarget) scannerTarget(code)
    setScannerTarget(null)
  }

  function handleHandoverConfirm(record) {
    const next = assets.map((a) =>
      a.id === handoverAsset.id
        ? {
            ...a,
            assignee: record.toUser,
            status: 'in-use',
            history: [...(a.history || []), record],
          }
        : a
    )
    persist(next)
    setHandoverAsset(null)
    setShowForm(false)
  }

  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo display">📦 Kho Tài Sản</span>
        <span className="app__tagline">Quản lý tài sản công ty</span>
      </header>

      <main className="app__main">
        {tab === 'list' ? (
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
