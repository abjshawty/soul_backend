# Contract Alignment Migration Summary

**Date:** 2026-02-01
**Status:** ✅ Complete - Ready for Testing

---

## Overview

This migration aligns the Soul Backend with the frontend contract specified in `CONTRACTS.md`. All endpoints now match the expected request/response formats from the frontend.

---

## Changes Made

### 1. ✅ Login Endpoint (POST /v0/code/login)

**Before:**
```json
Response: { "data": { "token": "jwt_string" } }
```

**After:**
```json
Response: { "token": "jwt_string", "message": "Login successful" }
Error: { "error": "Invalid code" }
```

**Files Modified:**
- `src/routes/code.ts` - Updated response format and added error handling
- `src/services/code.ts` - Changed error status code from 404 to 401

---

### 2. ✅ Order Request Body (POST /v0/order)

**Before:**
```typescript
{
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  phoneNumber: string;
  paymentMethod: string;
  cart: Array<{
    id: number;  // UUID
    title: string;
    price: number;
    quantity: number;
  }>;
}
```

**After:**
```typescript
{
  customerName: string;
  customerEmail: string;
  items: Array<{
    productId: number;  // Integer ID
    title: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
}
```

**Files Modified:**
- `src/types/order.ts` - Completely rewritten to match contract
- `src/schemas/order.ts` - Updated validation schema with proper constraints
- `src/services/order.ts` - Updated to use new field names
- `src/controllers/order.ts` - Updated linkProducts to accept productId (number)

---

### 3. ✅ Order Response Format (POST /v0/order)

**Before:**
```json
{ "data": { ...full order object... } }
```

**After:**
```json
{
  "success": true,
  "orderId": "uuid-string",
  "message": "Order created successfully"
}
```

**Files Modified:**
- `src/routes/order.ts` - Updated response format with try-catch error handling

---

### 4. ✅ Database Schema Changes

#### Product Model
**Before:** UUID-based IDs (string)
**After:** Auto-increment integer IDs

```prisma
model Product {
  id: Int @id @default(autoincrement())  // Changed from String @default(uuid())
  // ... other fields unchanged
}
```

#### Order Model
**Before:**
```prisma
model Order {
  name: String
  email: String
  cardNumber: String
  expiry: String
  cvv: String
  phoneNumber: String
  paymentMethod: String
  total: Float
  // ...
}
```

**After:**
```prisma
model Order {
  customerName: String           // Renamed from 'name'
  customerEmail: String          // Renamed from 'email'
  cardNumber: String?            // Now optional
  expiry: String?                // Now optional
  cvv: String?                   // Now optional
  phoneNumber: String?           // Now optional
  paymentMethod: String?         // Now optional
  totalAmount: Float             // Renamed from 'total'
  // ...
}
```

#### OrderedProducts Model
```prisma
model OrderedProducts {
  productId: Int  // Changed from String to Int
  // ...
}
```

**Migration File:**
- `prisma/migrations/20260201071114_align_with_frontend_contract/migration.sql`

---

### 5. ✅ Order Validation

Added comprehensive validation in `src/services/order.ts`:

1. **Empty Cart Check**
   ```typescript
   if (!data.items || data.items.length === 0) {
     throw Error 400: "Cart cannot be empty"
   }
   ```

2. **Quantity Validation**
   ```typescript
   if (!Number.isInteger(item.quantity) || item.quantity < 1) {
     throw Error 400: "All quantities must be positive integers"
   }
   ```

3. **Total Amount Verification**
   ```typescript
   calculatedTotal = sum(price × quantity)
   if (|calculatedTotal - totalAmount| > 0.01) {
     throw Error 400: "Total amount mismatch"
   }
   ```

4. **Email Format** (via Fastify schema validation)

---

### 6. ✅ Error Response Format

All error responses now follow the contract format:

```json
{
  "error": "Human-readable error message"
}
```

**Status Codes:**
- `400` - Invalid request data (validation errors)
- `401` - Authentication errors (invalid code, missing/invalid token)
- `500` - Internal server errors

**Files Modified:**
- `src/routes/code.ts` - Login error handling
- `src/routes/order.ts` - Order creation error handling

---

### 7. ✅ CORS Configuration

**Before:**
```bash
CORS_ORIGIN='*'
```

**After:**
```bash
CORS_ORIGIN='http://localhost:3000,https://abjshawty.github.io'
```

**Files Modified:**
- `.env.example` - Updated default CORS origins
- `src/helpers/env.ts` - Added comma-separated parsing for multiple origins

The CORS helper now supports:
- Single origin: `'http://localhost:3000'`
- Multiple origins: `'http://localhost:3000,https://abjshawty.github.io'`

---

### 8. ✅ Schema Validation

Updated `src/schemas/order.ts` to enforce required fields:

```typescript
export const create = {
  body: {
    type: 'object',
    properties: {
      customerName: { type: 'string', minLength: 1 },
      customerEmail: { type: 'string', format: 'email' },
      items: {
        type: 'array',
        minItems: 1,
        items: {
          properties: {
            productId: { type: 'number' },
            title: { type: 'string' },
            price: { type: 'number', minimum: 0 },
            quantity: { type: 'number', minimum: 1 }
          },
          required: ['productId', 'title', 'price', 'quantity']
        }
      },
      totalAmount: { type: 'number', minimum: 0 }
    },
    required: ['customerName', 'customerEmail', 'items', 'totalAmount']
  }
}
```

---

### 9. ✅ Email Templates

Updated email templates to use new field names:
- `order.customerName` instead of `order.name`
- `order.customerEmail` instead of `order.email`
- `order.totalAmount` instead of `order.total`
- Removed phone number and payment method references (now optional)

**Files Modified:**
- `src/services/order.ts` - Both `generateEmail()` and `generateEmailToShop()` methods

---

## Breaking Changes

### ⚠️ Database Migration Required

The following changes require a database migration:

1. **Product IDs changed from UUID to integers**
   - Existing products will need to be migrated or recreated
   - Frontend must use integer IDs (e.g., `1`, `2`, `3`) instead of UUIDs

2. **Order field renames**
   - `name` → `customerName`
   - `email` → `customerEmail`
   - `total` → `totalAmount`

3. **Optional payment fields**
   - `cardNumber`, `expiry`, `cvv`, `phoneNumber`, `paymentMethod` are now optional

### ⚠️ API Contract Changes

**Frontend must update to send:**
- `customerName` instead of `name`
- `customerEmail` instead of `email`
- `items` instead of `cart`
- `items[].productId` as number instead of `cart[].id` as string
- `totalAmount` field

**Frontend will receive:**
- Login: `{ token, message }` instead of `{ data: { token } }`
- Order: `{ success, orderId, message }` instead of `{ data: order }`

---

## Testing Checklist

### Before Applying Migration

- [ ] Backup production database
- [ ] Test migration on development database
- [ ] Verify existing orders can be accessed

### After Applying Migration

1. **Login Endpoint**
   ```bash
   curl -X POST http://localhost:3001/v0/code/login \
     -H "Content-Type: application/json" \
     -d '{"code": "333333"}'

   # Expected: { "token": "...", "message": "Login successful" }
   ```

2. **Get Products**
   ```bash
   TOKEN="your_token_here"
   curl -X GET http://localhost:3001/v0/product \
     -H "Authorization: Bearer $TOKEN"

   # Expected: { "data": [{ "id": 1, "title": "...", ... }] }
   # Note: Product IDs should now be integers
   ```

3. **Create Order**
   ```bash
   TOKEN="your_token_here"
   curl -X POST http://localhost:3001/v0/order \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "customerName": "John Doe",
       "customerEmail": "john@example.com",
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

   # Expected: {
   #   "success": true,
   #   "orderId": "uuid",
   #   "message": "Order created successfully"
   # }
   ```

4. **Error Scenarios**
   - [ ] Invalid code returns 401 with `{ "error": "Invalid code" }`
   - [ ] Empty cart returns 400 with `{ "error": "Cart cannot be empty" }`
   - [ ] Wrong total returns 400 with mismatch message
   - [ ] Invalid email returns 400 with `{ "error": "..." }`

5. **Email Delivery**
   - [ ] Customer receives order confirmation email
   - [ ] Shop receives order notification email
   - [ ] Emails contain correct customer name and total amount

---

## How to Apply Changes

### 1. Generate and Apply Migration

```bash
# Review the migration file first
cat prisma/migrations/20260201071114_align_with_frontend_contract/migration.sql

# Apply the migration
npx prisma migrate dev

# Or for production
npx prisma migrate deploy
```

### 2. Seed New Product Data (Optional)

If you want to start fresh with integer IDs:

```bash
# Clear existing products (CAUTION: deletes data)
npx prisma db push --force-reset

# Re-seed with new products
# (You'll need to create a seed script)
```

### 3. Update Environment Variables

```bash
# Update your .env file
CORS_ORIGIN='http://localhost:3000,https://abjshawty.github.io'
```

### 4. Restart Server

```bash
yarn dev
```

---

## Rollback Plan

If issues occur:

1. **Rollback Database Migration**
   ```bash
   # Revert to previous migration
   npx prisma migrate resolve --rolled-back 20260201071114_align_with_frontend_contract
   ```

2. **Restore Code**
   ```bash
   git revert HEAD
   yarn db:gen
   yarn dev
   ```

3. **Restore Database from Backup** (if needed)

---

## Documentation Updated

- ✅ `CLAUDE.md` - Complete codebase documentation created
- ✅ `CONTRACTS.md` - Already exists (source of truth)
- ✅ `MIGRATION_SUMMARY.md` - This file

---

## Next Steps

1. **Apply the migration** to your development database
2. **Test all endpoints** using the checklist above
3. **Update frontend** to use new contract (if not already aligned)
4. **Deploy to staging** for integration testing
5. **Deploy to production** after verification

---

## Support

If you encounter issues:
1. Check logs in `src/logs/error.log`
2. Review the Prisma migration file
3. Verify environment variables are set correctly
4. Check that JWT_SECRET and database credentials are valid

---

**Migration prepared by:** Claude Code Assistant
**Migration approved by:** [Pending Review]
**Applied on:** [Pending Application]
