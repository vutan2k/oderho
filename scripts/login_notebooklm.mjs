import { AuthManager } from '/Users/tan/.npm/_npx/7b62b265f798648a/node_modules/@charlie.act7/gemini-notebook-mcp/dist/auth/auth-manager.js';

console.log("==================================================");
console.log("🚀 ĐANG MỞ TRÌNH DUYỆT ĐĂNG NHẬP GOOGLE NOTEBOOKLM");
console.log("👉 Vui lòng đăng nhập tài khoản Google trên cửa sổ Chrome vừa mở.");
console.log("👉 Sau khi đăng nhập thành công vào NotebookLM, cửa sổ sẽ tự lưu và hoàn tất!");
console.log("==================================================");

const auth = new AuthManager();
const success = await auth.performSetup((msg, step, total) => {
    console.log(`⏳ [${step}/${total}] ${msg}`);
}, true);

if (success) {
    console.log("🎉 ĐĂNG NHẬP THÀNH CÔNG! Phiên làm việc đã được lưu vĩnh viễn.");
} else {
    console.log("⚠️ Đăng nhập chưa hoàn tất hoặc bị gián đoạn.");
}
process.exit(success ? 0 : 1);
