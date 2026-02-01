# Database Seed Script

This seed script populates your database with 20 sample gaming products across different genres and categories.

## Products Included

### By Category:
- **Premium** (10 products): High-end AAA titles ($39.99 - $69.99)
- **Deluxe** (4 products): Special edition games ($49.99 - $59.99)
- **Standard** (6 products): Indie and classic games ($4.99 - $29.99)

### By Genre:
- **RPG**: Elden Ring, The Witcher 3, Cyberpunk 2077
- **Action**: God of War, Sekiro
- **Strategy**: Civilization VI, Total War: Warhammer III
- **Racing**: Forza Horizon 5, F1 2024
- **Adventure**: Minecraft, Terraria
- **Shooter**: Call of Duty MW3, Doom Eternal
- **Puzzle**: Portal 2, Tetris Effect
- **Fighting**: Street Fighter 6, Mortal Kombat 11
- **Platformer**: Celeste, Hollow Knight
- **Arcade**: Pac-Man CE 2, Vampire Survivors

## Running the Seed Script

### Option 1: Manual Seed
```bash
yarn db:seed
```

### Option 2: Automatic Seed (after migration reset)
```bash
yarn db:reset
# Prisma will automatically run the seed script
```

### Option 3: Using Prisma Studio
```bash
npx prisma studio
# Then manually add/edit products through the GUI
```

## What the Script Does

1. **Clears existing data** (optional - can be commented out)
   - Deletes all OrderedProducts (to avoid foreign key conflicts)
   - Deletes all Products

2. **Creates 20 sample products** with:
   - Integer IDs (auto-incremented: 1, 2, 3, ...)
   - Realistic gaming titles and prices
   - Proper genre and category assignments
   - Placeholder images (from Unsplash)
   - Detailed descriptions
   - High ratings (4.3 - 4.9)

3. **Displays summary**
   - Total products created
   - Sample of first 5 products

## Expected Output

```
🌱 Starting database seed...
🗑️  Cleared existing products
✅ Created 20 products
📊 Total products in database: 20

📦 Sample products:
  1. Elden Ring - €59.99 (RPG/Premium)
  2. The Witcher 3: Wild Hunt - €39.99 (RPG/Premium)
  3. Cyberpunk 2077 - €49.99 (RPG/Premium)
  4. God of War - €49.99 (Action/Premium)
  5. Sekiro: Shadows Die Twice - €59.99 (Action/Premium)

🎉 Database seeding completed successfully!
```

## Customizing the Seed Data

Edit `prisma/seed.ts` to:

### Add more products:
```typescript
{
    title: 'Your Game',
    price: 29.99,
    rating: 4.5,
    genre: 'RPG',
    category: 'Standard',
    image: 'https://your-image-url.jpg',
    description: 'Your game description',
    support: 'PC'
}
```

### Keep existing products:
Comment out the delete statements:
```typescript
// await prisma.orderedProducts.deleteMany({});
// await prisma.product.deleteMany({});
```

### Use real images:
Replace the Unsplash placeholder URLs with:
- Your own hosted images
- CDN URLs
- Public game cover art URLs

## Valid Values

### Genre (must be one of):
- `RPG`
- `Action`
- `Racing`
- `Puzzle`
- `Fighting`
- `Adventure`
- `Arcade`
- `Platformer`
- `Shooter`
- `Strategy`

### Category (must be one of):
- `Standard`
- `Premium`
- `Deluxe`

### Support:
- Currently all set to `PC`
- Can be extended to `PlayStation`, `Xbox`, `Nintendo Switch`, etc.

## Troubleshooting

### Error: Table 'Product' doesn't exist
```bash
# Run migrations first
yarn db:migrate
yarn db:seed
```

### Error: Foreign key constraint fails
```bash
# The script handles this by deleting OrderedProducts first
# If issues persist, check for Orders referencing products
```

### Error: ts-node not found
```bash
# Install dependencies
yarn install
```

### Products not showing up
```bash
# Verify with Prisma Studio
npx prisma studio

# Or check database directly
yarn db:seed
```

## Testing the Seed Data

After seeding, test the API:

```bash
# Get all products
curl http://localhost:3001/v0/product \
  -H "Authorization: Bearer YOUR_TOKEN"

# Should return 20 products with integer IDs (1-20)
```

## Production Considerations

**⚠️ Important:** This seed script deletes existing products!

For production:
1. Comment out the delete statements
2. Add duplicate checking
3. Use proper image hosting
4. Add more realistic product data
5. Consider using a separate seed for dev vs production

## Example: Add Duplicate Prevention

```typescript
// Check if products already exist
const existingCount = await prisma.product.count();
if (existingCount > 0) {
    console.log('⚠️  Products already exist. Skipping seed.');
    return;
}
```

---

**Need different products?** Just edit `prisma/seed.ts` and run `yarn db:seed` again!
