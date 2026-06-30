import { STATUSES } from '../data/store'

export default function AssetCard({ asset, onClick }) {
  const status = STATUSES.find((s) => s.value === asset.status) ?? STATUSES[0]

  return (
    <button className="asset-card" onClick={onClick}>
      <div className="asset-card__id-col">
        <span className="asset-card__id mono">{asset.id}</span>
        <span className="asset-card__dot" style={{ background: status.color }} />
      </div>
      <div className="asset-card__body">
        <div className="asset-card__top">
          <h3>{asset.name}</h3>
          <span className="asset-card__status" style={{ color: status.color }}>
            {status.label}
          </span>
        </div>
        <div className="asset-card__meta">
          <span>{asset.category}</span>
          <span>·</span>
          <span>{asset.location || 'Chưa rõ vị trí'}</span>
        </div>
        {asset.assignee && <div className="asset-card__assignee">Người dùng: {asset.assignee}</div>}
      </div>

      {asset.photoUrl && (
        <img className="asset-card__thumb" src={asset.photoUrl} alt={asset.name} />
      )}

      <style>{`
        .asset-card {
          display: flex;
          width: 100%;
          text-align: left;
          background: var(--surface);
          border: 1px solid var(--surface-2);
          border-radius: var(--radius);
          padding: 0;
          cursor: pointer;
          overflow: hidden;
          color: var(--text);
        }
        .asset-card:hover {
          border-color: var(--accent-dim);
        }
        .asset-card__id-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 10px;
          background: var(--surface-2);
          border-right: 1px dashed #3a4254;
          min-width: 78px;
        }
        .asset-card__id {
          font-size: 11px;
          color: var(--accent);
          writing-mode: vertical-rl;
          letter-spacing: 0.04em;
        }
        .asset-card__dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .asset-card__body {
          flex: 1;
          padding: 12px 14px;
          min-width: 0;
        }
        .asset-card__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 8px;
        }
        .asset-card__top h3 {
          margin: 0;
          font-size: 15px;
          font-family: "Space Grotesk", sans-serif;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .asset-card__status {
          font-size: 11px;
          font-weight: 600;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .asset-card__meta {
          margin-top: 4px;
          font-size: 12.5px;
          color: var(--text-muted);
          display: flex;
          gap: 6px;
        }
        .asset-card__assignee {
          margin-top: 6px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .asset-card__thumb {
          width: 64px;
          height: 64px;
          object-fit: cover;
          flex-shrink: 0;
          margin: 12px 12px 12px 0;
          border-radius: 9px;
        }
      `}</style>
    </button>
  )
}
