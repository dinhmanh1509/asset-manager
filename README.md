# Kho Tài Sản — App quản lý tài sản công ty

App web (chạy tốt trên điện thoại qua trình duyệt) với 4 tính năng:
- Danh sách tài sản, tìm kiếm theo tên/mã/người dùng, lọc theo danh mục và trạng thái
- Thêm / sửa / xóa tài sản
- Quét mã QR/barcode bằng camera điện thoại (dùng BarcodeDetector của trình duyệt; nếu thiết bị chưa hỗ trợ, có ô nhập mã thủ công)
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

Bản demo này lưu dữ liệu bằng `localStorage` của trình duyệt — nghĩa là dữ liệu chỉ nằm trên 1 thiết bị/trình duyệt, **chưa dùng chung được cho nhiều nhân viên cùng lúc**. Đây là cách nhanh nhất để bạn xem giao diện và luồng thao tác hoạt động ra sao.

Để dùng thật trong công ty (nhiều người cùng truy cập, dữ liệu đồng bộ), bước tiếp theo là thay thế các hàm trong `src/data/store.js` bằng việc gọi tới một database thật, ví dụ Supabase hoặc Firebase (cả hai đều có gói miễn phí, dễ tích hợp với React). Khi bạn sẵn sàng, mình có thể hướng dẫn/code tiếp phần này.

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
