// Lớp lưu trữ dữ liệu.
// Nếu đã cấu hình Supabase (qua file .env), mọi thao tác đọc/ghi đi thẳng tới
// database thật, nhiều thiết bị dùng chung sẽ tự đồng bộ qua Realtime.
// Nếu CHƯA cấu hình Supabase, app tự rơi về lưu bằng localStorage (chỉ trên
// 1 thiết bị) để vẫn xem được giao diện khi chạy thử nhanh.

import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const STORAGE_KEY = 'asset-manager:assets'

export const CATEGORIES = ['Thiết bị IT', 'Nội thất', 'Phương tiện', 'Máy móc', 'Khác']
export const STATUSES = [
  { value: 'in-use', label: 'Đang sử dụng', color: 'var(--ok)' },
  { value: 'storage', label: 'Trong kho', color: 'var(--text-muted)' },
  { value: 'repair', label: 'Đang sửa', color: 'var(--warn)' },
  { value: 'retired', label: 'Đã thanh lý', color: 'var(--danger)' },
]

export { isSupabaseConfigured }

function seedData() {
  return [
    {
      id: 'TS-0001',
      name: 'Laptop Dell Latitude 5440',
      category: 'Thiết bị IT',
      status: 'in-use',
      assignee: 'Nguyễn Văn A',
      location: 'Phòng IT - Tầng 3',
      purchaseDate: '2024-03-12',
      value: 22000000,
      note: '',
      history: [
        {
          id: 'h-seed-1',
          date: '2024-03-12',
          fromUser: '(Kho)',
          toUser: 'Nguyễn Văn A',
          note: 'Bàn giao khi nhận máy mới',
          signature: '',
        },
      ],
    },
    {
      id: 'TS-0002',
      name: 'Bàn làm việc gỗ công nghiệp',
      category: 'Nội thất',
      status: 'in-use',
      assignee: 'Trần Thị B',
      location: 'Phòng Kế toán',
      purchaseDate: '2023-08-01',
      value: 1800000,
      note: '',
      history: [],
    },
    {
      id: 'TS-0003',
      name: 'Máy chiếu Epson EB-X06',
      category: 'Thiết bị IT',
      status: 'storage',
      assignee: '',
      location: 'Kho tầng 1',
      purchaseDate: '2022-11-20',
      value: 9500000,
      note: 'Bóng đèn còn khoảng 60% tuổi thọ',
      history: [],
    },
    {
      id: 'TS-0004',
      name: 'Xe nâng tay 2 tấn',
      category: 'Máy móc',
      status: 'repair',
      assignee: '',
      location: 'Kho hàng B',
      purchaseDate: '2021-05-09',
      value: 15000000,
      note: 'Hỏng bánh xe, đang chờ phụ tùng',
      history: [],
    },
    {
      id: 'TS-0005',
      name: 'Ô tô bán tải Ford Ranger',
      category: 'Phương tiện',
      status: 'in-use',
      assignee: 'Lê Văn C',
      location: 'Bãi xe công ty',
      purchaseDate: '2020-01-15',
      value: 650000000,
      note: '',
      history: [],
    },
  ]
}

export function nextAssetId(assets) {
  const nums = assets
    .map((a) => parseInt(a.id.replace('TS-', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `TS-${String(max + 1).padStart(4, '0')}`
}

// ---------- Chuyển đổi giữa định dạng app (camelCase) và bảng Supabase (snake_case) ----------

function rowToAsset(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    status: row.status,
    assignee: row.assignee || '',
    location: row.location || '',
    purchaseDate: row.purchase_date || '',
    value: Number(row.value) || 0,
    note: row.note || '',
    history: row.history || [],
  }
}

function assetToRow(asset) {
  return {
    id: asset.id,
    name: asset.name,
    category: asset.category,
    status: asset.status,
    assignee: asset.assignee || '',
    location: asset.location || '',
    purchase_date: asset.purchaseDate || null,
    value: Number(asset.value) || 0,
    note: asset.note || '',
    history: asset.history || [],
  }
}

// ---------- Phương án localStorage (khi chưa cấu hình Supabase) ----------

function localLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedData()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw).map((a) => ({ history: [], ...a }))
  } catch {
    return seedData()
  }
}

function localSaveAll(assets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
}

// ---------- API thống nhất dùng trong App.jsx ----------

export async function fetchAssets() {
  if (!isSupabaseConfigured) return localLoad()
  const { data, error } = await supabase
    .from('assets')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (data.length === 0) {
    // Bảng trống lần đầu: nạp dữ liệu mẫu để dễ hình dung
    const seeded = seedData()
    await supabase.from('assets').insert(seeded.map(assetToRow))
    return seeded
  }
  return data.map(rowToAsset)
}

export async function upsertAsset(asset) {
  if (!isSupabaseConfigured) {
    const all = localLoad()
    const exists = all.some((a) => a.id === asset.id)
    const next = exists ? all.map((a) => (a.id === asset.id ? asset : a)) : [asset, ...all]
    localSaveAll(next)
    return asset
  }
  const { error } = await supabase.from('assets').upsert(assetToRow(asset))
  if (error) throw error
  return asset
}

export async function deleteAsset(id) {
  if (!isSupabaseConfigured) {
    localSaveAll(localLoad().filter((a) => a.id !== id))
    return
  }
  const { error } = await supabase.from('assets').delete().eq('id', id)
  if (error) throw error
}

// Lắng nghe thay đổi realtime từ thiết bị khác (chỉ hoạt động khi có Supabase).
// Gọi callback() để App tải lại danh sách mới nhất.
export function subscribeToAssetChanges(callback) {
  if (!isSupabaseConfigured) return () => {}
  const channel = supabase
    .channel('assets-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, callback)
    .subscribe()
  return () => supabase.removeChannel(channel)
}
