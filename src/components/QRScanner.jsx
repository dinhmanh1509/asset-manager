import { useEffect, useRef, useState } from 'react'

export default function QRScanner({ onResult, onClose }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [supported, setSupported] = useState(true)
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let raf
    async function start() {
      if (!('BarcodeDetector' in window)) {
        setSupported(false)
        return
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play()
        }
        const detector = new window.BarcodeDetector({
          formats: ['qr_code', 'code_128', 'ean_13', 'code_39'],
        })
        const tick = async () => {
          if (videoRef.current && videoRef.current.readyState >= 2) {
            try {
              const codes = await detector.detect(videoRef.current)
              if (codes.length > 0) {
                onResult(codes[0].rawValue)
                return
              }
            } catch {
              /* ignore single-frame detection errors */
            }
          }
          raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      } catch {
        setError('Không truy cập được camera. Bạn có thể nhập mã thủ công bên dưới.')
      }
    }
    start()
    return () => {
      cancelAnimationFrame(raf)
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [onResult])

  return (
    <div className="scanner__overlay" onClick={onClose}>
      <div className="scanner" onClick={(e) => e.stopPropagation()}>
        <div className="scanner__header">
          <h2>Quét mã tài sản</h2>
          <button onClick={onClose} aria-label="Đóng">×</button>
        </div>

        {supported && !error ? (
          <div className="scanner__video-wrap">
            <video ref={videoRef} muted playsInline />
            <div className="scanner__frame" />
          </div>
        ) : (
          <p className="scanner__note">
            {error || 'Trình duyệt này chưa hỗ trợ quét mã trực tiếp. Nhập mã tài sản thủ công bên dưới.'}
          </p>
        )}

        <div className="scanner__manual">
          <input
            placeholder="Nhập mã thủ công, VD: TS-0006"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
          />
          <button
            onClick={() => manualCode.trim() && onResult(manualCode.trim())}
            disabled={!manualCode.trim()}
          >
            Dùng mã này
          </button>
        </div>
      </div>

      <style>{`
        .scanner__overlay {
          position: fixed;
          inset: 0;
          background: rgba(10, 12, 16, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          padding: 16px;
        }
        .scanner {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border-radius: var(--radius);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .scanner__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .scanner__header h2 {
          margin: 0;
          font-size: 16px;
          font-family: "Space Grotesk", sans-serif;
        }
        .scanner__header button {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 24px;
          cursor: pointer;
        }
        .scanner__video-wrap {
          position: relative;
          border-radius: var(--radius-sm);
          overflow: hidden;
          background: #000;
          aspect-ratio: 3 / 4;
        }
        .scanner__video-wrap video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .scanner__frame {
          position: absolute;
          inset: 18% 14%;
          border: 2px solid var(--accent);
          border-radius: 12px;
        }
        .scanner__note {
          font-size: 13px;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .scanner__manual {
          display: flex;
          gap: 8px;
        }
        .scanner__manual input {
          flex: 1;
          padding: 10px 11px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--surface-2);
          background: var(--ink);
          color: var(--text);
          font-size: 13px;
        }
        .scanner__manual button {
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--accent);
          color: var(--ink);
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
        }
        .scanner__manual button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  )
}
