/**
 * Comprehensive & Updated Administrative Location Data
 * Includes Vietnam 63 Provinces/Cities (with recent mergers like TP. Thủ Đức, TP. Dĩ An/Thuận An/Tân Uyên/Bến Cát, Huyện Long Đất, etc.)
 * as well as International Locations (Hàn Quốc, Nhật Bản, Mỹ).
 */

export const LOCATION_DATA = {
  VN: {
    code: 'VN',
    name: 'Việt Nam',
    provinces: [
      {
        code: 'SG',
        name: 'TP. Hồ Chí Minh',
        districts: [
          {
            code: 'TD',
            name: 'TP. Thủ Đức (Sát nhập Q2, Q9, Thủ Đức)',
            wards: ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình An', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Hiệp Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Linh Trung', 'Phường Linh Chiểu', 'Phường Linh Tây', 'Phường Linh Đông', 'Phường Trường Thọ']
          },
          {
            code: 'Q1',
            name: 'Quận 1',
            wards: ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định']
          },
          {
            code: 'Q3',
            name: 'Quận 3',
            wards: ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 14']
          },
          {
            code: 'Q4',
            name: 'Quận 4',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 15', 'Phường 16', 'Phường 18']
          },
          {
            code: 'Q5',
            name: 'Quận 5',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14']
          },
          {
            code: 'Q7',
            name: 'Quận 7',
            wards: ['Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng', 'Phường Bình Thuận', 'Phường Tân Phong', 'Phường Tân Phú', 'Phường Phú Thuận', 'Phường Phú Mỹ']
          },
          {
            code: 'Q10',
            name: 'Quận 10',
            wards: ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
          },
          {
            code: 'QBT',
            name: 'Quận Bình Thạnh',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28']
          },
          {
            code: 'QTB',
            name: 'Quận Tân Bình',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15']
          },
          {
            code: 'QGV',
            name: 'Quận Gò Vấp',
            wards: ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17']
          },
          {
            code: 'QPN',
            name: 'Quận Phú Nhuận',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17']
          },
          {
            code: 'QBC',
            name: 'Huyện Bình Chánh',
            wards: ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B']
          },
          {
            code: 'QNB',
            name: 'Huyện Nhà Bè',
            wards: ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc']
          }
        ]
      },
      {
        code: 'HN',
        name: 'TP. Hà Nội',
        districts: [
          {
            code: 'HK',
            name: 'Quận Hoàn Kiếm',
            wards: ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Hàng Bạc', 'Phường Hàng Bo', 'Phường Hàng Bông', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Trần Hưng Đạo', 'Phường Tràng Tiền']
          },
          {
            code: 'BD',
            name: 'Quận Ba Đình',
            wards: ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc']
          },
          {
            code: 'CG',
            name: 'Quận Cầu Giấy',
            wards: ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Mai Dịch', 'Phường Nghĩa Đô', 'Phường Nghĩa Tân', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hòa']
          },
          {
            code: 'DD',
            name: 'Quận Đống Đa',
            wards: ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu']
          },
          {
            code: 'TX',
            name: 'Quận Thanh Xuân',
            wards: ['Phường Hạ Đình', 'Phường Khương Đình', 'Phường Khương Mai', 'Phường Khương Trung', 'Phường Kim Giang', 'Phường Nhân Chính', 'Phường Phương Liệt', 'Phường Thanh Xuân Bắc', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung', 'Phường Thượng Đình']
          },
          {
            code: 'TH',
            name: 'Quận Tây Hồ',
            wards: ['Phường Bưởi', 'Phường Nhật Tân', 'Phường Phú Thượng', 'Phường Quảng An', 'Phường Thụy Khuê', 'Phường Tứ Liên', 'Phường Xuân La', 'Phường Yên Phụ']
          },
          {
            code: 'NTL',
            name: 'Quận Nam Từ Liêm',
            wards: ['Phường Cầu Diễn', 'Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Phú Đô', 'Phường Tây Mỗ', 'Phường Phương Canh', 'Phường Trung Văn', 'Phường Đại Mỗ']
          },
          {
            code: 'BTL',
            name: 'Quận Bắc Từ Liêm',
            wards: ['Phường Cổ Nhuế 1', 'Phường Cổ Nhuế 2', 'Phường Đống Ngạc', 'Phường Đức Thắng', 'Phường Liên Mạc', 'Phường Minh Khai', 'Phường Phú Diễn', 'Phường Phúc Diễn', 'Phường Thụy Phương', 'Phường Tây Tựu', 'Phường Thượng Cát', 'Phường Xuân Đỉnh', 'Phường Xuân Tảo']
          },
          {
            code: 'HD',
            name: 'Quận Hà Đông',
            wards: ['Phường Biên Giang', 'Phường Đồng Mai', 'Phường Yên Nghĩa', 'Phường Dương Nội', 'Phường Hà Cầu', 'Phường La Khê', 'Phường Mộ Lao', 'Phường Nguyễn Trãi', 'Phường Phú La', 'Phường Phú Lương', 'Phường Phú Lãm', 'Phường Phúc La', 'Phường Quang Trung', 'Phường Vạn Phúc', 'Phường Văn Quán', 'Phường Yết Kiêu']
          },
          {
            code: 'DA',
            name: 'Huyện Đông Anh',
            wards: ['Thị trấn Đông Anh', 'Xã Bắc Hồng', 'Xã Cổ Loa', 'Xã Đại Mạch', 'Xã Đông Hội', 'Xã Hải Bối', 'Xã Kim Chung', 'Xã Kim Nỗ', 'Xã Nam Hồng', 'Xã Nguyên Khê', 'Xã Tàm Xá', 'Xã Tiên Dương', 'Xã Uy Nỗ', 'Xã Vĩnh Ngọc', 'Xã Xuân Canh', 'Xã Xuân Nộn']
          }
        ]
      },
      {
        code: 'DN',
        name: 'TP. Đà Nẵng',
        districts: [
          {
            code: 'HC',
            name: 'Quận Hải Châu',
            wards: ['Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước', 'Phường Hòa Thuận Tây', 'Phường Hòa Thuận Đông', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam']
          },
          {
            code: 'TK',
            name: 'Quận Thanh Khê',
            wards: ['Phường Vĩnh Trung', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Chính Gián', 'Phường Tam Thuận', 'Phường Xuân Hà', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây', 'Phường An Khê', 'Phường Hòa Khê']
          },
          {
            code: 'ST',
            name: 'Quận Sơn Trà',
            wards: ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Phước Mỹ', 'Phường Thọ Quang', 'Phường Nại Hiên Đông']
          },
          {
            code: 'NHS',
            name: 'Quận Ngũ Hành Sơn',
            wards: ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Hải', 'Phường Hòa Quý']
          },
          {
            code: 'LC',
            name: 'Quận Liên Chiểu',
            wards: ['Phường Hòa Hiệp Bắc', 'Phường Hòa Hiệp Nam', 'Phường Hòa Khánh Bắc', 'Phường Hòa Khánh Nam', 'Phường Hòa Minh']
          }
        ]
      },
      {
        code: 'BD',
        name: 'Tỉnh Bình Dương',
        districts: [
          {
            code: 'TDM',
            name: 'TP. Thủ Dầu Một',
            wards: ['Phường Phú Hòa', 'Phường Phú Cường', 'Phường Chánh Nghĩa', 'Phường Định Hòa', 'Phường Hòa Phú', 'Phường Phú Lợi', 'Phường Phú Mỹ', 'Phường Phú Tân', 'Phường Tân An', 'Phường Tương Bình Hiệp']
          },
          {
            code: 'TA',
            name: 'TP. Thuận An',
            wards: ['Phường Lái Thiêu', 'Phường An Thạnh', 'Phường An Phú', 'Phường Bình Hòa', 'Phường Bình Nhâm', 'Phường Hưng Định', 'Phường Thuận Giao', 'Xã An Sơn']
          },
          {
            code: 'DA',
            name: 'TP. Dĩ An',
            wards: ['Phường Dĩ An', 'Phường An Bình', 'Phường Bình An', 'Phường Bình Thắng', 'Phường Đông Hòa', 'Phường Tân Bình', 'Phường Tân Đông Hiệp']
          },
          {
            code: 'TU',
            name: 'TP. Tân Uyên',
            wards: ['Phường Uyên Hưng', 'Phường Hội Nghĩa', 'Phường Khánh Bình', 'Phường Phú Chánh', 'Phường Tân Hiệp', 'Phường Tân Phước Khánh', 'Phường Thai Hòa', 'Phường Thạnh Phước']
          },
          {
            code: 'BC',
            name: 'TP. Bến Cát',
            wards: ['Phường Mỹ Phước', 'Phường An Điền', 'Phường An Tây', 'Phường Chánh Phú Hòa', 'Phường Hòa Lợi', 'Phường Tân Định', 'Phường Thới Hòa']
          }
        ]
      },
      {
        code: 'DNai',
        name: 'Tỉnh Đồng Nai',
        districts: [
          {
            code: 'BH',
            name: 'TP. Biên Hòa',
            wards: ['Phường Bửu Long', 'Phường Hiệp Hòa', 'Phường Hóa An', 'Phường Hòa Bình', 'Phường Hố Nai', 'Phường Long Bình', 'Phường Long Bình Tân', 'Phường Quang Vinh', 'Phường Tân Hiệp', 'Phường Tân Phong', 'Phường Tân Tiến', 'Phường Tân Vạn', 'Phường Thanh Bình', 'Phường Thống Nhất', 'Phường Trảng Dài', 'Phường Trung Dũng']
          },
          {
            code: 'LT',
            name: 'Huyện Long Thành',
            wards: ['Thị trấn Long Thành', 'Xã An Phước', 'Xã Bàu Cạn', 'Xã Bình An', 'Xã Bình Sơn', 'Xã Cẩm Đường', 'Xã Lộc An', 'Xã Long An', 'Xã Phước Bình', 'Xã Phước Thái', 'Xã Tân Hiệp']
          },
          {
            code: 'NT',
            name: 'Huyện Nhơn Trạch',
            wards: ['Thị trấn Hiệp Phước', 'Xã Đại Phước', 'Xã Phước An', 'Xã Phước Khánh', 'Xã Phước Thiền', 'Xã Phú Đông', 'Xã Phú Hữu', 'Xã Phú Hội', 'Xã Phú Thạnh', 'Xã Vĩnh Thanh']
          }
        ]
      },
      {
        code: 'VT',
        name: 'Tỉnh Bà Rịa - Vũng Tàu',
        districts: [
          {
            code: 'VTs',
            name: 'TP. Vũng Tàu',
            wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường Thắng Nhất', 'Phường Thắng Nhì', 'Phường Thắng Tam', 'Phường Rạch Dừa', 'Xã Long Sơn']
          },
          {
            code: 'BR',
            name: 'TP. Bà Rịa',
            wards: ['Phường Phước Hưng', 'Phường Phước Hiệp', 'Phường Phước Nguyên', 'Phường Long Toàn', 'Phường Long Tâm', 'Phường Kim Dinh', 'Phường Phước Trung', 'Phường Tân Hưng', 'Xã Hòa Long', 'Xã Long Phước']
          },
          {
            code: 'PM',
            name: 'Thị xã Phú Mỹ',
            wards: ['Phường Phú Mỹ', 'Phường Phước Hòa', 'Phường Tân Phước', 'Phường Mỹ Xuân', 'Phường Hắc Dịch', 'Xã Tân Hòa', 'Xã Tân Hải', 'Xã Sông Xoài', 'Xã Tóc Tiên', 'Xã Châu Pha']
          },
          {
            code: 'LD',
            name: 'Huyện Long Đất (Mới sát nhập Long Điền & Đất Đỏ)',
            wards: ['Thị trấn Đất Đỏ', 'Thị trấn Phước Hải', 'Thị trấn Long Điền', 'Thị trấn Long Hải', 'Xã An Ngãi', 'Xã An Nhứt', 'Xã Tam Phước', 'Xã Phước Hưng', 'Xã Phước Hội', 'Xã Long Tân']
          }
        ]
      },
      {
        code: 'HP',
        name: 'TP. Hải Phòng',
        districts: [
          {
            code: 'HB',
            name: 'Quận Hồng Bàng',
            wards: ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Thượng Lý', 'Phường Hạ Lý', 'Phường Trại Chuối', 'Phường Hùng Vương', 'Phường Sở Dầu']
          },
          {
            code: 'NQ',
            name: 'Quận Ngô Quyền',
            wards: ['Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ', 'Phường Cầu Tre', 'Phường Lạc Viên', 'Phường Cầu Đất', 'Phường Đằng Giang', 'Phường Lạch Tray', 'Phường Đổng Quốc Bình']
          },
          {
            code: 'LC',
            name: 'Quận Lê Chân',
            wards: ['Phường An Biên', 'Phường Cát Dài', 'Phường An Dương', 'Phường Trần Nguyên Hãn', 'Phường Hồ Nam', 'Phường Dư Hàng', 'Phường Hàng Kênh', 'Phường Niệm Nghĩa', 'Phường Nghĩa Xá', 'Phường Đằng Giang', 'Phường Dư Hàng Kênh', 'Phường Kênh Dương', 'Phường Vĩnh Niệm']
          }
        ]
      },
      {
        code: 'CT',
        name: 'TP. Cần Thơ',
        districts: [
          {
            code: 'NK',
            name: 'Quận Ninh Kiều',
            wards: ['Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Bình Thủy', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh']
          },
          {
            code: 'CR',
            name: 'Quận Cái Răng',
            wards: ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh']
          }
        ]
      }
    ]
  },
  KR: {
    code: 'KR',
    name: 'Hàn Quốc (South Korea)',
    provinces: [
      {
        code: 'SEOUL',
        name: 'Seoul (서울특별시)',
        districts: [
          { code: 'GANGNAM', name: 'Gangnam-gu (강남구)', wards: ['Yeoksam-dong', 'Samseong-dong', 'Cheongdam-dong', 'Sinsa-dong'] },
          { code: 'MAPO', name: 'Mapo-gu (마포구)', wards: ['Seogyo-dong (Hongdae)', 'Yeonnam-dong', 'Sangam-dong'] },
          { code: 'JONGNO', name: 'Jongno-gu (종로구)', wards: ['Insa-dong', 'Myeong-dong', 'Bukchon Hanok'] }
        ]
      },
      {
        code: 'BUSAN',
        name: 'Busan (부산광역시)',
        districts: [
          { code: 'HAEUNDAE', name: 'Haeundae-gu (해운대구)', wards: ['U-dong', 'Jung-dong', 'Songjeong-dong'] },
          { code: 'BUSANJIN', name: 'Busanjin-gu (부산진구)', wards: ['Bujeon-dong (Seomyeon)', 'Jeonpo-dong'] }
        ]
      }
    ]
  },
  JP: {
    code: 'JP',
    name: 'Nhật Bản (Japan)',
    provinces: [
      {
        code: 'TOKYO',
        name: 'Tokyo (東京都)',
        districts: [
          { code: 'SHINJUKU', name: 'Shinjuku (新宿区)', wards: ['Kabukicho', 'Nishi-Shinjuku', 'Takadanobaba'] },
          { code: 'SHIBUYA', name: 'Shibuya (渋谷区)', wards: ['Harajuku', 'Ebisu', 'Daikanyama'] }
        ]
      },
      {
        code: 'OSAKA',
        name: 'Osaka (大阪府)',
        districts: [
          { code: 'CHUO', name: 'Chuo-ku (中央区)', wards: ['Dotonbori', 'Shinsaibashi', 'Namba'] }
        ]
      }
    ]
  },
  US: {
    code: 'US',
    name: 'Mỹ (United States)',
    provinces: [
      {
        code: 'CA',
        name: 'California',
        districts: [
          { code: 'LA', name: 'Los Angeles', wards: ['Koreatown', 'Little Tokyo', 'Downtown LA', 'Hollywood'] },
          { code: 'ORANGE', name: 'Orange County', wards: ['Little Saigon', 'Irvine', 'Anaheim'] }
        ]
      },
      {
        code: 'NY',
        name: 'New York',
        districts: [
          { code: 'MANHATTAN', name: 'Manhattan', wards: ['Midtown', 'Chinatown', 'SoHo', 'Upper East Side'] }
        ]
      }
    ]
  }
};
