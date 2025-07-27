# Real-Time Orderbook Viewer

A sophisticated React-based trading platform simulation that provides real-time orderbook visualization, order simulation, and market impact analysis for cryptocurrency trading venues.

![Orderbook Viewer](https://img.shields.io/badge/React-18.0+-blue.svg)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🚀 Features

- **Real-Time Orderbook Display**: Live bid/ask visualization with depth chart
- **Multi-Venue Support**: OKX, Bybit, and Deribit integration ready
- **Order Simulation**: Test limit and market orders with impact analysis
- **Market Metrics**: Real-time calculation of slippage, market impact, and fill estimates
- **Responsive Design**: Mobile-first approach with glassmorphism UI
- **Volatility Alerts**: Dynamic market condition notifications
- **Order Book Imbalance Tracking**: Real-time buy/sell pressure indicators

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [API Integration](#api-integration)
- [Libraries and Dependencies](#libraries-and-dependencies)
- [Assumptions](#assumptions)
- [Rate Limiting](#rate-limiting)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 16.0 or higher)
- **npm** (version 8.0 or higher) or **yarn** (version 1.22 or higher)
- **Git** for version control

Check your versions:
```bash
node --version
npm --version
git --version
```

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/orderbook-viewer.git
cd orderbook-viewer
```

### 2. Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Project Setup
The project consists of two main files that need to be placed in your `src` directory:

```
src/
├── OrderbookViewer.js     # Main React component
├── OrderbookViewer.css    # Styling file
└── App.js                 # Your main app file
```

### 4. Update App.js
```jsx
import React from 'react';
import OrderbookViewer from './OrderbookViewer';
import './App.css';

function App() {
  return (
    <div className="App">
      <OrderbookViewer />
    </div>
  );
}

export default App;
```

## 🏃‍♂️ Running Locally

### Development Mode
```bash
# Start the development server
npm start

# Or with yarn
yarn start
```

The application will open at `http://localhost:3000` in your browser.

### Production Build
```bash
# Create optimized production build
npm run build

# Or with yarn
yarn build
```

### Testing
```bash
# Run tests (if implemented)
npm test

# Or with yarn
yarn test
```

### Linting
```bash
# Run ESLint (if configured)
npm run lint

# Or with yarn
yarn lint
```

## 📁 Project Structure

```
orderbook-viewer/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── OrderbookViewer.js      # Main component
│   ├── OrderbookViewer.css     # Styles
│   ├── App.js                  # App entry point
│   └── index.js                # React DOM render
├── package.json
├── README.md
└── .gitignore
```

### Key Files Description

- **OrderbookViewer.js**: Main React component containing all trading functionality
- **OrderbookViewer.css**: Complete styling with responsive design and animations
- **package.json**: Project dependencies and scripts

## 🔌 API Integration

### Current Implementation
The current version uses **mock data simulation** for demonstration purposes. Real API integration requires the following steps:

### Supported Exchanges API Documentation

#### 1. OKX API
- **Documentation**: https://www.okx.com/docs-v5/en/
- **WebSocket Endpoint**: `wss://ws.okx.com:8443/ws/v5/public`
- **Orderbook Channel**: `books5` or `books` 
- **Rate Limit**: 20 requests per 2 seconds per IP

```javascript
// Example OKX WebSocket connection
const okxWs = new WebSocket('wss://ws.okx.com:8443/ws/v5/public');
okxWs.send(JSON.stringify({
  "op": "subscribe",
  "args": [{"channel": "books5", "instId": "BTC-USDT"}]
}));
```

#### 2. Bybit API
- **Documentation**: https://bybit-exchange.github.io/docs/v5/intro
- **WebSocket Endpoint**: `wss://stream.bybit.com/v5/public/spot`
- **Orderbook Channel**: `orderbook.{depth}.{symbol}`
- **Rate Limit**: 10 requests per second per IP

```javascript
// Example Bybit WebSocket connection
const bybitWs = new WebSocket('wss://stream.bybit.com/v5/public/spot');
bybitWs.send(JSON.stringify({
  "op": "subscribe",
  "args": ["orderbook.50.BTCUSDT"]
}));
```

#### 3. Deribit API
- **Documentation**: https://docs.deribit.com/
- **WebSocket Endpoint**: `wss://www.deribit.com/ws/api/v2`
- **Orderbook Channel**: `book.{instrument_name}.{group}.{depth}.{interval}`
- **Rate Limit**: 20 requests per second

```javascript
// Example Deribit WebSocket connection
const deribitWs = new WebSocket('wss://www.deribit.com/ws/api/v2');
deribitWs.send(JSON.stringify({
  "jsonrpc": "2.0",
  "method": "public/subscribe",
  "params": {"channels": ["book.BTC-PERPETUAL.100ms"]},
  "id": 1
}));
```

### Real API Integration Steps

1. **Replace Mock Data Generation**:
   ```javascript
   // In OrderbookViewer.js, replace generateMockOrderbook() with:
   const connectWebSocket = (venue) => {
     const wsEndpoints = {
       okx: 'wss://ws.okx.com:8443/ws/v5/public',
       bybit: 'wss://stream.bybit.com/v5/public/spot',
       deribit: 'wss://www.deribit.com/ws/api/v2'
     };
     
     const ws = new WebSocket(wsEndpoints[venue]);
     // Add connection logic here
   };
   ```

2. **Add Environment Variables**:
   ```bash
   # .env file
   REACT_APP_OKX_WS_URL=wss://ws.okx.com:8443/ws/v5/public
   REACT_APP_BYBIT_WS_URL=wss://stream.bybit.com/v5/public/spot
   REACT_APP_DERIBIT_WS_URL=wss://www.deribit.com/ws/api/v2
   ```

3. **Error Handling**:
   ```javascript
   const handleWebSocketError = (error, venue) => {
     console.error(`${venue} WebSocket error:`, error);
     // Implement reconnection logic
   };
   ```

## 📚 Libraries and Dependencies

### Core Dependencies
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0"
}
```

### Development Dependencies
```json
{
  "react-scripts": "5.0.1",
  "@testing-library/react": "^13.0.0",
  "@testing-library/jest-dom": "^5.16.0"
}
```

### Optional Dependencies (for enhanced features)
```bash
# For advanced charting (alternative to current CSS-based charts)
npm install recharts

# For WebSocket management
npm install ws

# For state management (if scaling)
npm install @reduxjs/toolkit react-redux

# For API calls
npm install axios

# For date/time handling
npm install date-fns
```

### No External Dependencies Required
The current implementation deliberately avoids external dependencies to ensure:
- **Fast loading times**
- **Reduced bundle size**
- **No version conflicts**
- **Easy deployment**

## 🔍 Assumptions

### Technical Assumptions
1. **Browser Compatibility**: Modern browsers supporting ES6+ features
2. **Screen Resolution**: Optimized for 1920x1080, responsive down to 320px width
3. **JavaScript Enabled**: Client-side rendering requires JavaScript
4. **WebSocket Support**: For real-time data (currently mocked)

### Data Assumptions
1. **Price Precision**: Up to 2 decimal places for USD pairs
2. **Volume Precision**: Up to 4 decimal places for crypto quantities
3. **Update Frequency**: 500ms intervals for orderbook updates
4. **Market Hours**: 24/7 operation assumed for crypto markets

### Business Logic Assumptions
1. **Order Matching**: FIFO (First In, First Out) order matching
2. **Slippage Calculation**: Based on available liquidity in orderbook
3. **Market Impact**: Calculated as price movement from best bid/ask
4. **Fill Simulation**: Assumes instant execution for demonstration

### UI/UX Assumptions
1. **User Expertise**: Assumes familiarity with trading terminology
2. **Mobile Usage**: Touch-friendly interface with responsive design
3. **Color Accessibility**: Red/green color coding with additional text indicators
4. **Network Stability**: Assumes stable internet connection for real-time features

## ⚡ Rate Limiting

### Current Implementation (Mock Data)
- **Update Frequency**: 500ms intervals
- **No API Limits**: Simulated data has no restrictions

### Real API Integration Rate Limits

#### OKX Exchange
- **WebSocket**: 20 connections per IP
- **REST API**: 20 requests per 2 seconds per IP
- **Orderbook Updates**: Up to 400ms intervals
- **Recommendation**: Implement connection pooling

#### Bybit Exchange  
- **WebSocket**: 10 connections per IP
- **REST API**: 10 requests per second per IP
- **Orderbook Updates**: Real-time push
- **Recommendation**: Use single connection with multiple subscriptions

#### Deribit Exchange
- **WebSocket**: 20 requests per second
- **REST API**: 20 requests per second
- **Orderbook Updates**: 100ms intervals available
- **Recommendation**: Subscribe to appropriate depth level

### Rate Limiting Best Practices

1. **Connection Management**:
   ```javascript
   const rateLimiter = {
     okx: { maxConnections: 20, current: 0 },
     bybit: { maxConnections: 10, current: 0 },
     deribit: { maxConnections: 20, current: 0 }
   };
   ```

2. **Request Queuing**:
   ```javascript
   const requestQueue = [];
   const processQueue = () => {
     // Implement rate-limited request processing
   };
   ```

3. **Error Handling**:
   ```javascript
   const handleRateLimit = (error) => {
     if (error.code === 429) {
       // Implement exponential backoff
       setTimeout(() => retryRequest(), Math.pow(2, retryCount) * 1000);
     }
   };
   ```

4. **Monitoring**:
   ```javascript
   const rateLimitMonitor = {
     requests: 0,
     resetTime: Date.now() + 60000,
     checkLimit: () => {
       // Monitor and log rate limit usage
     }
   };
   ```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file in the root directory:

```bash
# API Configuration
REACT_APP_API_MODE=mock # or 'live'
REACT_APP_DEFAULT_VENUE=okx
REACT_APP_DEFAULT_SYMBOL=BTC-USD

# WebSocket URLs (for live mode)
REACT_APP_OKX_WS_URL=wss://ws.okx.com:8443/ws/v5/public
REACT_APP_BYBIT_WS_URL=wss://stream.bybit.com/v5/public/spot
REACT_APP_DERIBIT_WS_URL=wss://www.deribit.com/ws/api/v2

# Update Intervals (milliseconds)
REACT_APP_ORDERBOOK_UPDATE_INTERVAL=500
REACT_APP_METRICS_UPDATE_INTERVAL=1000

# Display Configuration
REACT_APP_MAX_ORDERBOOK_LEVELS=15
REACT_APP_PRICE_PRECISION=2
REACT_APP_SIZE_PRECISION=4

# Development
GENERATE_SOURCEMAP=false
REACT_APP_DEBUG_MODE=false
```

### Configuration Object
```javascript
// config.js
export const config = {
  api: {
    mode: process.env.REACT_APP_API_MODE || 'mock',
    defaultVenue: process.env.REACT_APP_DEFAULT_VENUE || 'okx',
    defaultSymbol: process.env.REACT_APP_DEFAULT_SYMBOL || 'BTC-USD'
  },
  websocket: {
    okx: process.env.REACT_APP_OKX_WS_URL,
    bybit: process.env.REACT_APP_BYBIT_WS_URL,
    deribit: process.env.REACT_APP_DERIBIT_WS_URL
  },
  display: {
    maxLevels: parseInt(process.env.REACT_APP_MAX_ORDERBOOK_LEVELS) || 15,
    pricePrecision: parseInt(process.env.REACT_APP_PRICE_PRECISION) || 2,
    sizePrecision: parseInt(process.env.REACT_APP_SIZE_PRECISION) || 4
  }
};
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=build
```

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Deploy to GitHub Pages
```bash
# Install gh-pages
npm install --save-dev gh-pages

# Add to package.json scripts:
"homepage": "https://yourusername.github.io/orderbook-viewer",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

### Test Structure
```
src/
├── __tests__/
│   ├── OrderbookViewer.test.js
│   ├── utils.test.js
│   └── integration.test.js
└── __mocks__/
    └── websocket.js
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Styles not loading**:
   - Ensure `OrderbookViewer.css` is in the correct directory
   - Check import statement: `import './OrderbookViewer.css'`

2. **WebSocket connection fails**:
   - Check network connectivity
   - Verify API endpoints are accessible
   - Review rate limiting constraints

3. **Performance issues**:
   - Reduce update intervals in configuration
   - Limit orderbook depth levels
   - Check browser developer tools for memory leaks

### Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/your-username/orderbook-viewer/issues)
- **Documentation**: Check this README and inline code comments
- **Community**: Join our discussions in GitHub Discussions

## 📊 Performance Optimization

### Bundle Size Optimization
```bash
# Analyze bundle size
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

### Memory Management
- WebSocket connections are properly cleaned up
- Intervals cleared on component unmount
- React.memo() used for expensive components

### Rendering Optimization
- useCallback() prevents unnecessary re-renders
- useMemo() for expensive calculations
- Virtual scrolling for large orderbooks (future enhancement)

---
