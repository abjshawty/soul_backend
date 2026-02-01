# API Contracts

This document defines the interface contracts between the Soul Gaming frontend and backend. The backend must implement these endpoints exactly as specified.

## Base URL

All endpoints are prefixed with `/v0`

**Environment Variable:** `VITE_API_BASE_URL`
- Development: `http://localhost:3001`
- Production: Set via environment configuration

## Authentication

All endpoints except `/v0/code/login` require Bearer token authentication.

### Headers

```http
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

## Endpoints

### 1. Authentication - Login with OTP

Authenticates a user using a 6-digit OTP code and returns a JWT token.

**Endpoint:** `POST /v0/code/login`

**Authentication Required:** No

**Request Body:**
```typescript
{
  code: string;  // 6-digit OTP code
}
```

**Success Response (200 OK):**
```typescript
{
  token: string;  // JWT token for subsequent requests
  message?: string;  // Optional success message
}
```

**Error Responses:**

- **400 Bad Request** - Invalid or missing code
```typescript
{
  error: string;  // Error message (e.g., "Invalid code format")
}
```

- **401 Unauthorized** - Invalid OTP code
```typescript
{
  error: string;  // Error message (e.g., "Invalid code")
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/v0/code/login \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

---

### 2. Products - Get All Products

Fetches the complete product catalog.

**Endpoint:** `GET /v0/product`

**Authentication Required:** Yes (Bearer token)

**Request Body:** None

**Success Response (200 OK):**
```typescript
{
  data: Array<{
    id: number;
    title: string;
    price: number;        // Price in euros
    rating: number;       // Rating from 0-5
    image: string;        // URL to product image
    genre: string;        // Game genre (RPG, Action, Racing, etc.)
    category: string;     // "Standard" | "Premium" | "Deluxe"
    description?: string; // Optional product description
  }>;
}
```

**Error Responses:**

- **401 Unauthorized** - Missing or invalid token
```typescript
{
  error: string;  // Error message
}
```

- **500 Internal Server Error** - Server error
```typescript
{
  error: string;  // Error message
}
```

**Example:**
```bash
curl -X GET http://localhost:3001/v0/product \
  -H "Authorization: Bearer {token}"
```

**Notes:**
- Genre must be one of: RPG, Action, Racing, Puzzle, Fighting, Adventure, Arcade, Platformer, Shooter, Strategy
- Category determines product tier and display section
- Price should be a positive number
- Rating should be between 0 and 5

---

### 3. Orders - Create Order

Creates a new order and sends confirmation email to customer.

**Endpoint:** `POST /v0/order`

**Authentication Required:** Yes (Bearer token)

**Request Body:**
```typescript
{
  customerName: string;     // Customer's name
  customerEmail: string;    // Customer's email for confirmation
  items: Array<{
    productId: number;      // Product ID from catalog
    title: string;          // Product title
    price: number;          // Product unit price
    quantity: number;       // Quantity ordered (must be > 0)
  }>;
  totalAmount: number;      // Total order amount (sum of all items)
}
```

**Success Response (200 OK):**
```typescript
{
  success: boolean;         // true
  orderId: string | number; // Unique order identifier
  message?: string;         // Optional success message
}
```

**Error Responses:**

- **400 Bad Request** - Invalid order data
```typescript
{
  error: string;            // Error message (e.g., "Invalid email format", "Empty cart")
}
```

- **401 Unauthorized** - Missing or invalid token
```typescript
{
  error: string;            // Error message
}
```

- **500 Internal Server Error** - Server error
```typescript
{
  error: string;            // Error message
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/v0/order \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "items": [
      {
        "productId": 1,
        "title": "Elden Ring",
        "price": 59.99,
        "quantity": 1
      }
    ],
    "totalAmount": 59.99
  }'
```

**Backend Requirements:**

1. **Validate Order Data:**
   - Ensure `customerEmail` is a valid email format
   - Ensure `items` array is not empty
   - Ensure all `quantity` values are positive integers
   - Verify `totalAmount` matches the sum of (price × quantity) for all items

2. **Store Order:**
   - Generate unique `orderId`
   - Store order in database with timestamp
   - Associate order with authenticated user (from JWT token)

3. **Send Confirmation Email:**
   - Send to `customerEmail`
   - Include order details: order ID, items list, quantities, prices, total amount
   - Include customer name in email greeting
   - Email should be sent asynchronously (don't block response)

4. **Error Handling:**
   - Return 400 for validation errors with descriptive messages
   - Return 401 if token is missing or invalid
   - Return 500 for server errors (database, email service failures)
   - Log all errors for debugging

---

## Authentication Flow

1. **User Login:**
   - User enters 6-digit OTP code in frontend
   - Frontend sends `POST /v0/code/login` with code
   - Backend validates code and returns JWT token
   - Frontend stores token in memory (React Context + module variable)

2. **Authenticated Requests:**
   - Frontend includes `Authorization: Bearer {token}` header in all subsequent requests
   - Backend validates token on each request
   - Backend extracts user identity from token payload

3. **Token Expiration:**
   - Backend should set reasonable token expiration (e.g., 24 hours)
   - Frontend handles 401 responses by prompting user to log in again

---

## Data Types

### Product Genre (enum)
```typescript
type Genre =
  | "RPG"
  | "Action"
  | "Racing"
  | "Puzzle"
  | "Fighting"
  | "Adventure"
  | "Arcade"
  | "Platformer"
  | "Shooter"
  | "Strategy";
```

### Product Category (enum)
```typescript
type Category = "Standard" | "Premium" | "Deluxe";
```

### Product (interface)
```typescript
interface Product {
  id: number;
  title: string;
  price: number;
  rating: number;
  image: string;
  genre: Genre;
  category: Category;
  description?: string;
}
```

### Cart Item (interface)
```typescript
interface CartItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
}
```

### Order (interface)
```typescript
interface Order {
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  totalAmount: number;
}
```

---

## CORS Configuration

Backend must allow requests from the frontend origin:

```javascript
// Example Express.js CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',           // Development
    'https://abjshawty.github.io'     // Production
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

## Error Handling Standards

### Error Response Format

All error responses should follow this format:

```typescript
{
  error: string;          // Human-readable error message
  code?: string;          // Optional error code for programmatic handling
  details?: any;          // Optional additional error details
}
```

### HTTP Status Codes

- **200 OK** - Successful request
- **400 Bad Request** - Invalid request data (validation errors)
- **401 Unauthorized** - Missing, invalid, or expired token
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server-side error

### Error Examples

**Invalid Email:**
```json
{
  "error": "Invalid email format",
  "code": "INVALID_EMAIL"
}
```

**Empty Cart:**
```json
{
  "error": "Cart cannot be empty",
  "code": "EMPTY_CART"
}
```

**Token Expired:**
```json
{
  "error": "Token expired. Please log in again.",
  "code": "TOKEN_EXPIRED"
}
```

---

## Testing the API

### Test Login
```bash
curl -X POST http://localhost:3001/v0/code/login \
  -H "Content-Type: application/json" \
  -d '{"code": "123456"}'
```

### Test Get Products
```bash
TOKEN="your_jwt_token_here"
curl -X GET http://localhost:3001/v0/product \
  -H "Authorization: Bearer $TOKEN"
```

### Test Create Order
```bash
TOKEN="your_jwt_token_here"
curl -X POST http://localhost:3001/v0/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "items": [
      {
        "productId": 1,
        "title": "Test Game",
        "price": 29.99,
        "quantity": 2
      }
    ],
    "totalAmount": 59.98
  }'
```

---

## Frontend Implementation Reference

The frontend uses these utilities to interact with the API:

- **API Client:** `src/utils/api.ts` - Provides `authenticatedFetch()` function
- **Auth Context:** `src/components/AuthContext.tsx` - Manages token state
- **Order Submission:** `src/components/ShoppingCartSheet.tsx` - Handles checkout

**Key Frontend Behavior:**

1. Token is stored in-memory only (not in localStorage)
2. Token is automatically included in all authenticated requests
3. Frontend expects JSON responses for all endpoints
4. Frontend displays toast notifications for success/error messages
5. Cart is cleared on successful order submission

---

## Version History

- **v0** (Current) - Initial API specification
  - OTP authentication
  - Product catalog retrieval
  - Order creation with email confirmation
