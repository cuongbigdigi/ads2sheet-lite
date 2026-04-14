# Ads2Sheet Lite

> Công cụ tự động lấy dữ liệu **Facebook Ads** về **Google Sheets** — không cần server, không cần code.

**By Hồ Ngọc Cương** | [cuongbig.com](https://cuongbig.com) | [Facebook](https://www.facebook.com/cuongbigdigi) | cuongbig.info@gmail.com

---

## ✨ Tính năng

| Tính năng | Chi tiết |
|---|---|
| 🟢 Real-time | Đồng bộ dữ liệu FB Ads về Sheet chính xác, tức thì |
| 📊 34+ chỉ số | Spend, CPM, CPC, CTR, Reach, Comments, Purchases... |
| 📋 Báo cáo | Hỗ trợ làm báo cáo và xây dựng Dashboard |
| 🔒 Auto Backup | Lịch sử ads cũ, tài khoản bị khóa vẫn không mất data |
| 🌙 Chốt sổ 3h sáng | Tự động bù data 23:00-23:59 bị thiếu |
| 🚀 Giải phóng Ads thủ | Chấm dứt báo cáo thủ công |

## 📦 Cài đặt

### 1. Mở Google Sheets
- Tạo một **Google Sheet mới**

### 2. Mở Apps Script
- Vào menu **Extensions → Apps Script**
- Xóa toàn bộ code mặc định

### 3. Paste code
- Copy toàn bộ nội dung file [`ads2sheetlite_nokey.gs`](./ads2sheetlite_nokey.gs)
- Paste vào Apps Script editor
- Nhấn **Save** (Ctrl+S)

### 4. Chạy lần đầu
- Reload Google Sheet
- Trên menu xuất hiện: **📊 Ads2Sheet Lite**
- Nhấn **🚀 Bắt đầu & Cài đặt**
- Điền Facebook Access Token và chọn tài khoản

### 5. Tự động hoạt động
Sau khi cài đặt, tool tự cài 2 trigger:
- ⏱️ **Cập nhật mỗi 1 giờ** — data real-time
- 🌙 **Chốt sổ 3h sáng** — bù data cuối ngày

---

## 🔑 Lấy Facebook Access Token

1. Vào [Facebook Business Suite](https://business.facebook.com)
2. Hoặc dùng [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
3. Copy token và paste vào dialog cài đặt

> **Bảo mật:** Token chỉ lưu trong Google Sheet của bạn, không truyền đến bất kỳ máy chủ nào khác. Mã nguồn 100% công khai.

---

## 📱 Menu chức năng

```
📊 Ads2Sheet Lite
  ├── 🚀 Bắt đầu & Cài đặt      ← Cài đặt lần đầu / cấu hình lại
  ├── 📊 Cập nhật dữ liệu hôm nay ← Lấy data ngay
  ├── 📅 Cập nhật dữ liệu trước đây ← Lấy data khoảng ngày tùy chọn
  └── ⭐ By Hồ Ngọc Cương
        └── ℹ️ Thông tin & Góp ý
```

---

## ⚠️ Giới hạn phiên bản Lite

- Tối đa **3 tài khoản** quảng cáo
- Cần tự refresh token khi hết hạn (thường 60 ngày)

---

## 📝 Changelog

### v1.0 (2025-04)
- 🎉 Ra mắt phiên bản Lite NoKey
- ✅ Lưu cấu hình qua PropertiesService (không cần sheet phụ)
- ✅ Giao diện cài đặt 2 bước
- ✅ Trigger tự động 1h/lần + chốt sổ 3h sáng

---

*Mọi góp ý: cuongbig.info@gmail.com*
