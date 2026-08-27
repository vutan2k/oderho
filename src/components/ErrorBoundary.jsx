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
            <p style={{ color: '#666', fontSize: '1rem', marginBottom: '16px', lineHeight: '1.6' }}>
              Trang web gặp sự cố không mong muốn. Vui lòng thử tải lại trang hoặc làm mới dữ liệu.
            </p>

            {this.state.error && (
              <div style={{
                margin: '0 auto 24px auto',
                padding: '12px 16px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '8px',
                textAlign: 'left',
                fontSize: '0.78rem',
                color: '#B91C1C',
                fontFamily: 'monospace',
                maxHeight: '120px',
                overflowY: 'auto',
                wordBreak: 'break-word'
              }}>
                <strong>Chi tiết lỗi:</strong> {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 28px',
                  borderRadius: '30px',
                  border: 'none',
                  background: '#7A4B9E',
                  color: '#fff',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.5px'
                }}
              >
                TẢI LẠI TRANG
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch {}
                  window.location.href = '/';
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '30px',
                  border: '1px solid #7A4B9E',
                  background: '#FFF',
                  color: '#7A4B9E',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                LÀM MỚI DỮ LIỆU
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
