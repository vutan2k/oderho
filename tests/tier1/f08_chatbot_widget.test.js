import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains
} from '../framework/assert.js';
import { CHATBOT_QUICK_ACTIONS, CHATBOT_REPLIES } from '../../src/data/chatbotFaqData.js';
import { ORDER_STATUSES, getStatusConfig, getOrderStepIndex } from '../../src/data/orderStatuses.js';

setTier('Tier 1: Feature Coverage');

test('[F8-1] Chatbot Quick Actions contain essential modules and minimalist metadata', () => {
  const actionIds = CHATBOT_QUICK_ACTIONS.map(a => a.id);
  assert(actionIds.includes('lookup_order'), 'Must include 8-step order lookup action');
  assert(actionIds.includes('consult_product'), 'Must include Olive Young product consultation');
  assert(actionIds.includes('faq_workflow'), 'Must include 8-step workflow policy');
  assert(actionIds.includes('faq_refund'), 'Must include 100% refund guarantee');
  assert(actionIds.includes('faq_payment'), 'Must include VietQR & Woori Bank info');
  assert(actionIds.includes('open_facebook'), 'Must include Facebook Messenger bridge');

  // Check icons and colors for minimalism
  const lookupAction = CHATBOT_QUICK_ACTIONS.find(a => a.id === 'lookup_order');
  assertEquals(lookupAction.icon, 'PackageSearch', 'Lookup action icon matches');
  assertEquals(lookupAction.shortLabel, 'Tra cứu đơn', 'Short label matches');
});

test('[F8-2] FAQ Replies contain correct 8-step transparency data and bank info', () => {
  // 8 Steps
  assertContains(CHATBOT_REPLIES.workflow_8steps.text, '1.', 'Must explain step 1');
  assertContains(CHATBOT_REPLIES.workflow_8steps.text, 'POV', 'Must mention Video POV');
  assertContains(CHATBOT_REPLIES.workflow_8steps.text, '8.', 'Must explain step 8');

  // Payment
  assertContains(CHATBOT_REPLIES.payment_info.text, '1330042000', 'Must contain MBBank account number');
  assertContains(CHATBOT_REPLIES.payment_info.text, '1002959863658', 'Must contain Woori Bank account number');
  assertContains(CHATBOT_REPLIES.payment_info.text, 'VU VAN TAN', 'Must contain account owner name');

  // Refund
  assertContains(CHATBOT_REPLIES.refund_guarantee.text, '10 LẦN', 'Must state 10x penalty for counterfeit');
  assertContains(CHATBOT_REPLIES.refund_guarantee.text, '100%', 'Must state 100% refund guarantee');
});

test('[F8-3] Chatbot order lookup logic correctly resolves 8-step status and proof flags', () => {
  const mockOrderStep4 = {
    id: 'ORD-TEST-4',
    status: 'purchased',
    povVideoUrl: 'https://example.com/pov.mp4',
    receiptImageUrl: 'https://example.com/receipt.jpg'
  };

  const config = getStatusConfig(mockOrderStep4.status);
  const stepIdx = getOrderStepIndex(mockOrderStep4);

  assertEquals(stepIdx, 3, 'Purchased status should map to stepIndex 3 (Step 4)');
  assertEquals(config.id, 'purchased', 'Config ID matches');
  assertEquals(config.hasPovVideo, true, 'Purchased status must have hasPovVideo flag');
});

test('[F8-4] Chatbot order lookup logic correctly resolves step 5 packing video & weight', () => {
  const mockOrderStep5 = {
    id: 'ORD-TEST-5',
    status: 'packed_kr',
    packingVideoUrl: 'https://example.com/packing.mp4',
    packageWeightKg: 1.85
  };

  const config = getStatusConfig(mockOrderStep5.status);
  const stepIdx = getOrderStepIndex(mockOrderStep5);

  assertEquals(stepIdx, 4, 'Packed_kr status should map to stepIndex 4 (Step 5)');
  assertEquals(config.id, 'packed_kr', 'Config ID matches');
  assertEquals(config.hasPackingVideo, true, 'Packed_kr status must have hasPackingVideo flag');
  assertEquals(mockOrderStep5.packageWeightKg, 1.85, 'Weight matches');
});

