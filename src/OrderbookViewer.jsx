import React, { useState, useEffect, useCallback, useRef } from 'react';
import './OrderbookViewer.css';

const OrderbookViewer = () => {
  // State management
  const [currentVenue, setCurrentVenue] = useState('okx');
  const [currentSymbol, setCurrentSymbol] = useState('BTC-USD');
  const [orderbook, setOrderbook] = useState({ bids: [], asks: [] });
  const [simulatedOrder, setSimulatedOrder] = useState(null);
  const [orderType, setOrderType] = useState('limit');
  const [orderSide, setOrderSide] = useState('buy');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [timingDelay, setTimingDelay] = useState('0');
  const [isSimulating, setIsSimulating] = useState(false);
  const [metrics, setMetrics] = useState({
    fillPercentage: '0',
    marketImpact: '0.00',
    slippage: '0.00',
    timeToFill: '--',
    avgFillPrice: '0.00',
    totalCost: '0.00'
  });
  const [imbalanceIndicator, setImbalanceIndicator] = useState({
    type: 'BALANCED',
    color: 'rgba(255, 255, 255, 0.2)'
  });
  const [volatilityAlert, setVolatilityAlert] = useState(null);

  // Refs
  const updateIntervalRef = useRef(null);
  const trendDirectionRef = useRef(0);
  const lastTrendChangeRef = useRef(Date.now());

  // Generate mock orderbook data
  const generateMockOrderbook = useCallback(() => {
    const basePrices = {
      'BTC-USD': 45000,
      'ETH-USD': 2800,
      'SOL-USD': 100,
      'ADA-USD': 0.5
    };

    const basePrice = basePrices[currentSymbol] || 45000;
    
    // Generate bids (below market price)
    const bids = [];
    for (let i = 0; i < 20; i++) {
      const price = basePrice - (i * basePrice * 0.001) - (Math.random() * basePrice * 0.0005);
      const size = Math.random() * 10 + 0.1;
      bids.push({
        price: price,
        size: size,
        total: price * size
      });
    }

    // Generate asks (above market price)
    const asks = [];
    for (let i = 0; i < 20; i++) {
      const price = basePrice + (i * basePrice * 0.001) + (Math.random() * basePrice * 0.0005);
      const size = Math.random() * 10 + 0.1;
      asks.push({
        price: price,
        size: size,
        total: price * size
      });
    }

    setOrderbook({ bids, asks });
  }, [currentSymbol]);

  // Update random orderbook level
  const updateRandomOrderbookLevel = useCallback(() => {
    setOrderbook(prevOrderbook => {
      const newOrderbook = { ...prevOrderbook };
      const side = Math.random() > 0.5 ? 'bids' : 'asks';
      const index = Math.floor(Math.random() * 10);
      
      if (newOrderbook[side][index]) {
        const adjustment = 0.8 + (Math.random() * 0.4);
        newOrderbook[side][index] = {
          ...newOrderbook[side][index],
          size: newOrderbook[side][index].size * adjustment
        };
        newOrderbook[side][index].total = 
          newOrderbook[side][index].price * newOrderbook[side][index].size;
      }
      
      return newOrderbook;
    });
  }, []);

  // Apply market trend
  const applyTrend = useCallback(() => {
    const adjustment = trendDirectionRef.current * 0.001 * (0.5 + Math.random() * 0.5);
    
    setOrderbook(prevOrderbook => {
      const newOrderbook = { ...prevOrderbook };
      
      newOrderbook.bids = newOrderbook.bids.map(bid => ({
        ...bid,
        price: bid.price * (1 + adjustment),
        total: bid.price * (1 + adjustment) * bid.size
      }));

      newOrderbook.asks = newOrderbook.asks.map(ask => ({
        ...ask,
        price: ask.price * (1 + adjustment),
        total: ask.price * (1 + adjustment) * ask.size
      }));

      return newOrderbook;
    });
  }, []);

  // Create volatility spike
  const createVolatilitySpike = useCallback(() => {
    const spikeIntensity = 0.002 + Math.random() * 0.003;
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    setOrderbook(prevOrderbook => {
      const newOrderbook = { ...prevOrderbook };
      
      newOrderbook.bids = newOrderbook.bids.map((bid, index) => {
        if (index < 5) {
          const newPrice = bid.price * (1 - spikeIntensity * direction);
          const newSize = bid.size * 0.7;
          return {
            ...bid,
            price: newPrice,
            size: newSize,
            total: newPrice * newSize
          };
        }
        return bid;
      });

      newOrderbook.asks = newOrderbook.asks.map((ask, index) => {
        if (index < 5) {
          const newPrice = ask.price * (1 + spikeIntensity * direction);
          const newSize = ask.size * 0.7;
          return {
            ...ask,
            price: newPrice,
            size: newSize,
            total: newPrice * newSize
          };
        }
        return ask;
      });

      return newOrderbook;
    });

    // Show volatility alert
    const alertDirection = direction > 0 ? 'upward' : 'downward';
    setVolatilityAlert(`⚠️ High volatility detected - ${alertDirection} pressure`);
    setTimeout(() => setVolatilityAlert(null), 3000);
  }, []);

  // Update imbalance indicator
  const updateImbalanceIndicator = useCallback(() => {
    const totalBidVolume = orderbook.bids.slice(0, 10)
      .reduce((sum, bid) => sum + bid.size, 0);
    const totalAskVolume = orderbook.asks.slice(0, 10)
      .reduce((sum, ask) => sum + ask.size, 0);
    
    const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);
    
    if (Math.abs(imbalance) > 0.2) {
      setImbalanceIndicator({
        type: imbalance > 0 ? 'BUY PRESSURE' : 'SELL PRESSURE',
        color: imbalance > 0 ? 'rgba(46, 213, 115, 0.8)' : 'rgba(255, 71, 87, 0.8)'
      });
    } else {
      setImbalanceIndicator({
        type: 'BALANCED',
        color: 'rgba(255, 255, 255, 0.2)'
      });
    }
  }, [orderbook]);

  // Simple depth chart without D3
  const renderSimpleDepthChart = useCallback(() => {
    if (orderbook.bids.length === 0 || orderbook.asks.length === 0) return null;

    // Calculate cumulative volumes
    let cumulativeBids = [];
    let cumulativeAsks = [];
    
    let bidVolume = 0;
    orderbook.bids.slice(0, 10).forEach(bid => {
      bidVolume += bid.size;
      cumulativeBids.push({ price: bid.price, volume: bidVolume });
    });

    let askVolume = 0;
    orderbook.asks.slice(0, 10).forEach(ask => {
      askVolume += ask.size;
      cumulativeAsks.push({ price: ask.price, volume: askVolume });
    });

    const maxVolume = Math.max(
      Math.max(...cumulativeBids.map(d => d.volume)),
      Math.max(...cumulativeAsks.map(d => d.volume))
    );

    return (
      <div className="depth-chart-content">
        {/* Bid bars */}
        <div className="depth-chart-bids">
          {cumulativeBids.reverse().map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="depth-bar bid"
              style={{ height: `${(bid.volume / maxVolume) * 100}%` }}
              title={`Price: $${bid.price.toFixed(2)}, Volume: ${bid.volume.toFixed(2)}`}
            />
          ))}
        </div>
        
        {/* Ask bars */}
        <div className="depth-chart-asks">
          {cumulativeAsks.map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="depth-bar ask"
              style={{ height: `${(ask.volume / maxVolume) * 100}%` }}
              title={`Price: $${ask.price.toFixed(2)}, Volume: ${ask.volume.toFixed(2)}`}
            />
          ))}
        </div>
        
        {/* Center line */}
        <div className="depth-center-line" />
        
        {/* Labels */}
        <div className="depth-label bids">Bids</div>
        <div className="depth-label asks">Asks</div>
      </div>
    );
  }, [orderbook]);

  // Calculate order metrics
  const calculateOrderMetrics = useCallback((order) => {
    if (!order) return;

    const { side, price, quantity } = order;
    const relevantSide = side === 'buy' ? orderbook.asks : orderbook.bids;
    
    let fillQuantity = 0;
    let totalCost = 0;
    
    // Calculate how much would be filled
    for (let level of relevantSide) {
      if (side === 'buy' && level.price <= price || 
          side === 'sell' && level.price >= price || 
          order.type === 'market') {
        
        const availableSize = level.size;
        const neededSize = quantity - fillQuantity;
        const fillSize = Math.min(availableSize, neededSize);
        
        fillQuantity += fillSize;
        totalCost += fillSize * level.price;
        
        if (fillQuantity >= quantity) break;
      }
    }

    const avgPrice = fillQuantity > 0 ? totalCost / fillQuantity : 0;
    const fillPercentage = (fillQuantity / quantity) * 100;
    
    // Calculate market impact
    const bestPrice = side === 'buy' ? orderbook.asks[0].price : orderbook.bids[0].price;
    const marketImpact = Math.abs((avgPrice - bestPrice) / bestPrice) * 100;
    
    // Calculate slippage
    const slippage = Math.abs((avgPrice - price) / price) * 100;
    
    // Estimate time to fill
    const timeToFill = fillPercentage === 100 ? 
      Math.random() * 30 + 5 : 
      'Partial';

    setMetrics({
      fillPercentage: fillPercentage.toFixed(1),
      marketImpact: marketImpact.toFixed(3),
      slippage: order.type === 'market' ? marketImpact.toFixed(3) : slippage.toFixed(3),
      timeToFill: typeof timeToFill === 'number' ? `${timeToFill.toFixed(0)}s` : timeToFill,
      avgFillPrice: avgPrice.toFixed(2),
      totalCost: totalCost.toFixed(2)
    });
  }, [orderbook]);

  // Simulate order
  const simulateOrder = useCallback(() => {
    const venue = currentVenue;
    const symbol = currentSymbol;
    const type = orderType;
    const side = orderSide;
    const price = parseFloat(orderPrice) || 0;
    const quantity = parseFloat(orderQuantity);
    const timing = parseInt(timingDelay);

    const order = {
      venue,
      symbol,
      type,
      side,
      price: type === 'market' ? (side === 'buy' ? orderbook.asks[0].price : orderbook.bids[0].price) : price,
      quantity,
      timing
    };

    setSimulatedOrder(order);
    setIsSimulating(true);

    setTimeout(() => {
      calculateOrderMetrics(order);
      setIsSimulating(false);
    }, timing);
  }, [currentVenue, currentSymbol, orderType, orderSide, orderPrice, orderQuantity, timingDelay, orderbook, calculateOrderMetrics]);

  // Check if simulated order position
  const isSimulatedOrderPosition = useCallback((order, side, index) => {
    if (!simulatedOrder) return false;
    
    const simPrice = simulatedOrder.price;
    const simSide = simulatedOrder.side;
    
    if (simSide === 'buy' && side === 'bid') {
      return simPrice <= order.price && (index === 0 || simPrice > orderbook.bids[index - 1]?.price);
    } else if (simSide === 'sell' && side === 'ask') {
      return simPrice >= order.price && (index === 0 || simPrice < orderbook.asks[index - 1]?.price);
    }
    
    return false;
  }, [simulatedOrder, orderbook]);

  // Form validation
  const isFormValid = useCallback(() => {
    return orderQuantity && (orderType === 'market' || orderPrice);
  }, [orderQuantity, orderType, orderPrice]);

  // Get metric value class
  const getMetricClass = (key, value) => {
    if (key === 'marketImpact' || key === 'slippage') {
      const numValue = parseFloat(value);
      if (numValue > 0.5) return 'metric-value danger';
      if (numValue > 0.1) return 'metric-value warning';
      return 'metric-value good';
    }
    return 'metric-value good';
  };

  // Initialize and cleanup effects
  useEffect(() => {
    generateMockOrderbook();
  }, [generateMockOrderbook]);

  useEffect(() => {
    updateImbalanceIndicator();
  }, [updateImbalanceIndicator]);

  // Start data simulation
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      // Random orderbook updates
      if (Math.random() > 0.7) {
        updateRandomOrderbookLevel();
      }

      // Trend changes
      if (Date.now() - lastTrendChangeRef.current > 30000 && Math.random() > 0.9) {
        trendDirectionRef.current = Math.floor(Math.random() * 3) - 1;
        lastTrendChangeRef.current = Date.now();
      }

      // Apply trend
      if (trendDirectionRef.current !== 0) {
        applyTrend();
      }

      // Volatility spikes
      if (Math.random() > 0.95) {
        createVolatilitySpike();
      }
    }, 500);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [updateRandomOrderbookLevel, applyTrend, createVolatilitySpike]);

  return (
    <div className="orderbook-container">
      {/* Volatility Alert */}
      {volatilityAlert && (
        <div className="volatility-alert">
          {volatilityAlert}
        </div>
      )}

      <div className="main-container">
        {/* Header */}
        <div className="header">
          <h1>Real-Time Orderbook Viewer</h1>
          <p>Advanced Order Simulation & Market Analysis Platform</p>
        </div>

        {/* Main Grid */}
        <div className="main-grid">
          {/* Orderbook Section */}
          <div className="orderbook-section">
            {/* Imbalance Indicator */}
            <div 
              className="imbalance-indicator"
              style={{ background: imbalanceIndicator.color }}
            >
              {imbalanceIndicator.type}
            </div>

            {/* Venue Selector */}
            <div className="venue-selector">
              {['okx', 'bybit', 'deribit'].map(venue => (
                <button
                  key={venue}
                  onClick={() => setCurrentVenue(venue)}
                  className={`venue-btn ${currentVenue === venue ? 'active' : ''}`}
                >
                  {venue.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Connection Status */}
            <div className="connection-status">
              Connected to {currentVenue.toUpperCase()}
            </div>

            {/* Orderbook */}
            <div className="orderbook-container-inner">
              <div className="orderbook-header">
                <div>Price (USD)</div>
                <div>Size</div>
                <div>Total</div>
              </div>

              {/* Asks (reversed) */}
              {orderbook.asks.slice(0, 15).reverse().map((ask, index) => (
                <div
                  key={`ask-${index}`}
                  className={`orderbook-row ask ${
                    isSimulatedOrderPosition(ask, 'ask', index) ? 'simulated-order' : ''
                  }`}
                >
                  <div>${ask.price.toFixed(2)}</div>
                  <div>{ask.size.toFixed(4)}</div>
                  <div>${ask.total.toFixed(2)}</div>
                </div>
              ))}

              {/* Spread Indicator */}
              {orderbook.asks.length > 0 && orderbook.bids.length > 0 && (
                <div className="spread-indicator">
                  Spread: ${(orderbook.asks[0].price - orderbook.bids[0].price).toFixed(2)} (
                  {(((orderbook.asks[0].price - orderbook.bids[0].price) / orderbook.bids[0].price) * 100).toFixed(4)}%)
                </div>
              )}

              {/* Bids */}
              {orderbook.bids.slice(0, 15).map((bid, index) => (
                <div
                  key={`bid-${index}`}
                  className={`orderbook-row bid ${
                    isSimulatedOrderPosition(bid, 'bid', index) ? 'simulated-order' : ''
                  }`}
                >
                  <div>${bid.price.toFixed(2)}</div>
                  <div>{bid.size.toFixed(4)}</div>
                  <div>${bid.total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Depth Chart */}
            <div className="depth-chart">
              {renderSimpleDepthChart()}
            </div>
          </div>

          {/* Order Form Section */}
          <div className="order-form-section">
            <h3 className="form-section-title">Order Simulation</h3>
            
            {/* Venue Select */}
            <div className="form-group">
              <label className="form-label">Venue</label>
              <select
                value={currentVenue}
                onChange={(e) => setCurrentVenue(e.target.value)}
                className="form-select"
              >
                <option value="okx">OKX</option>
                <option value="bybit">Bybit</option>
                <option value="deribit">Deribit</option>
              </select>
            </div>

            {/* Symbol Select */}
            <div className="form-group">
              <label className="form-label">Symbol</label>
              <select
                value={currentSymbol}
                onChange={(e) => setCurrentSymbol(e.target.value)}
                className="form-select"
              >
                <option value="BTC-USD">BTC-USD</option>
                <option value="ETH-USD">ETH-USD</option>
                <option value="SOL-USD">SOL-USD</option>
                <option value="ADA-USD">ADA-USD</option>
              </select>
            </div>

            {/* Order Type */}
            <div className="form-group">
              <label className="form-label">Order Type</label>
              <div className="button-group">
                {['limit', 'market'].map(type => (
                  <button
                    key={type}
                    onClick={() => setOrderType(type)}
                    className={`type-btn ${orderType === type ? 'active' : ''}`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Side */}
            <div className="form-group">
              <label className="form-label">Side</label>
              <div className="button-group">
                <button
                  onClick={() => setOrderSide('buy')}
                  className={`side-btn buy ${orderSide === 'buy' ? 'active' : ''}`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderSide('sell')}
                  className={`side-btn sell ${orderSide === 'sell' ? 'active' : ''}`}
                >
                  Sell
                </button>
              </div>
            </div>

            {/* Price (only for limit orders) */}
            {orderType === 'limit' && (
              <div className="form-group">
                <label className="form-label">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  placeholder="Enter price"
                  className="form-input"
                />
              </div>
            )}

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                step="0.001"
                value={orderQuantity}
                onChange={(e) => setOrderQuantity(e.target.value)}
                placeholder="Enter quantity"
                className="form-input"
              />
            </div>

            {/* Timing Delay */}
            <div className="form-group">
              <label className="form-label">Timing Simulation</label>
              <select
                value={timingDelay}
                onChange={(e) => setTimingDelay(e.target.value)}
                className="form-select"
              >
                <option value="0">Immediate</option>
                <option value="5000">5s Delay</option>
                <option value="10000">10s Delay</option>
                <option value="30000">30s Delay</option>
              </select>
            </div>

            {/* Simulate Button */}
            <button
              onClick={simulateOrder}
              disabled={!isFormValid() || isSimulating}
              className="simulate-btn"
            >
              {isSimulating ? (
                <>
                  <div className="spinner"></div>
                  Simulating...
                </>
              ) : (
                'Simulate Order Placement'
              )}
            </button>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="metrics-section">
          <h3 className="metrics-title">Order Impact Analysis</h3>
          <div className="metrics-grid">
            {[
              { label: 'Estimated Fill', value: `${metrics.fillPercentage}%`, key: 'fillPercentage' },
              { label: 'Market Impact', value: `${metrics.marketImpact}%`, key: 'marketImpact' },
              { label: 'Slippage', value: `${metrics.slippage}%`, key: 'slippage' },
              { label: 'Est. Time to Fill', value: metrics.timeToFill, key: 'timeToFill' },
              { label: 'Avg Fill Price', value: `${metrics.avgFillPrice}`, key: 'avgFillPrice' },
              { label: 'Total Cost', value: `${metrics.totalCost}`, key: 'totalCost' }
            ].map((metric) => (
              <div key={metric.key} className="metric-card">
                <div className={getMetricClass(metric.key, metrics[metric.key])}>
                  {metric.value}
                </div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderbookViewer;