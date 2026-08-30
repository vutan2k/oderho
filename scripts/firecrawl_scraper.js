import 'dotenv/config';
import FirecrawlApp from '@mendable/firecrawl-js';

// Khởi tạo Firecrawl
const apiKey = process.env.FIRECRAWL_API_KEY;

export async function runFirecrawlScraper(url) {
  if (!apiKey || apiKey.startsWith('fc-...')) {
    return { success: false, error: "CHƯA CẤU HÌNH FIRECRAWL_API_KEY. Vui lòng thêm vào file .env ở thư mục gốc." };
  }

  const app = new FirecrawlApp({ apiKey });

  try {
    console.log(`🔥 [Firecrawl] Đang bóc tách URL: ${url}`);
    
    // Schema chuẩn JSON Schema để Firecrawl AI tự động map dữ liệu
    const schema = {
      type: "object",
      properties: {
        name: { 
          type: "string", 
          description: "Tên sản phẩm bằng tiếng Việt (dịch sang tiếng Việt chuẩn, không giữ lại từ tiếng Hàn, không thêm từ thừa)." 
        },
        nameKr: { 
          type: "string", 
          description: "Tên sản phẩm gốc bằng tiếng Hàn." 
        },
        brand: { 
          type: "string", 
          description: "Tên thương hiệu (Brand) của sản phẩm." 
        },
        category: { 
          type: "string", 
          description: "Phân loại (skincare, makeup, bodycare, haircare, supplement)."
        },
        foreignPrice: { 
          type: "number", 
          description: "Giá khuyến mãi hiện tại của sản phẩm bằng tiền Won (KRW). Chỉ xuất ra con số." 
        },
        productImage: { 
          type: "string", 
          description: "URL ảnh đại diện gốc của sản phẩm, TUYỆT ĐỐI KHÔNG lấy ảnh review chứa chữ gdasEditor." 
        },
        images: { 
          type: "array", 
          items: { type: "string" },
          description: "Mảng chứa 1-3 link ảnh HD của sản phẩm (ảnh hộp)." 
        },
        description: { 
          type: "string", 
          description: "Mô tả ngắn gọn về công dụng sản phẩm bằng Tiếng Việt." 
        }
      },
      required: ["name", "nameKr", "brand", "foreignPrice", "productImage"]
    };

    // Gọi API Extract của Firecrawl
    const scrapeResult = await app.scrapeUrl(url, {
      formats: ['extract'],
      extract: {
        schema: schema,
        prompt: "Trích xuất thông tin sản phẩm Olive Young. Dịch tên sang Tiếng Việt. Lấy ảnh hộp chuẩn xác, không lấy ảnh review."
      }
    });

    if (!scrapeResult.success) {
      throw new Error(`Firecrawl thất bại: ${scrapeResult.error}`);
    }

    const data = scrapeResult.extract;
    const goodsNoMatch = url.match(/goodsNo=([A-Za-z0-9_]+)/i);
    const goodsNo = goodsNoMatch ? goodsNoMatch[1] : `FC-${Date.now()}`;
    const cleanPrice = Number(data.foreignPrice) || 0;

    const finalProduct = {
      goodsNo: goodsNo,
      name: data.name || 'Sản phẩm Hàn Quốc',
      nameKr: data.nameKr || '',
      brand: data.brand || 'Olive Young',
      category: data.category || 'skincare',
      foreignPrice: cleanPrice,
      price: cleanPrice,
      productImage: data.productImage || '',
      images: Array.isArray(data.images) && data.images.length > 0 ? data.images : [data.productImage || ''],
      description: data.description || 'Sản phẩm nhập khẩu Hàn Quốc chính hãng.',
      origin: 'Store Olive Young Seoul, Hàn Quốc',
      rating: Number(data.rating) || 0,
      reviewsCount: Number(data.reviewsCount) || 0,
      productUrl: url,
      source: 'FIRECRAWL_AI',
      scrapedAt: new Date().toISOString()
    };

    console.log(`✅ [Firecrawl] Hoàn tất bóc tách: ${finalProduct.name}`);
    return { success: true, product: finalProduct };

  } catch (error) {
    console.error("❌ Lỗi Firecrawl:", error.message);
    return { success: false, error: error.message };
  }
}
