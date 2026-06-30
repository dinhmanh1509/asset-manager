# Kho Tài Sản — App quản lý tài sản công ty

App web (chạy tốt trên điện thoại qua trình duyệt) với 4 tính năng:
- Danh sách tài sản, tìm kiếm theo tên/mã/người dùng, lọc theo danh mục và trạng thái
- Thêm / sửa / xóa tài sản
- Quét mã QR/barcode bằng camera điện thoại (dùng BarcodeDetector của trình duyệt; nếu thiết bị chưa hỗ trợ, có ô nhập mã thủ công)
- Bàn giao tài sản: chuyển người sử dụng, ký tên xác nhận, lưu lịch sử
- Đính kèm ảnh thực tế của tài sản (chụp trực tiếp bằng camera điện thoại hoặc chọn ảnh có sẵn)
- Báo cáo: tổng giá trị, thống kê theo trạng thái/danh mục, xuất file Excel (.xlsx)

## Chạy thử trên máy tính

Yêu cầu: đã cài Node.js (bản 18 trở lên). Tải tại https://nodejs.org nếu chưa có.

```bash
cd asset-manager
npm install
npm run dev
```

Mở địa chỉ hiện ra trong terminal (thường là http://localhost:5173).

## Xem trên điện thoại (cùng mạng wifi với máy tính)

Sau khi chạy `npm run dev`, terminal sẽ hiện thêm một địa chỉ dạng `http://192.168.x.x:5173` (Network). Mở địa chỉ đó trên trình duyệt điện thoại (cùng wifi với máy tính). Quét QR sẽ cần cấp quyền camera cho trình duyệt.

## Lưu ý quan trọng về dữ liệu

App hỗ trợ 2 chế độ lưu dữ liệu:

- **Chưa cấu hình Supabase**: dữ liệu lưu bằng `localStorage` của trình duyệt, chỉ nằm trên 1 thiết bị, không dùng chung được. Dùng để xem nhanh giao diện.
- **Đã cấu hình Supabase**: dữ liệu lưu trên database thật, mọi thiết bị mở app đều thấy chung dữ liệu, tự đồng bộ ngay khi có người khác thêm/sửa/xóa (qua Realtime). Đầu trang app sẽ hiện chữ "● Đã đồng bộ" màu xanh khi bật đúng.

### Cách bật chế độ đồng bộ (Supabase)

1. Tạo project miễn phí tại https://supabase.com (đăng nhập bằng GitHub).
2. Vào **SQL Editor**, chạy nội dung file `supabase-schema.sql` đi kèm trong thư mục này (tạo bảng `assets` + bật chia sẻ realtime).
3. Vào **Storage** (thanh bên trái) → **New bucket** → đặt tên đúng `asset-photos` → bật **Public bucket** → **Create bucket**. Đây là nơi lưu ảnh tài sản.
3. Vào **Project Settings → API**, copy 2 giá trị: **Project URL** và **anon public key**.
4. Trong thư mục project, copy file `.env.example` thành `.env` (file mới, bỏ chữ `.example`), điền 2 giá trị vừa copy vào:
   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```
5. Chạy lại `npm install` rồi `npm run dev`. Đầu trang sẽ hiện "● Đã đồng bộ" nếu cấu hình đúng.

**Khi deploy lên Vercel**, thêm 2 biến môi trường trên vào project: vào project trên Vercel → **Settings → Environment Variables**, thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` với giá trị tương ứng, rồi **Redeploy**.

File `.env` đã được thêm vào `.gitignore` nên sẽ không bị đẩy nhầm lên GitHub — đây là điều nên làm vì file này chứa thông tin kết nối tới database của bạn.

## Đưa lên mạng để cả công ty dùng được qua link

1. Đẩy code lên GitHub.
2. Vào https://vercel.com, đăng nhập bằng GitHub, chọn "Import" repo này.
3. Vercel tự build và cho bạn một link, ví dụ `kho-tai-san.vercel.app`. Nhân viên mở link này trên điện thoại, có thể chọn "Add to Home Screen" để dùng như app thật.

## Cấu trúc project

```
src/
  App.jsx              điều hướng chính (Danh sách / Báo cáo)
  data/store.js         dữ liệu mẫu + lưu trữ (thay bằng API thật khi triển khai)
  components/
    AssetList.jsx        danh sách + tìm kiếm/lọc
    AssetCard.jsx         "tem nhãn" hiển thị 1 tài sản
    AssetForm.jsx          form thêm/sửa/xóa
    QRScanner.jsx           quét QR/barcode
    Reports.jsx              thống kê + xuất Excel
```
