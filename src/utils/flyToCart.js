export function triggerFlyToCart(e, productImageSrc) {
  if (!e || !e.target) return;
  const cartIcon = document.getElementById('cart-icon-header');
  if (!cartIcon) return;

  const productCard = e.target.closest('.product-card') || e.target.closest('.modal-content') || e.target.closest('div');
  const imgElem = productCard ? productCard.querySelector('img') : null;

  if (!imgElem || !productImageSrc) return;

  const startRect = imgElem.getBoundingClientRect();
  const endRect = cartIcon.getBoundingClientRect();

  const flyImg = document.createElement('img');
  flyImg.src = productImageSrc;
  
  // Áp dụng CSS nội tuyến
  Object.assign(flyImg.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: `${startRect.width}px`,
    height: `${startRect.height}px`,
    borderRadius: '50%',
    objectFit: 'cover',
    zIndex: '99999',
    pointerEvents: 'none',
    transform: `translate(${startRect.left}px, ${startRect.top}px) scale(1)`,
    transition: 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1), opacity 1.2s ease',
    opacity: '1'
  });
  
  document.body.appendChild(flyImg);

  // Ép trình duyệt render lại (reflow)
  void flyImg.offsetWidth;

  // Tính tọa độ tâm của giỏ hàng
  const cartCenterX = endRect.left + endRect.width / 2;
  const cartCenterY = endRect.top + endRect.height / 2;

  // Tính tọa độ điểm đến cho thẻ ảnh (để tâm ảnh rơi vào tâm giỏ hàng)
  const targetX = cartCenterX - startRect.width / 2;
  const targetY = cartCenterY - startRect.height / 2;

  // Kích hoạt hiệu ứng bay
  flyImg.style.transform = `translate(${targetX}px, ${targetY}px) scale(0.1)`;
  flyImg.style.opacity = '0.4';

  // Xóa DOM sau khi bay xong
  setTimeout(() => {
    flyImg.remove();
    // Tạo hiệu ứng nảy giỏ hàng
    cartIcon.style.transition = 'transform 0.2s ease-out';
    cartIcon.style.transform = 'scale(1.3)';
    setTimeout(() => {
      cartIcon.style.transform = 'scale(1)';
    }, 200);
  }, 1200);
}
