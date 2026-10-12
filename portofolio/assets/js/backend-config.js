const isLocalPortfolio = ['localhost', '127.0.0.1'].includes(window.location.hostname);
window.PORTFOLIO_API_URL = window.PORTFOLIO_API_URL || (
  isLocalPortfolio
    ? 'http://localhost:3000'
    : 'https://portfolio-backend-dr0h.onrender.com'
);
