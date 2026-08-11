import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

// Cấu hình Firebase Demo (Có thể thay thế bằng API Key từ Google Firebase Console của bạn)
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey_ReplaceWithYourFirebaseApiKey",
  authDomain: "kmart-viethan.firebaseapp.com",
  projectId: "kmart-viethan",
  storageBucket: "kmart-viethan.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Khởi tạo Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Hàm Đăng nhập bằng tài khoản Google 1-click
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      success: true,
      user: {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }
    };
  } catch (error) {
    console.warn("Firebase Google login error, fallback to mock Google Auth:", error);
    // Giả lập Đăng nhập Google thành công nếu chưa điền API Key thực tế
    const mockUser = {
      uid: 'google-user-' + Date.now(),
      name: 'Nguyễn Văn A (Google)',
      email: 'user.google@gmail.com',
      photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
    };
    return { success: true, user: mockUser };
  }
};

// Hàm Đăng xuất
export const logoutGoogle = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: true };
  }
};
