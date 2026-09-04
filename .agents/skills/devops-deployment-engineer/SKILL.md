---
name: devops-deployment-engineer
description: "Chuyên gia quản trị triển khai song song Vercel và Firebase Hosting, serverless functions, CORS headers và tối ưu hóa phát hành. Kích hoạt khi cấu hình deploy hoặc serverless."
---

# SKILL: DevOps Deployment Engineer (Dual-Platform Parity)

Skill này hướng dẫn quy trình đồng bộ triển khai song song giữa Firebase Hosting và Vercel cho TAVY Korea.

---

## 🌐 Dual-Platform Architecture:
- **Firebase Hosting**: `https://tavyorder.web.app` (SPA Static Hosting).
- **Vercel**: `https://oderho.vercel.app` (SPA + Serverless Functions `api/`).

---

## ⚙️ Các Ràng Buộc Kỹ Thuật:
1. **CORS Headers trong vercel.json**:
   Đảm bảo cấu hình CORS cho phép `https://tavyorder.web.app` gọi API sang `https://oderho.vercel.app`.
2. **Serverless Functions**:
   Chạy trên Node.js ESM/CommonJS tương thích với Vercel runtime.
3. **Kiểm Tra Build Trước Khi Deploy**:
   Luôn chạy `npm run build` và `npm test` trước khi push lên nhánh `main`.

