import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-ivory, #FDFBF7)',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '500px' }}>
            <h1 style={{
              fontSize: '2rem',
              fontFamily: 'Georgia, serif',
              color: '#7A4B9E',
              marginBottom: '16px'
            }}>
              Đã xảy ra lỗi
            </h1>
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: '24px', lineHeight: '1.6' }}>
              Trang web gặp sự cố không mong muốn. Vui lòng thử tải lại trang.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 32px',
                borderRadius: '30px',
                border: 'none',
                background: '#7A4B9E',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '1px'
              }}
            >
              TẢI LẠI TRANG
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
