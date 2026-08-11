import React, { useState } from 'react';
import { 
  Search, User, ShoppingBag, ArrowRight, Star, Heart, Check, 
  Sparkles, Leaf, ShieldCheck, Award, Recycle, Smile, Globe, Package, Phone, Mail, MapPin,
  Share2
} from 'lucide-react';

export default function KROrderHomePage() {
  const [cartCount, setCartCount] = useState(2);
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const categories = [
    { id: 'skincare', name: 'Skin Care', icon: <Sparkles size={28} /> },
    { id: 'makeup', name: 'Makeup', icon: <Heart size={28} /> },
    { id: 'haircare', name: 'Hair Care', icon: <Leaf size={28} /> },
    { id: 'bodycare', name: 'Bath & Body', icon: <ShieldCheck size={28} /> },
    { id: 'fragrance', name: 'Fragrances', icon: <Award size={28} /> },
    { id: 'giftsets', name: 'Gift Sets', icon: <Package size={28} /> }
  ];

  const bestSellers = [
    {
      id: 1,
      name: 'Glow Face Serum',
      price: '$29.99',
      priceVnd: '750.000đ',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 2,
      name: 'Hydrating Moisturizer',
      price: '$24.99',
      priceVnd: '625.000đ',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 3,
      name: 'Radiance Face Wash',
      price: '$18.99',
      priceVnd: '475.000đ',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1556229174-5e42a09e45af?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 4,
      name: 'Matte Lipstick',
      price: '$16.99',
      priceVnd: '425.000đ',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 5,
      name: 'Rose Water Toner',
      price: '$19.99',
      priceVnd: '500.000đ',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. Top Announcement Bar */}
      <div className="top-announcement-bar">
        FREE SHIPPING ON ORDERS OVER $75 | <span>GET 10% OFF YOUR FIRST ORDER!</span>
      </div>

      {/* 2. Header & Navigation Bar */}
      <header className="site-header">
        <div className="container">
          <div className="site-nav-wrap">
            {/* Logo */}
            <a href="#" className="brand-logo">
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--purple-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: 'bold',
                fontFamily: 'var(--font-serif)'
              }}>
                K
              </div>
              <span className="brand-logo-text">KR-<span>ORDER</span></span>
            </a>

            {/* Navigation Links */}
            <nav>
              <ul className="nav-links">
                <li><a href="#" className="active">HOME</a></li>
                <li><a href="#shop">SHOP</a></li>
                <li><a href="#skincare">SKIN CARE</a></li>
                <li><a href="#makeup">MAKEUP</a></li>
                <li><a href="#haircare">HAIR CARE</a></li>
                <li><a href="#about">ABOUT US</a></li>
                <li><a href="#blog">BLOG</a></li>
                <li><a href="#contact">CONTACT</a></li>
              </ul>
            </nav>

            {/* Action Icons */}
            <div className="nav-icons">
              <button className="icon-btn" aria-label="Search">
                <Search size={20} />
              </button>
              <button className="icon-btn" aria-label="User Account">
                <User size={20} />
              </button>
              <button className="icon-btn" aria-label="Shopping Bag">
                <ShoppingBag size={20} />
                <span className="cart-badge">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1 }}>

        {/* 3. Hero Banner Section */}
        <section style={{
          background: 'linear-gradient(135deg, #F9F6FA 0%, #EDE6F2 100%)',
          padding: '80px 0',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.1fr',
              gap: '40px',
              alignItems: 'center'
            }}>
              {/* Hero Left Content */}
              <div className="animate-fade-up">
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  letterSpacing: '3px',
                  color: 'var(--purple-primary)',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '16px'
                }}>
                  NATURAL BEAUTY, RADIANT YOU
                </span>
                
                <h1 style={{
                  fontSize: '3.6rem',
                  lineHeight: '1.15',
                  fontWeight: 400,
                  color: 'var(--text-dark)',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-serif)'
                }}>
                  Pure Ingredients, <br />
                  <span className="font-serif-italic" style={{ color: 'var(--purple-primary)' }}>Powerful Results</span>
                </h1>

                <p style={{
                  fontSize: '1rem',
                  color: 'var(--text-muted)',
                  maxWidth: '480px',
                  marginBottom: '32px',
                  lineHeight: '1.7'
                }}>
                  Discover clean, effective and cruelty-free cosmetics for every skin type. Handpicked and direct proxy buying from top Korean beauty brands.
                </p>

                <div style={{ marginBottom: '40px' }}>
                  <a href="#shop" className="btn-gold">
                    <span>SHOP NOW</span>
                    <ArrowRight size={16} />
                  </a>
                </div>

                {/* 3 Badges */}
                <div style={{
                  display: 'flex',
                  gap: '30px',
                  paddingTop: '20px',
                  borderTop: '1px solid rgba(122, 75, 158, 0.15)'
                }}>
                  {[
                    { icon: <Leaf size={18} />, label: 'CLEAN INGREDIENTS' },
                    { icon: <Heart size={18} />, label: 'CRUELTY FREE' },
                    { icon: <Sparkles size={18} />, label: 'FOR ALL SKIN TYPES' }
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--purple-primary)' }}>{item.icon}</span>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: 'var(--text-dark)'
                      }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hero Right Visual */}
              <div style={{ position: 'relative', textAlign: 'center' }}>
                <div style={{
                  width: '100%',
                  height: '480px',
                  borderRadius: '24px',
                  backgroundImage: 'url("https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1000&q=80")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  boxShadow: 'var(--shadow-lg)',
                  border: '8px solid #FFFFFF'
                }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Value Proposition Bar */}
        <section style={{
          background: 'var(--bg-white)',
          padding: '40px 0',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '30px'
            }}>
              {[
                { icon: <Leaf size={24} />, title: 'Natural & Safe', desc: 'Made with natural ingredients you can trust.' },
                { icon: <ShieldCheck size={24} />, title: 'Dermatologically Tested', desc: 'Tested for safety and suitable for all skin.' },
                { icon: <Award size={24} />, title: 'Premium Quality', desc: 'High performance formulas for visible results.' },
                { icon: <Recycle size={24} />, title: 'Sustainable Beauty', desc: 'Eco-conscious packaging for a better tomorrow.' }
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--purple-primary)', flexShrink: 0, marginTop: '2px' }}>
                    {feat.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px' }}>
                      {feat.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Shop by Category Section */}
        <section id="categories" style={{ padding: '80px 0', background: 'var(--bg-ivory)' }}>
          <div className="container">
            <div className="section-title-wrap">
              <div className="section-divider">
                <span>CATEGORIES</span>
              </div>
              <h2 className="section-title">Shop by Category</h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '24px',
              justifyContent: 'center'
            }}>
              {categories.map((cat) => (
                <a key={cat.id} href={`#${cat.id}`} className="category-circle-card">
                  <div className="category-icon-bg">
                    {cat.icon}
                  </div>
                  <span className="category-name">{cat.name}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Feature Spotlight Section (Self Care) */}
        <section style={{ padding: '40px 0 80px 0', background: 'var(--bg-ivory)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.2fr',
              gap: '0',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              background: '#F7F3FA'
            }}>
              {/* Left text */}
              <div style={{
                padding: '60px 50px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <span style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  letterSpacing: '2.5px',
                  color: 'var(--purple-primary)',
                  textTransform: 'uppercase',
                  marginBottom: '12px'
                }}>
                  SELF CARE ISN'T SELFISH
                </span>
                
                <h2 style={{
                  fontSize: '2.6rem',
                  fontWeight: 400,
                  color: 'var(--text-dark)',
                  lineHeight: '1.2',
                  marginBottom: '20px',
                  fontFamily: 'var(--font-serif)'
                }}>
                  Indulge in Everyday <br />
                  <span className="font-serif-italic" style={{ color: 'var(--purple-primary)' }}>Self Care</span>
                </h2>

                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-muted)',
                  marginBottom: '32px',
                  lineHeight: '1.6',
                  maxWidth: '400px'
                }}>
                  Pamper your skin with our nourishing formulas that bring out your natural glow every single day.
                </p>

                <div>
                  <button className="btn-gold">
                    <span>DISCOVER MORE</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              {/* Right Image */}
              <div style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1000&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: '380px'
              }}></div>
            </div>
          </div>
        </section>

        {/* 7. Best Sellers Section */}
        <section id="shop" style={{ padding: '80px 0', background: 'var(--bg-white)' }}>
          <div className="container">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '40px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ height: '1px', width: '30px', background: 'var(--purple-primary)' }}></span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '2px', color: 'var(--purple-primary)', textTransform: 'uppercase' }}>
                    BEST SELLERS
                  </span>
                </div>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 400, fontFamily: 'var(--font-serif)', color: 'var(--text-dark)' }}>
                  Our Most Loved Products
                </h2>
              </div>
              <a href="#" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-dark)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '1px',
                textDecoration: 'none'
              }}>
                VIEW ALL PRODUCTS <ArrowRight size={14} />
              </a>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '24px'
            }}>
              {bestSellers.map((item) => (
                <div key={item.id} className="belora-product-card">
                  <div className="product-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="product-info-body">
                    <h3 className="product-title">{item.name}</h3>
                    <div className="product-price">
                      {item.price} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({item.priceVnd})</span>
                    </div>
                    <div className="product-stars">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="#F5A623" />
                      ))}
                    </div>
                    <button className="btn-outline-dark" style={{ width: '100%' }} onClick={() => setCartCount(c => c + 1)}>
                      <ShoppingBag size={14} /> ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. Brand Story / Stats Bar */}
        <section style={{
          background: 'var(--bg-dark-accent)',
          color: '#FFFFFF',
          padding: '70px 0'
        }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '50px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '3px', color: 'var(--gold-light)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                OUR STORY
              </span>
              <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: '#FFFFFF', fontWeight: 400 }}>
                Beauty That Cares
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'rgba(255,255,255,0.7)', maxWidth: '550px', margin: '12px auto 0 auto', lineHeight: '1.6' }}>
                At KR-ORDER, we believe Korean beauty should be pure, authentic, honest and accessible to everyone in Vietnam and beyond.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '30px',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: '40px'
            }}>
              {[
                { icon: <Heart size={32} />, val: '100%', title: 'Cruelty Free' },
                { icon: <Package size={32} />, val: '50+', title: 'Premium Products' },
                { icon: <Smile size={32} />, val: '10K+', title: 'Happy Customers' },
                { icon: <Globe size={32} />, val: '25+', title: 'Countries Served' }
              ].map((stat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
                  <div style={{ color: 'var(--gold-light)' }}>
                    {stat.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--gold-light)' }}>
                      {stat.val}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px' }}>
                      {stat.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* 9. Footer */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            {/* Col 1 */}
            <div>
              <a href="#" className="brand-logo" style={{ marginBottom: '16px' }}>
                <span className="brand-logo-text">KR-<span>ORDER</span></span>
              </a>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '20px' }}>
                Clean beauty. Conscious choices. Confidence, naturally. Direct Korean proxy ordering service.
              </p>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--purple-primary)' }}>
                <a href="#" style={{ color: 'inherit' }} title="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="#" style={{ color: 'inherit' }} title="Facebook">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="#" style={{ color: 'inherit' }} title="Share">
                  <Share2 size={18} />
                </a>
              </div>
            </div>

            {/* Col 2 */}
            <div className="footer-col">
              <h5>QUICK LINKS</h5>
              <ul className="footer-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">Shop</a></li>
                <li><a href="#">About Us</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQS</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="footer-col">
              <h5>CUSTOMER CARE</h5>
              <ul className="footer-links">
                <li><a href="#">Shipping Policy</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">Terms & Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Track Order</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="footer-col">
              <h5>CONTACT US</h5>
              <ul className="footer-links" style={{ gap: '12px' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Phone size={14} color="var(--purple-primary)" />
                  <span>+1 (800) 123-4567</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Mail size={14} color="var(--purple-primary)" />
                  <span>hello@krorder.com</span>
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <MapPin size={14} color="var(--purple-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span>123 Beauty Lane, Seoul & Saigon</span>
                </li>
              </ul>
            </div>

            {/* Col 5 */}
            <div className="footer-col">
              <h5>NEWSLETTER</h5>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
              </p>
              {subscribed ? (
                <div style={{ color: 'var(--purple-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                  ✓ Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-input-wrap">
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder="Enter your email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-gold" style={{ padding: '10px 20px', borderRadius: '4px', fontSize: '0.75rem' }}>
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '24px',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-light)'
          }}>
            © 2025 KR-ORDER Skincare. All Rights Reserved. Designed for Beauty Lovers.
          </div>
        </div>
      </footer>

    </div>
  );
}
