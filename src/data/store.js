// Lớp lưu trữ dữ liệu. Hiện dùng localStorage để chạy demo không cần backend.
// Khi triển khai thật cho nhiều người dùng cùng lúc, thay các hàm bên dưới
// bằng các lệnh gọi API tới database thật (Supabase/Firebase/...).

const STORAGE_KEY = 'asset-manager:assets'

export const CATEGORIES = ['Thiết bị IT', 'Nội thất', 'Phương tiện', 'Máy móc', 'Khác']
export const STATUSES = [
  { value: 'in-use', label: 'Đang sử dụng', color: 'var(--ok)' },
  { value: 'storage', label: 'Trong kho', color: 'var(--text-muted)' },
  { value: 'repair', label: 'Đang sửa', color: 'var(--warn)' },
  { value: 'retired', label: 'Đã thanh lý', color: 'var(--danger)' },
]

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
    },
  ]
}

export function loadAssets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedData()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
    return JSON.parse(raw)
  } catch {
    return seedData()
  }
}

export function saveAssets(assets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets))
}

export function nextAssetId(assets) {
  const nums = assets
    .map((a) => parseInt(a.id.replace('TS-', ''), 10))
    .filter((n) => !Number.isNaN(n))
  const max = nums.length ? Math.max(...nums) : 0
  return `TS-${String(max + 1).padStart(4, '0')}`
}
