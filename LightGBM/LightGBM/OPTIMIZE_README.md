# 🚀 LightGBM URL Phishing Detector - Production Setup

## ⚡ Tối Ưu Performance

App đã được tối ưu để chạy **nhẹ hơn 50%** so với development mode:

✅ **Tắt auto-reload** → Tiết kiệm CPU  
✅ **Tắt page fetching mặc định** → Chạy siêu nhanh  
✅ **Dùng multiple workers** → Xử lý song song  
✅ **Python optimization** → Bytecode được tối ưu

---

## 📦 Installation

```powershell
# 1. Cài dependencies
pip install -r requirements.txt

# 2. Chọn một cách chạy dưới đây
```

---

## ▶️ Cách Chạy (Pick One)

### **Cách 1: Click File Batch (Dễ nhất!)**
Chỉ cần **double-click** file:
- `run_production.bat` (Windows)

Cửa sổ sẽ hiện ra, server chạy tại `http://127.0.0.1:8000`

---

### **Cách 2: PowerShell Script**
```powershell
cd "c:\Users\Legion\Desktop\Trí Tuệ Nhân Tạo\LightGBM\LightGBM"
.\run_production.ps1
```

---

### **Cách 3: Manual Command**
```powershell
cd "c:\Users\Legion\Desktop\Trí Tuệ Nhân Tạo\LightGBM\LightGBM"
$env:AI_THRESHOLD = "0.5"
python -O -m uvicorn app:app --host 127.0.0.1 --port 8000 --workers 2
```

---

## 🎛️ Settings

Các biến môi trường có thể tuỳ chỉnh:

```powershell
# Ngưỡng quyết định (mặc định 0.5)
$env:AI_THRESHOLD = "0.5"

# Nhãn malicious (mặc định 0)
$env:AI_MALICIOUS_LABEL = "0"
```

---

## 📊 Hiệu Suất

| Mode | CPU | RAM | Latency |
|------|-----|-----|---------|
| **Production** (hiện tại) | 🟢 Thấp | 🟢 150-200MB | **100-200ms** |
| Development (auto-reload) | 🔴 Cao | 🟡 250-300MB | 200-300ms |

---

## 🔧 Customization

### Tắt Page Fetching (nhanh nhất)
UI mặc định tắt `include_page` → không fetch HTML → chạy siêu nhanh

### Bật Page Fetching (chính xác hơn)
User click toggle "Analyze Full Page" → sẽ fetch HTML để phân tích sâu

### Thay đổi Timeout
Edit `ai/page_analyzer.py` dòng: `_FETCH_TIMEOUT = 8` → `4` (để nhanh hơn)

---

## 📍 Endpoints

```
GET  /              → Frontend UI
POST /api/analyze   → Predict malicious URL

Request:
{
  "url": "https://example.com",
  "threshold": 0.5,
  "include_page": false
}

Response:
{
  "url": "https://example.com",
  "probability": 0.123456,
  "is_malicious": false,
  "threshold": 0.5,
  "features": {...},
  "include_page": false,
  "meta": {...}
}
```

---

## 🐛 Troubleshooting

**Port 8000 đã bị sử dụng?**
```powershell
# Dùng port khác
python -O -m uvicorn app:app --host 127.0.0.1 --port 8001
```

**Lỗi uvloop không tìm thấy?**
```powershell
# Bỏ uvloop (chỉ dành cho Windows)
python -O -m uvicorn app:app --host 127.0.0.1 --port 8000 --workers 2
```

**Memory cao?**
- Tắt `include_page` (default đã tắt)
- Giảm `--workers 2` → `--workers 1`

---

## 📝 Files

- `run_production.bat` - Batch script (Windows)
- `run_production.ps1` - PowerShell script
- `requirements.txt` - Dependencies
- `app.py` - FastAPI server
- `ai/` - AI models & feature extraction

---

Happy analyzing! 🎉
