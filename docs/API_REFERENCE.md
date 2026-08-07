# TradeFlow API Reference

Complete API documentation for all TradeFlow endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require Clerk authentication. Include the session token in your requests:

```javascript
headers: {
  'Authorization': 'Bearer <clerk-session-token>'
}
```

## Response Format

### Success Response
```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Portfolio APIs

### GET /api/portfolio/summary
Get portfolio summary with total value, P&L, and allocation.

**Response:**
```json
{
  "totalValue": 500000,
  "totalInvested": 450000,
  "totalPnL": 50000,
  "totalPnLPercentage": 11.11,
  "dayPnL": 5000,
  "dayPnLPercentage": 1.0,
  "allocation": {
    "equity": 80,
    "derivatives": 20
  }
}
```

### GET /api/portfolio/holdings
Get current holdings with P&L details.

**Query Parameters:**
- `symbol` (optional) - Filter by symbol

**Response:**
```json
{
  "holdings": [
    {
      "id": "holding-id",
      "symbol": "RELIANCE",
      "quantity": 100,
      "averagePrice": 2500.00,
      "currentPrice": 2550.00,
      "investedValue": 250000,
      "currentValue": 255000,
      "pnl": 5000,
      "pnlPercentage": 2.0,
      "dayChange": 50.00,
      "dayChangePercentage": 2.0
    }
  ]
}
```

### GET /api/portfolio/positions
Get open positions (intraday).

**Response:**
```json
{
  "positions": [
    {
      "id": "position-id",
      "symbol": "NIFTY24MAR24000CE",
      "quantity": 50,
      "buyPrice": 100.00,
      "currentPrice": 110.00,
      "pnl": 500,
      "pnlPercentage": 10.0
    }
  ]
}
```

### GET /api/portfolio/metrics
Get portfolio performance metrics.

**Response:**
```json
{
  "winRate": 65.5,
  "avgProfit": 5000,
  "avgLoss": -2000,
  "totalTrades": 150,
  "profitableTrades": 98,
  "losingTrades": 52
}
```

---

## Order APIs

### GET /api/orders
Get order history with filters.

**Query Parameters:**
- `status` (optional) - PENDING, FILLED, CANCELLED, REJECTED, PARTIALLY_FILLED
- `symbol` (optional) - Filter by symbol
- `fromDate` (optional) - ISO date string
- `toDate` (optional) - ISO date string
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "orders": [
    {
      "id": "order-id",
      "symbol": "RELIANCE",
      "orderType": "LIMIT",
      "transactionType": "BUY",
      "quantity": 10,
      "price": 2500.00,
      "filledQuantity": 10,
      "status": "FILLED",
      "createdAt": "2024-03-20T10:00:00Z",
      "updatedAt": "2024-03-20T10:01:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

### GET /api/orders/[id]
Get order details by ID.

**Response:**
```json
{
  "order": {
    "id": "order-id",
    "symbol": "RELIANCE",
    "orderType": "LIMIT",
    "transactionType": "BUY",
    "quantity": 10,
    "price": 2500.00,
    "filledQuantity": 10,
    "averagePrice": 2500.00,
    "status": "FILLED",
    "statusMessage": "Order filled successfully",
    "exchange": "NSE",
    "productType": "DELIVERY",
    "validity": "DAY",
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:01:00Z",
    "logs": [
      {
        "timestamp": "2024-03-20T10:00:00Z",
        "status": "PENDING",
        "message": "Order placed"
      },
      {
        "timestamp": "2024-03-20T10:01:00Z",
        "status": "FILLED",
        "message": "Order filled at 2500.00"
      }
    ]
  }
}
```

### POST /api/orders
Place a new order.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "transactionType": "BUY",
  "orderType": "LIMIT",
  "quantity": 10,
  "price": 2500.00,
  "productType": "DELIVERY",
  "validity": "DAY",
  "disclosedQuantity": 0,
  "triggerPrice": null
}
```

**Response:**
```json
{
  "orderId": "order-id",
  "status": "PENDING",
  "message": "Order placed successfully"
}
```

### PATCH /api/orders/[id]
Modify an existing order.

**Request Body:**
```json
{
  "quantity": 15,
  "price": 2510.00
}
```

**Response:**
```json
{
  "message": "Order modified successfully",
  "order": { ... }
}
```

### DELETE /api/orders/[id]
Cancel an order.

**Response:**
```json
{
  "message": "Order cancelled successfully"
}
```

---

## Market APIs

### GET /api/market/overview
Get market overview with indices.

**Response:**
```json
{
  "indices": [
    {
      "symbol": "NIFTY50",
      "value": 22000.50,
      "change": 150.25,
      "changePercentage": 0.69
    }
  ],
  "topGainers": [...],
  "topLosers": [...],
  "mostActive": [...]
}
```

### GET /api/market/indices
Get index quotes.

**Response:**
```json
{
  "indices": [
    {
      "symbol": "NIFTY50",
      "name": "Nifty 50",
      "value": 22000.50,
      "open": 21900.00,
      "high": 22050.00,
      "low": 21850.00,
      "close": 22000.50,
      "change": 150.25,
      "changePercentage": 0.69
    }
  ]
}
```

### GET /api/market/search
Search for instruments.

**Query Parameters:**
- `q` (required) - Search query
- `exchange` (optional) - NSE, BSE, NFO, BFO
- `segment` (optional) - EQ, OPTIDX, OPTSTK, FUTIDX, FUTSTK

**Response:**
```json
{
  "results": [
    {
      "symbol": "RELIANCE",
      "name": "Reliance Industries Ltd",
      "exchange": "NSE",
      "segment": "EQ",
      "instrumentType": "EQ",
      "lastPrice": 2550.00
    }
  ]
}
```

---

## Instrument APIs

### GET /api/instruments
Get list of tradable instruments.

**Query Parameters:**
- `exchange` (optional) - NSE, BSE, NFO, BFO
- `segment` (optional) - EQ, OPTIDX, OPTSTK
- `search` (optional) - Search query

**Response:**
```json
{
  "instruments": [
    {
      "id": "instrument-id",
      "symbol": "RELIANCE",
      "name": "Reliance Industries Ltd",
      "exchange": "NSE",
      "segment": "EQ",
      "isin": "INE002A01018",
      "lotSize": 1,
      "tickSize": 0.05,
      "tradable": true
    }
  ]
}
```

### GET /api/instruments/[symbol]
Get instrument details.

**Response:**
```json
{
  "instrument": {
    "symbol": "RELIANCE",
    "name": "Reliance Industries Ltd",
    "exchange": "NSE",
    "segment": "EQ",
    "isin": "INE002A01018",
    "lotSize": 1,
    "tickSize": 0.05,
    "tradable": true,
    "lastPrice": 2550.00,
    "change": 50.00,
    "changePercentage": 2.0,
    "volume": 1000000,
    "open": 2500.00,
    "high": 2560.00,
    "low": 2490.00,
    "close": 2550.00
  }
}
```

### GET /api/instruments/quote
Get real-time quote.

**Query Parameters:**
- `symbol` (required) - Instrument symbol
- `exchange` (optional) - Exchange code

**Response:**
```json
{
  "quote": {
    "symbol": "RELIANCE",
    "ltp": 2550.00,
    "change": 50.00,
    "changePercentage": 2.0,
    "open": 2500.00,
    "high": 2560.00,
    "low": 2490.00,
    "close": 2550.00,
    "volume": 1000000,
    "bid": 2549.95,
    "ask": 2550.05,
    "bidQty": 500,
    "askQty": 300
  }
}
```

### GET /api/instruments/history
Get historical data.

**Query Parameters:**
- `symbol` (required) - Instrument symbol
- `interval` (required) - 1m, 5m, 15m, 1h, 1d
- `fromDate` (required) - ISO date string
- `toDate` (required) - ISO date string

**Response:**
```json
{
  "candles": [
    {
      "timestamp": "2024-03-20T09:15:00Z",
      "open": 2500.00,
      "high": 2510.00,
      "low": 2495.00,
      "close": 2505.00,
      "volume": 10000
    }
  ]
}
```

---

## Watchlist APIs

### GET /api/watchlists
Get user watchlists.

**Response:**
```json
{
  "watchlists": [
    {
      "id": "watchlist-id",
      "name": "My Stocks",
      "itemCount": 5,
      "items": [
        {
          "id": "item-id",
          "symbol": "RELIANCE",
          "lastPrice": 2550.00,
          "change": 50.00,
          "changePercentage": 2.0
        }
      ]
    }
  ]
}
```

### POST /api/watchlists
Create a new watchlist.

**Request Body:**
```json
{
  "name": "Tech Stocks"
}
```

**Response:**
```json
{
  "watchlist": {
    "id": "watchlist-id",
    "name": "Tech Stocks",
    "itemCount": 0
  }
}
```

### PATCH /api/watchlists/[id]
Update watchlist.

**Request Body:**
```json
{
  "name": "Technology Stocks"
}
```

### DELETE /api/watchlists/[id]
Delete watchlist.

**Response:**
```json
{
  "message": "Watchlist deleted successfully"
}
```

### POST /api/watchlists/[id]/symbols
Add symbol to watchlist.

**Request Body:**
```json
{
  "symbol": "TCS",
  "exchange": "NSE"
}
```

### DELETE /api/watchlists/[id]/symbols/[symbolId]
Remove symbol from watchlist.

---

## Alert APIs

### GET /api/alerts
Get user alerts.

**Query Parameters:**
- `status` (optional) - ACTIVE, TRIGGERED, CANCELLED

**Response:**
```json
{
  "alerts": [
    {
      "id": "alert-id",
      "symbol": "RELIANCE",
      "condition": "ABOVE",
      "targetPrice": 2600.00,
      "currentPrice": 2550.00,
      "status": "ACTIVE",
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ]
}
```

### POST /api/alerts
Create a new alert.

**Request Body:**
```json
{
  "symbol": "RELIANCE",
  "exchange": "NSE",
  "condition": "ABOVE",
  "targetPrice": 2600.00
}
```

**Response:**
```json
{
  "alert": {
    "id": "alert-id",
    "symbol": "RELIANCE",
    "condition": "ABOVE",
    "targetPrice": 2600.00,
    "status": "ACTIVE"
  }
}
```

### DELETE /api/alerts/[id]
Delete alert.

---

## Notification APIs

### GET /api/notifications
Get user notifications.

**Query Parameters:**
- `read` (optional) - true, false
- `type` (optional) - ORDER, ALERT, SYSTEM

**Response:**
```json
{
  "notifications": [
    {
      "id": "notification-id",
      "type": "ORDER",
      "title": "Order Filled",
      "message": "Your order for RELIANCE has been filled",
      "read": false,
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ],
  "unreadCount": 5
}
```

### PATCH /api/notifications/[id]/read
Mark notification as read.

**Response:**
```json
{
  "message": "Notification marked as read"
}
```

### POST /api/notifications/read-all
Mark all notifications as read.

**Response:**
```json
{
  "message": "All notifications marked as read"
}
```

---

## Account APIs

### GET /api/account/profile
Get user profile.

**Response:**
```json
{
  "profile": {
    "id": "user-id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+91 98765 43210",
    "dateOfBirth": "1990-01-01",
    "occupation": "Software Engineer",
    "annualIncome": "10-20L",
    "tradingExperience": "INTERMEDIATE",
    "riskProfile": "MODERATE"
  }
}
```

### PUT /api/account/profile
Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91 98765 43210",
  "dateOfBirth": "1990-01-01",
  "occupation": "Software Engineer",
  "annualIncome": "10-20L",
  "tradingExperience": "INTERMEDIATE"
}
```

### GET /api/account/settings
Get user settings.

**Response:**
```json
{
  "settings": {
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    },
    "privacy": {
      "shareData": false,
      "twoFactorAuth": true
    },
    "display": {
      "theme": "light",
      "language": "en"
    }
  }
}
```

### PUT /api/account/settings
Update user settings.

### GET /api/account/bank-accounts
Get user bank accounts.

**Response:**
```json
{
  "bankAccounts": [
    {
      "id": "account-id",
      "accountNumber": "1234567890",
      "ifscCode": "HDFC0001234",
      "bankName": "HDFC Bank",
      "accountHolderName": "John Doe",
      "isPrimary": true
    }
  ]
}
```

### POST /api/account/bank-accounts
Add bank account.

### DELETE /api/account/bank-accounts/[id]
Remove bank account.

### GET /api/account/kyc
Get KYC status.

**Response:**
```json
{
  "kyc": {
    "status": "VERIFIED",
    "panNumber": "ABCDE1234F",
    "aadhaarNumber": "1234 5678 9012",
    "verifiedAt": "2024-03-20T10:00:00Z"
  }
}
```

### POST /api/account/kyc
Submit KYC documents.

---

## Fund APIs

### GET /api/funds/transactions
Get fund transactions.

**Query Parameters:**
- `type` (optional) - DEPOSIT, WITHDRAWAL
- `status` (optional) - PENDING, COMPLETED, FAILED

**Response:**
```json
{
  "transactions": [
    {
      "id": "transaction-id",
      "type": "DEPOSIT",
      "amount": 50000,
      "status": "COMPLETED",
      "createdAt": "2024-03-20T10:00:00Z",
      "completedAt": "2024-03-20T10:05:00Z"
    }
  ]
}
```

### POST /api/funds/deposit
Request deposit.

**Request Body:**
```json
{
  "amount": 50000,
  "bankAccountId": "account-id"
}
```

### POST /api/funds/withdraw
Request withdrawal.

**Request Body:**
```json
{
  "amount": 25000,
  "bankAccountId": "account-id"
}
```

---

## Admin APIs

### GET /api/admin/stats
Get platform statistics (Admin only).

**Response:**
```json
{
  "stats": {
    "totalUsers": 1000,
    "activeUsers": 750,
    "totalOrders": 50000,
    "todayOrders": 500,
    "totalVolume": 500000000,
    "todayVolume": 5000000
  }
}
```

### GET /api/admin/users
Get user list (Admin only).

**Query Parameters:**
- `status` (optional) - ACTIVE, SUSPENDED, INACTIVE
- `kycStatus` (optional) - PENDING, VERIFIED, REJECTED
- `search` (optional) - Search by name, email, phone

**Response:**
```json
{
  "users": [
    {
      "id": "user-id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+91 98765 43210",
      "kycStatus": "VERIFIED",
      "accountStatus": "ACTIVE",
      "balance": 250000,
      "totalOrders": 145,
      "totalVolume": 5678900
    }
  ]
}
```

### PATCH /api/admin/users
Update user (Admin only).

**Request Body:**
```json
{
  "targetUserId": "user-id",
  "action": "SUSPEND" // SUSPEND, ACTIVATE, VERIFY_KYC, REJECT_KYC
}
```

### GET /api/admin/instruments
Get instruments (Admin only).

### PATCH /api/admin/instruments
Update instrument (Admin only).

**Request Body:**
```json
{
  "instrumentId": "instrument-id",
  "action": "ENABLE_TRADING" // ENABLE_TRADING, DISABLE_TRADING
}
```

---

## Rate Limits

- **Default:** 100 requests per minute per user
- **WebSocket:** No rate limit (connection-based)
- **Admin APIs:** 200 requests per minute

Exceeding rate limits returns `429 Too Many Requests`.

## Error Codes

- `AUTH_REQUIRED` - Authentication required
- `INVALID_INPUT` - Invalid request body/params
- `NOT_FOUND` - Resource not found
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error

---

For more details, see the source code in `app/api/` directory.
