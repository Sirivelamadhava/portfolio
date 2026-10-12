window.PORTFOLIO_API_URL = window.PORTFOLIO_API_URL || '';

if (!window.PORTFOLIO_API_URL && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
  window.PORTFOLIO_API_URL = 'http://localhost:3000';
}
