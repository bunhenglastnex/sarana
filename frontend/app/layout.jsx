import './globals.css';

export const metadata = {
  title: 'Sarana Restaurant | Online Ordering (Cash Only)',
  description: 'Order fresh food online with in-house delivery or store pickup. Cash on delivery & counter cash.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="km">
      <body>
        <nav className="navbar">
          <div className="container nav-inner">
            <a href="/" className="brand">
              <span>🍔</span>
              <span>Sarana Restaurant</span>
            </a>
            <div className="nav-links">
              <a href="/" className="nav-link">
                🛍️ Menu (Customer)
              </a>
              <a href="/admin" className="nav-link">
                🏪 Kitchen / Admin
              </a>
              <a href="/delivery" className="nav-link">
                🚚 Delivery Staff
              </a>
              <a href="/track" className="nav-link">
                📍 Track Order
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
