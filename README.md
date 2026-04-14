# 📊 Ads2Sheet Lite

> Công cụ tự động lấy dữ liệu **Facebook Ads** về **Google Sheets** — không cần server, không cần code.

**By Hồ Ngọc Cương** | [cuongbig.com](https://cuongbig.com) | [Facebook](https://www.facebook.com/cuongbigdigi) | cuongbig.info@gmail.com

---

## ✨ Tính năng

| Tính năng | Chi tiết |
|---|---|
| 🟢 Real-time | Đồng bộ dữ liệu FB Ads về Sheet chính xác, tức thì |
| 📊 34+ chỉ số | Spend, CPM, CPC, CTR, Reach, Comments, Purchases... |
| 📋 Báo cáo | Hỗ trợ làm báo cáo và xây dựng Dashboard |
| 🔒 Auto Backup | Tài khoản bị khóa, lịch sử ads cũ vẫn không mất data |
| 🌙 Chốt sổ 3h sáng | Tự động bù data 23:00–23:59 bị thiếu |
| 🚀 Giải phóng Ads thủ | Chấm dứt báo cáo thủ công, tập trung phân tích & tối ưu |

---

## 📊 So sánh Lite vs Full

| Tính năng | 🆓 Lite (bản này) | ⭐ Full |
|---|:---:|:---:|
| Lấy data FB Ads về Sheet | ✅ | ✅ |
| 34+ chỉ số hiệu suất | ✅ | ✅ |
| Chốt sổ tự động 3h sáng | ✅ | ✅ |
| Số tài khoản quảng cáo | **Tối đa 3** | **Không giới hạn** |
| Dashboard trực quan | ❌ | ✅ |
| Cập nhật mỗi 15–30 phút | ❌ | ✅ |
| **Cảnh báo Email tự động** | ❌ | ✅ |
| Cảnh báo tài khoản không chi tiêu | ❌ | ✅ |
| Cảnh báo quảng cáo bị từ chối | ❌ | ✅ |
| Cảnh báo vượt ngân sách | ❌ | ✅ |
| Cảnh báo ngưỡng thanh toán | ❌ | ✅ |
| Quy tắc cảnh báo tùy chỉnh | ❌ | ✅ |
| Bật/Tắt quảng cáo ngay trên Sheet | ❌ | ✅ |
| Sửa ngân sách Adset ngay trên Sheet | ❌ | ✅ |
| Sao lưu Datamaster tự động | ❌ | ✅ |
| Trích xuất bình luận & email | ❌ | ✅ |
| Cấu hình cột tag tùy chỉnh | ❌ | ✅ |
| Hỗ trợ | Cộng đồng | **Ưu tiên** |

> 💬 **Muốn dùng bản Full?** Liên hệ **Hồ Ngọc Cương**:
> - Facebook: [facebook.com/cuongbigdigi](https://www.facebook.com/cuongbigdigi)
> - Email: cuongbig.info@gmail.com
> - Website: [cuongbig.com](https://cuongbig.com)

---

## 📦 Hướng dẫn cài đặt

### Bước 1 — Chuẩn bị Google Sheet

- Vào [Google Sheets](https://sheets.google.com) → tạo một **Sheet mới** hoặc dùng file Sheet cũ đều được
- 💡 **Khuyến nghị:** Nên tạo một file Sheet riêng để dễ quản lý và tránh ảnh hưởng dữ liệu hiện có

---

### Bước 2 — Mở Apps Script

- Trên menu Sheet: **Tiện ích mở rộng (Extensions) → Apps Script**
- Một tab mới mở ra với editor code

---

### Bước 3 — Paste code vào

1. Vào repo này, mở file [`ads2sheetlite_nokey.gs`](./ads2sheetlite_nokey.gs)
2. Nhấn **Copy raw file** (icon copy góc phải)
3. Quay lại Apps Script editor → **bôi đen toàn bộ code mặc định** (`Ctrl+A`) → **Xóa** → **Paste code vào** (`Ctrl+V`)
4. Nhấn **Save** (`Ctrl+S`)

---

### Bước 4 — Quay lại Sheet và cấp quyền

> ⚠️ **Bước này bắt buộc khi chạy lần đầu** — Google yêu cầu bạn xác nhận quyền truy cập.

1. **Reload** lại trang Google Sheet (F5)
2. Trên menu xuất hiện: **📊 Ads2Sheet Lite** → nhấn **🚀 Bắt đầu & Cài đặt**
3. Google sẽ hiện hộp thoại **"Ứng dụng này chưa được xác minh"** (Authorization required)

**Cách xử lý hộp thoại cấp quyền:**

```
① Nhấn "Advanced" (hoặc "Nâng cao")
② Nhấn "Go to [tên sheet] (unsafe)"  ← Nhấn vào dòng chữ này
③ Xem qua các quyền được yêu cầu
④ Nhấn "Allow" (Cho phép)
```

> 🔐 **Tại sao phải làm vậy?**
>
> Đây **KHÔNG phải** ứng dụng của bên thứ ba. Đây là code do **chính bạn tự cài** vào Sheet của bạn,
> chạy hoàn toàn trên hạ tầng Google của bạn.
>
> Google hiển thị cảnh báo vì code chưa qua quy trình xét duyệt chính thức (tốn vài trăm USD và nhiều tuần).
> Bạn đang cấp quyền cho **chính Sheet của mình** truy cập **chính tài khoản Google của mình**.
> Không có bất kỳ dữ liệu nào được gửi ra ngoài. Mã nguồn 100% công khai tại repo này để bạn tự kiểm tra.

---

### Bước 5 — Cài đặt token & chọn tài khoản

Sau khi cấp quyền, dialog **Cài Đặt Ads2Sheet Lite** hiện ra:

**Bước 5.1 — Nhập Facebook Access Token:**
- Dán token vào ô **Facebook Access Token**
- Nhấn **"Kiểm tra Token & Tải tài khoản"**
- Tool sẽ kết nối Facebook API và liệt kê danh sách tài khoản ads của bạn

> Chưa có token? Xem hướng dẫn lấy token bên dưới ↓

**Bước 5.2 — Chọn tài khoản:**
- Tick chọn tối đa **3 tài khoản** cần theo dõi
- Nhấn **"Lưu cấu hình & Kích hoạt"**
- Nhấn **"✅ Đóng cửa sổ"**

✅ **Xong!** Tool sẽ tự động chạy theo lịch.

---

## 🔑 Lấy Facebook Access Token

### Cách 1 — Dùng Graph API Explorer (Dễ nhất)

1. Vào [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer/)
2. Đăng nhập tài khoản Facebook Business của bạn
3. Nhấn **"Generate Access Token"**
4. Cấp quyền: `ads_read`, `ads_management` (tối thiểu)
5. Copy token và paste vào tool

### Cách 2 — Dùng token từ Business Manager

1. Vào [business.facebook.com](https://business.facebook.com)
2. Vào **Settings → Business Settings → System Users**
3. Tạo system user và generate token với quyền `ads_read`

> ⏱️ Token thường có hạn **60 ngày**. Khi hết hạn, chạy lại **"🚀 Bắt đầu & Cài đặt"** và nhập token mới.

---

## 📱 Menu chức năng

```
📊 Ads2Sheet Lite
  ├── 🚀 Bắt đầu & Cài đặt          ← Cài đặt lần đầu / đổi token / đổi tài khoản
  ├── 📊 Cập nhật dữ liệu hôm nay   ← Lấy data ngay lập tức
  ├── 📅 Cập nhật dữ liệu trước đây ← Chọn khoảng ngày tùy ý, lấy data lịch sử
  └── ⭐ By Hồ Ngọc Cương
        └── ℹ️ Thông tin & Góp ý
```

---

## ⏰ Lịch chạy tự động

| Trigger | Thời gian | Mục đích |
|---|---|---|
| ⏱️ Real-time | Mỗi 1 giờ | Cập nhật data trong ngày |
| 🌙 Chốt sổ | 3:00 AM hàng ngày | Bù đầy data 23:00–23:59 bị thiếu |

---

## ⚠️ Giới hạn phiên bản Lite

- Tối đa **3 tài khoản** quảng cáo đồng thời
- Token Facebook cần làm mới khi hết hạn (~60 ngày)
- Không có Dashboard, cảnh báo email, hay các tính năng nâng cao

---

## 📝 Changelog

### v1.0 (04/2025)
- 🎉 Ra mắt phiên bản Lite NoKey
- ✅ Lưu cấu hình qua PropertiesService (không cần sheet phụ)
- ✅ Giao diện cài đặt 2 bước (token → chọn tài khoản)
- ✅ Trigger tự động: 1h/lần + chốt sổ 3h sáng
- ✅ Hỗ trợ tối đa 3 tài khoản

---

*Mọi góp ý & báo lỗi: cuongbig.info@gmail.com*
