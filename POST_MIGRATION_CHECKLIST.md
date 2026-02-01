# Post-Migration Checklist

## ✅ Completed

1. ✅ **TypeScript Compilation** - All type errors fixed
2. ✅ **Email Branding** - Changed from "Edengo" to "Soul Shop"
3. ✅ **Order Service** - Optional fields set to null
4. ✅ **Database Migration** - Applied successfully
5. ✅ **Prisma Client** - Generated with new schema

---

## ⚠️ Action Required

### 1. **Product Data Setup**

Your Product IDs changed from UUID strings to integers. You need to either:

**Option A: Seed New Products (Recommended)**
```bash
# Create a seed script or manually insert products
# Products will have IDs: 1, 2, 3, 4, etc.
```

**Option B: Use Prisma Studio**
```bash
npx prisma studio
# Manually add products with the new schema
```

**Sample Product Insert:**
```sql
INSERT INTO Product (title, price, rating, genre, category, image, description, support)
VALUES
  ('Elden Ring', 59.99, 4.8, 'RPG', 'Premium', 'https://example.com/elden-ring.jpg', 'An epic dark fantasy RPG', 'PC'),
  ('FIFA 24', 69.99, 4.5, 'Sports', 'Standard', 'https://example.com/fifa24.jpg', 'The latest football simulation', 'PC'),
  ('Minecraft', 26.95, 4.9, 'Adventure', 'Standard', 'https://example.com/minecraft.jpg', 'Build and explore infinite worlds', 'PC');
```

### 2. **Environment Variables**

Verify your `.env` file has:
```bash
CORS_ORIGIN='http://localhost:3000,https://abjshawty.github.io'
JWT_SECRET='your_secret_key'
DATABASE_URL='mysql://user:pass@localhost:3306/soul'
MAIL_HOST='smtp.domain.com'
MAIL_USER='admin@domain.com'
MAIL_PASSWORD='your_password'
SHOP_EMAIL='shop@domain.com'
```

### 3. **Test the Server**

```bash
# Start the development server
yarn dev

# Should see:
# - Server running on http://localhost:3000
# - No TypeScript errors
# - No database connection errors
```

### 4. **Test API Endpoints**

#### A. Login
```bash
curl -X POST http://localhost:3001/v0/code/login \
  -H "Content-Type: application/json" \
  -d '{"code": "333333"}'

# Expected: {"token":"...","message":"Login successful"}
```

#### B. Get Products
```bash
TOKEN="paste_token_here"
curl http://localhost:3001/v0/product \
  -H "Authorization: Bearer $TOKEN"

# Expected: {"data":[{"id":1,"title":"...","price":59.99,...}]}
# Note: id should be a number (1, 2, 3) not a UUID
```

#### C. Create Order
```bash
TOKEN="paste_token_here"
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

# Expected: {
#   "success": true,
#   "orderId": "uuid-string",
#   "message": "Order created successfully"
# }
```

#### D. Test Validation Errors

**Empty Cart:**
```bash
curl -X POST http://localhost:3001/v0/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","customerEmail":"test@example.com","items":[],"totalAmount":0}'

# Expected 400: {"error":"Cart cannot be empty"}
```

**Wrong Total:**
```bash
curl -X POST http://localhost:3001/v0/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerEmail": "test@example.com",
    "items": [{"productId": 1, "title": "Game", "price": 29.99, "quantity": 2}],
    "totalAmount": 50.00
  }'

# Expected 400: {"error":"Total amount mismatch. Expected €59.98, received €50.00"}
```

**Invalid Email:**
```bash
curl -X POST http://localhost:3001/v0/order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test",
    "customerEmail": "invalid-email",
    "items": [{"productId": 1, "title": "Game", "price": 29.99, "quantity": 1}],
    "totalAmount": 29.99
  }'

# Expected 400: {"error":"...email..."}
```

### 5. **Frontend Integration**

Ensure your frontend is updated to:

✅ **Login:** Expect `{ token, message }` instead of `{ data: { token } }`
✅ **Products:** Use integer IDs (1, 2, 3) instead of UUIDs
✅ **Orders:** Send `customerName`, `customerEmail`, `items`, `totalAmount`
✅ **Orders:** Receive `{ success, orderId, message }` instead of full order object

### 6. **Email Testing**

Place a test order and verify:
- [ ] Customer receives confirmation email
- [ ] Email shows "Soul Shop" as sender (not "Edengo")
- [ ] Email contains customer name and correct total
- [ ] Shop receives notification email

---

## 🎯 Quick Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3001"

echo "1. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/v0/code/login" \
  -H "Content-Type: application/json" \
  -d '{"code": "333333"}')
echo "$LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo -e "\n2. Testing Get Products..."
curl -s "$BASE_URL/v0/product" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n3. Testing Create Order..."
curl -s -X POST "$BASE_URL/v0/order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Test User",
    "customerEmail": "test@example.com",
    "items": [{"productId": 1, "title": "Test Game", "price": 29.99, "quantity": 1}],
    "totalAmount": 29.99
  }' | jq '.'

echo -e "\n4. Testing Empty Cart Error..."
curl -s -X POST "$BASE_URL/v0/order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"customerName":"Test","customerEmail":"test@example.com","items":[],"totalAmount":0}' | jq '.'

echo -e "\nTests complete!"
```

Run with: `chmod +x test-api.sh && ./test-api.sh`

---

## 📊 Database State Check

```bash
# Check if default code exists
npx prisma studio

# Or use MySQL client
mysql -u root -p soul
SELECT * FROM Code WHERE code = '333333';
SELECT COUNT(*) FROM Product;
SELECT * FROM Product LIMIT 5;
```

---

## 🔧 If Something Goes Wrong

### Server Won't Start
```bash
# Check logs
cat src/logs/error.log

# Verify database connection
npx prisma db push --preview-feature

# Regenerate Prisma client
npx prisma generate
```

### Migration Issues
```bash
# Check migration status
npx prisma migrate status

# View migration
cat prisma/migrations/20260201071114_align_with_frontend_contract/migration.sql
```

### Type Errors
```bash
# Clean and rebuild
rm -rf node_modules/@prisma/client
yarn db:gen
yarn build
```

---

## ✅ Final Verification

Once everything works:
- [ ] Login returns correct format
- [ ] Products use integer IDs
- [ ] Orders accept new contract format
- [ ] Validation errors work correctly
- [ ] Emails send with correct branding
- [ ] CORS allows frontend origins
- [ ] No TypeScript errors
- [ ] No console errors in logs

---

## 🚀 Ready for Production

When all tests pass:
1. Commit changes: `git add . && git commit -m "Align backend with frontend contract"`
2. Push to repository
3. Deploy to staging
4. Run tests in staging
5. Deploy to production

---

**Status:** All code changes complete ✅
**Next:** Add product data and test endpoints 🧪
