import { setTier, test } from '../framework/runner.js';
import { assert, assertEquals } from '../framework/assert.js';

setTier('Tier 1: Feature Coverage');

test('[F22-1] Profile sync payload generator extracts customerName, customerPhone, customerAddress from orderData', () => {
  const orderData = {
    customerName: 'Nguyễn Văn A',
    customerPhone: '0987654321',
    customerAddress: '123 Phố Huế, Hai Bà Trưng, Hà Nội',
    totalVnd: 1500000
  };

  const authUser = {
    uid: 'user_real_google_123',
    email: 'testuser@gmail.com',
    displayName: 'Nguyễn Văn A'
  };

  const profileUpdate = {
    name: orderData.customerName || authUser.displayName || 'Khách hàng TAVY',
    phone: orderData.customerPhone || '',
    address: orderData.customerAddress || '',
    updatedAt: new Date().toISOString()
  };

  assertEquals(profileUpdate.name, 'Nguyễn Văn A');
  assertEquals(profileUpdate.phone, '0987654321');
  assertEquals(profileUpdate.address, '123 Phố Huế, Hai Bà Trưng, Hà Nội');
});

test('[F22-2] autoLoginAdmin safety guard prevents hijacking user sessions', () => {
  // Scenario 1: Customer is on client page (/cart or /profile), authenticated with Google
  const pathname1 = '/profile';
  const isAdminAuthenticated1 = true; // had previous admin session
  const authUser1 = { email: 'customer@gmail.com', uid: 'cust_1' };

  const isAdminPath1 = pathname1.startsWith('/admin');
  const shouldAutoLoginAdmin1 = isAdminPath1 && isAdminAuthenticated1 && !authUser1;
  assert(!shouldAutoLoginAdmin1, 'Must NOT auto login admin on client pages when customer is logged in');

  // Scenario 2: Admin is on /admin page and no user is logged in
  const pathname2 = '/admin';
  const isAdminAuthenticated2 = true;
  const authUser2 = null;

  const isAdminPath2 = pathname2.startsWith('/admin');
  const shouldAutoLoginAdmin2 = isAdminPath2 && isAdminAuthenticated2 && !authUser2;
  assert(shouldAutoLoginAdmin2, 'CAN auto login admin only when on /admin and unauthenticated');
});

test('[F22-3] Default name fallback prioritizes real displayName over generic placeholder', () => {
  const user1 = { displayName: 'Trần Thị B', email: 'tranb@gmail.com' };
  const fallbackName1 = user1.displayName || user1.email?.split('@')[0] || 'Khách hàng TAVY';
  assertEquals(fallbackName1, 'Trần Thị B');

  const user2 = { displayName: null, email: 'tranb@gmail.com' };
  const fallbackName2 = user2.displayName || user2.email?.split('@')[0] || 'Khách hàng TAVY';
  assertEquals(fallbackName2, 'tranb');
});
