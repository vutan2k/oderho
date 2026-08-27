#!/usr/bin/env node
/**
 * TAVY KOREA ADMIN — Model Context Protocol (MCP) Server
 * Cho phép các AI Agent (Antigravity, Claude, Gemini) trực tiếp điều khiển, truy vấn và quản trị sàn Tavy Korea:
 * - Tra cứu đơn hàng & cập nhật trạng thái đơn hàng (9 bước chuẩn).
 * - Cập nhật tỷ giá KRW/VND và phí dịch vụ mua hộ.
 * - Cào dữ liệu chuyên sâu và album ảnh HD từ Naver Brand Store, KGC, Nonghyup, Olive Young.
 * - Quản lý danh mục kho hàng sản phẩm Sâm Nấm & TPCN.
 * - Thống kê báo cáo doanh số & phân tích hiệu quả kinh doanh.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  VERIFIED_KOREAN_HEALTH_CATALOG,
  scrapeKoreanHealthProduct,
  evaluateHealthFilterCriteria
} from '../src/services/koreanHealthScraperCore.js';

import {
  translateKoreanHealthTitle,
  categorizeHealthProduct,
  extractActiveIngredients,
  generateHealthUsageGuide
} from '../src/utils/koreanHealthDictionary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const exportsDir = path.join(projectRoot, 'exports');

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Khởi tạo MCP Server
const server = new McpServer({
  name: 'tavy-admin',
  version: '1.0.0',
  description: 'MCP Server Quản Trị & Điều Hành Tự Động Sàn Thương Mại Điện Tử Order Hàng Hàn Quốc TAVY KOREA'
});

// Helper đọc/ghi cấu hình tỷ giá cục bộ
const ratesFilePath = path.join(exportsDir, 'system_rates.json');
function getSystemRates() {
  try {
    if (fs.existsSync(ratesFilePath)) {
      return JSON.parse(fs.readFileSync(ratesFilePath, 'utf-8'));
    }
  } catch {}
  return { krwRate: 19.5, serviceFeePercent: 5, updatedAt: new Date().toISOString() };
}

function saveSystemRates(rates) {
  fs.writeFileSync(ratesFilePath, JSON.stringify(rates, null, 2), 'utf-8');
}

// Helper đọc/ghi đơn hàng mẫu & cache
const ordersFilePath = path.join(exportsDir, 'system_orders.json');
function getSystemOrders() {
  try {
    if (fs.existsSync(ordersFilePath)) {
      return JSON.parse(fs.readFileSync(ordersFilePath, 'utf-8'));
    }
  } catch {}
  return [
    {
      id: 'ORD-98241',
      customerName: 'Nguyễn Thị Thu Hà',
      customerPhone: '0912345678',
      customerAddress: 'Số 25 Phố Huế, Hàng Bài, Hoàn Kiếm, Hà Nội',
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      items: [
        {
          goodsNo: 'A000000213255',
          name: 'Nước Cao Hồng Sâm 6 Năm Tuổi KGC CheongKwanJang Everytime Shot 20 Lọ',
          priceWon: 52750,
          quantity: 2
        }
      ]
    },
    {
      id: 'ORD-98242',
      customerName: 'Trần Văn Minh',
      customerPhone: '0988776655',
      customerAddress: 'Vinhomes Central Park, Bình Thạnh, TP. Hồ Chí Minh',
      status: 'paid',
      paymentStatus: 'paid_full',
      trackingCode: 'VNPOST-KR-998231',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        {
          goodsNo: 'A000000199062',
          name: 'Men Vi Sinh Lợi Khuẩn Sống Chong Kun Dang Lacto-Fit Gold Bộ 3 Tháng',
          priceWon: 19900,
          quantity: 3
        }
      ]
    }
  ];
}

function saveSystemOrders(orders) {
  fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
}

// ════════════════════════════════════════════════════════════════════════════
// 1. TOOL: list_orders (Lấy danh sách đơn hàng)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'list_orders',
  'Lấy danh sách đơn hàng thực tế từ hệ thống quản trị Tavy Korea với các bộ lọc trạng thái (pending, paid, completed, etc.).',
  {
    status: z.enum([
      'all',
      'pending',
      'quoted',
      'deposit_paid',
      'paid',
      'purchasing_korea',
      'korea_warehouse',
      'shipping_vietnam',
      'vietnam_warehouse',
      'completed',
      'cancelled'
    ]).optional().describe('Trạng thái đơn hàng cần lọc'),
    limit: z.number().optional().describe('Số lượng đơn hàng tối đa cần lấy (mặc định 20)')
  },
  async ({ status = 'all', limit = 20 }) => {
    const allOrders = getSystemOrders();
    const filtered = status === 'all'
      ? allOrders
      : allOrders.filter(o => o.status === status);

    const result = filtered.slice(0, limit);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: filtered.length,
            showing: result.length,
            statusFilter: status,
            orders: result
          }, null, 2)
        }
      ]
    };
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 2. TOOL: get_order_detail (Chi tiết 1 đơn hàng)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'get_order_detail',
  'Xem thông tin chi tiết đầy đủ của một đơn hàng theo orderId (Khách hàng, sản phẩm, giá tiền, địa chỉ, lịch sử vận chuyển).',
  {
    orderId: z.string().describe('Mã đơn hàng (ví dụ: ORD-98241)')
  },
  async ({ orderId }) => {
    const allOrders = getSystemOrders();
    const cleanId = orderId.trim().toUpperCase();
    const matched = allOrders.find(o => o.id.toUpperCase() === cleanId || o.id.toUpperCase().includes(cleanId));

    if (!matched) {
      return {
        isError: true,
        content: [{ type: 'text', text: `❌ Không tìm thấy đơn hàng với mã "${orderId}".` }]
      };
    }

    const rates = getSystemRates();
    let totalWon = 0;
    (matched.items || []).forEach(it => {
      totalWon += (it.priceWon || 0) * (it.quantity || 1);
    });
    const estVnd = Math.round(totalWon * rates.krwRate * (1 + rates.serviceFeePercent / 100));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            order: matched,
            financialSummary: {
              totalWon,
              appliedKrwRate: rates.krwRate,
              serviceFeePercent: rates.serviceFeePercent,
              totalEstVnd: estVnd
            }
          }, null, 2)
        }
      ]
    };
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 3. TOOL: update_order_status (Cập nhật trạng thái đơn hàng)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'update_order_status',
  'Cập nhật trạng thái xử lý của đơn hàng (ví dụ: chuyển sang đã đặt mua tại Hàn, đang bay về VN), gán mã vận đơn tracking hoặc ghi chú.',
  {
    orderId: z.string().describe('Mã đơn hàng cần cập nhật'),
    status: z.enum([
      'pending',
      'quoted',
      'deposit_paid',
      'paid',
      'purchasing_korea',
      'korea_warehouse',
      'shipping_vietnam',
      'vietnam_warehouse',
      'completed',
      'cancelled'
    ]).describe('Trạng thái mới của đơn hàng'),
    trackingCode: z.string().optional().describe('Mã vận đơn quốc tế / nội địa'),
    adminNote: z.string().optional().describe('Ghi chú nội bộ của admin')
  },
  async ({ orderId, status, trackingCode, adminNote }) => {
    const allOrders = getSystemOrders();
    const cleanId = orderId.trim().toUpperCase();
    const idx = allOrders.findIndex(o => o.id.toUpperCase() === cleanId || o.id.toUpperCase().includes(cleanId));

    if (idx === -1) {
      return {
        isError: true,
        content: [{ type: 'text', text: `❌ Không tìm thấy đơn hàng "${orderId}" để cập nhật.` }]
      };
    }

    allOrders[idx].status = status;
    if (trackingCode) allOrders[idx].trackingCode = trackingCode;
    if (adminNote) allOrders[idx].adminNote = adminNote;
    allOrders[idx].updatedAt = new Date().toISOString();

    saveSystemOrders(allOrders);

    return {
      content: [
        {
          type: 'text',
          text: `✅ Đã cập nhật thành công đơn hàng #${allOrders[idx].id} sang trạng thái "${status}".\n` +
                (trackingCode ? `- Mã vận đơn: ${trackingCode}\n` : '') +
                (adminNote ? `- Ghi chú: ${adminNote}\n` : '')
        }
      ]
    };
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 4. TOOL: update_exchange_rates (Cập nhật tỷ giá Won)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'update_exchange_rates',
  'Điều chỉnh tỷ giá KRW/VND và phần trăm phí dịch vụ mua hộ trên toàn hệ thống Tavy Korea.',
  {
    krwRate: z.number().min(10).max(40).describe('Tỷ giá 1 KRW đổi sang VNĐ (ví dụ: 19.8)'),
    serviceFeePercent: z.number().min(0).max(30).optional().describe('Phần trăm phí dịch vụ (mặc định 5%)')
  },
  async ({ krwRate, serviceFeePercent = 5 }) => {
    const current = getSystemRates();
    const updated = {
      krwRate,
      serviceFeePercent,
      updatedAt: new Date().toISOString()
    };
    saveSystemRates(updated);

    return {
      content: [
        {
          type: 'text',
          text: `✅ ĐÃ CẬP NHẬT TỶ GIÁ THÀNH CÔNG!\n- Tỷ giá mới: 1 KRW = ${krwRate} VNĐ (Trước đó: ${current.krwRate})\n- Phí dịch vụ: ${serviceFeePercent}%\n- Thời điểm: ${updated.updatedAt}`
        }
      ]
    };
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 5. TOOL: scrape_korean_product (Cào dữ liệu sản phẩm Hàn Quốc)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'scrape_korean_product',
  'Bóc tách dữ liệu chuyên sâu và album ảnh HD của sản phẩm từ Naver Brand Store, KGC CheongKwanJang, Nonghyup, Olive Young.',
  {
    urlOrCode: z.string().describe('URL sản phẩm hoặc mã hàng (goodsNo)')
  },
  async ({ urlOrCode }) => {
    try {
      const product = await scrapeKoreanHealthProduct(urlOrCode);
      const rates = getSystemRates();
      const estVnd = Math.round(product.foreignPrice * rates.krwRate * (1 + rates.serviceFeePercent / 100));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              status: 'success',
              product: {
                ...product,
                calculatedPriceVnd: estVnd,
                appliedRate: rates.krwRate
              }
            }, null, 2)
          }
        ]
      };
    } catch (e) {
      return {
        isError: true,
        content: [{ type: 'text', text: `❌ Lỗi khi bóc tách sản phẩm: ${e.message}` }]
      };
    }
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 6. TOOL: list_catalog_products (Danh sách sản phẩm trong kho)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'list_catalog_products',
  'Lấy danh sách các sản phẩm sâm nấm và TPCN đã được xác thực trong kho hàng của Tavy Korea.',
  {
    category: z.enum(['all', 'ginseng', 'supplements']).optional().describe('Danh mục sản phẩm'),
    limit: z.number().optional().describe('Số lượng sản phẩm tối đa (mặc định 10)')
  },
  async ({ category = 'all', limit = 10 }) => {
    let pool = [...VERIFIED_KOREAN_HEALTH_CATALOG];
    if (category !== 'all') {
      pool = pool.filter(p => p.category === category);
    }
    const result = pool.slice(0, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            total: pool.length,
            showing: result.length,
            category,
            products: result
          }, null, 2)
        }
      ]
    };
  }
);

// ════════════════════════════════════════════════════════════════════════════
// 7. TOOL: get_system_analytics (Báo cáo kinh doanh & hiệu quả vận hành)
// ════════════════════════════════════════════════════════════════════════════
server.tool(
  'get_system_analytics',
  'Xem báo cáo tổng hợp chỉ số tài chính, số lượng đơn hàng theo từng trạng thái và giá trị GMV.',
  {},
  async () => {
    const orders = getSystemOrders();
    const rates = getSystemRates();
    const products = VERIFIED_KOREAN_HEALTH_CATALOG;

    let totalGmvWon = 0;
    const statusCounts = {};

    orders.forEach(o => {
      statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
      (o.items || []).forEach(it => {
        totalGmvWon += (it.priceWon || 0) * (it.quantity || 1);
      });
    });

    const totalGmvVnd = Math.round(totalGmvWon * rates.krwRate * (1 + rates.serviceFeePercent / 100));
    const aovVnd = orders.length > 0 ? Math.round(totalGmvVnd / orders.length) : 0;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            totalOrders: orders.length,
            totalCatalogProducts: products.length,
            currentKrwRate: rates.krwRate,
            serviceFeePercent: rates.serviceFeePercent,
            financials: {
              totalGmvWon,
              totalGmvVnd,
              averageOrderValueVnd: aovVnd
            },
            orderBreakdownByStatus: statusCounts
          }, null, 2)
        }
      ]
    };
  }
);

// Khởi động server qua Stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 Tavy Admin MCP Server is running on stdio');
}

main().catch(err => {
  console.error('❌ MCP Server Error:', err);
  process.exit(1);
});
