import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing products (optional - comment out if you want to keep existing data)
    await prisma.orderedProducts.deleteMany({});
    await prisma.product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Seed products
    const products = await prisma.product.createMany({
        data: [
            // Premium RPG Games
            {
                title: 'Elden Ring',
                price: 59.99,
                rating: 4.8,
                genre: 'RPG',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
                description: 'An epic dark fantasy action RPG from the creators of Dark Souls. Explore a vast open world filled with danger and discovery.',
                support: 'PC'
            },
            {
                title: 'The Witcher 3: Wild Hunt',
                price: 39.99,
                rating: 4.9,
                genre: 'RPG',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
                description: 'An award-winning open-world RPG. Play as Geralt of Rivia, a monster hunter on a quest to find his adopted daughter.',
                support: 'PC'
            },
            {
                title: 'Cyberpunk 2077',
                price: 49.99,
                rating: 4.3,
                genre: 'RPG',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
                description: 'An open-world RPG set in Night City, a megalopolis obsessed with power, glamour and body modification.',
                support: 'PC'
            },

            // Premium Action Games
            {
                title: 'God of War',
                price: 49.99,
                rating: 4.9,
                genre: 'Action',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
                description: 'An epic journey of a father and son through the Norse realms. Brutal combat meets emotional storytelling.',
                support: 'PC'
            },
            {
                title: 'Sekiro: Shadows Die Twice',
                price: 59.99,
                rating: 4.7,
                genre: 'Action',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
                description: 'A challenging action-adventure game set in late 1500s Sengoku Japan. Master the blade and embrace death.',
                support: 'PC'
            },

            // Deluxe Strategy Games
            {
                title: 'Civilization VI',
                price: 59.99,
                rating: 4.6,
                genre: 'Strategy',
                category: 'Deluxe',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
                description: 'Build an empire to stand the test of time. Lead your civilization from the Stone Age to the Information Age.',
                support: 'PC'
            },
            {
                title: 'Total War: Warhammer III',
                price: 59.99,
                rating: 4.5,
                genre: 'Strategy',
                category: 'Deluxe',
                image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
                description: 'The epic conclusion to the Total War: Warhammer trilogy. Command legendary lords and monstrous creatures.',
                support: 'PC'
            },

            // Premium Racing Games
            {
                title: 'Forza Horizon 5',
                price: 59.99,
                rating: 4.8,
                genre: 'Racing',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
                description: 'Explore the vibrant open world of Mexico in the ultimate racing game. Hundreds of cars and endless adventure.',
                support: 'PC'
            },
            {
                title: 'F1 2024',
                price: 69.99,
                rating: 4.4,
                genre: 'Racing',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1612992541098-75e9e9e01feb?w=800',
                description: 'Experience the official game of the 2024 Formula 1 season. Race as your favorite drivers on authentic circuits.',
                support: 'PC'
            },

            // Standard Adventure Games
            {
                title: 'Minecraft',
                price: 26.95,
                rating: 4.9,
                genre: 'Adventure',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800',
                description: 'Build, explore, and survive in infinite procedurally generated worlds. The ultimate creative sandbox.',
                support: 'PC'
            },
            {
                title: 'Terraria',
                price: 9.99,
                rating: 4.8,
                genre: 'Adventure',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
                description: 'A 2D sandbox adventure game. Dig, fight, explore, and build your way through a procedurally generated world.',
                support: 'PC'
            },

            // Premium Shooter Games
            {
                title: 'Call of Duty: Modern Warfare III',
                price: 69.99,
                rating: 4.3,
                genre: 'Shooter',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800',
                description: 'The latest installment in the legendary Call of Duty franchise. Intense multiplayer and gripping campaign.',
                support: 'PC'
            },
            {
                title: 'Doom Eternal',
                price: 39.99,
                rating: 4.7,
                genre: 'Shooter',
                category: 'Premium',
                image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
                description: 'Rip and tear through hordes of demons in this brutal first-person shooter. Hell on Earth never looked so good.',
                support: 'PC'
            },

            // Standard Puzzle Games
            {
                title: 'Portal 2',
                price: 9.99,
                rating: 4.9,
                genre: 'Puzzle',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800',
                description: 'A mind-bending puzzle game with innovative portal mechanics. Features hilarious writing and co-op mode.',
                support: 'PC'
            },
            {
                title: 'Tetris Effect',
                price: 29.99,
                rating: 4.6,
                genre: 'Puzzle',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1612992541098-75e9e9e01feb?w=800',
                description: 'The classic block-stacking game reimagined with stunning visuals and an immersive soundtrack.',
                support: 'PC'
            },

            // Deluxe Fighting Games
            {
                title: 'Street Fighter 6',
                price: 59.99,
                rating: 4.7,
                genre: 'Fighting',
                category: 'Deluxe',
                image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
                description: 'The latest entry in the legendary fighting game series. Master new mechanics and iconic characters.',
                support: 'PC'
            },
            {
                title: 'Mortal Kombat 11',
                price: 49.99,
                rating: 4.5,
                genre: 'Fighting',
                category: 'Deluxe',
                image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800',
                description: 'The brutal fighting game returns with cinematic story mode and bone-crushing fatalities.',
                support: 'PC'
            },

            // Standard Platformer Games
            {
                title: 'Celeste',
                price: 19.99,
                rating: 4.9,
                genre: 'Platformer',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=800',
                description: 'A challenging platformer about climbing a mountain. Tight controls, great story, and incredible soundtrack.',
                support: 'PC'
            },
            {
                title: 'Hollow Knight',
                price: 14.99,
                rating: 4.9,
                genre: 'Platformer',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=800',
                description: 'A beautifully hand-drawn metroidvania. Explore a vast interconnected underground world.',
                support: 'PC'
            },

            // Standard Arcade Games
            {
                title: 'Pac-Man Championship Edition 2',
                price: 12.99,
                rating: 4.4,
                genre: 'Arcade',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
                description: 'The classic arcade game reimagined with modern graphics and addictive gameplay.',
                support: 'PC'
            },
            {
                title: 'Vampire Survivors',
                price: 4.99,
                rating: 4.8,
                genre: 'Arcade',
                category: 'Standard',
                image: 'https://images.unsplash.com/photo-1625805866449-3589fe3f71a3?w=800',
                description: 'A time survival game with roguelite elements. Mow down thousands of monsters and survive the night.',
                support: 'PC'
            }
        ]
    });

    console.log(`✅ Created ${products.count} products`);

    // Verify the seeding
    const productCount = await prisma.product.count();
    console.log(`📊 Total products in database: ${productCount}`);

    // Display sample products
    const sampleProducts = await prisma.product.findMany({
        take: 5,
        select: {
            id: true,
            title: true,
            price: true,
            genre: true,
            category: true
        }
    });

    console.log('\n📦 Sample products:');
    sampleProducts.forEach(product => {
        console.log(`  ${product.id}. ${product.title} - €${product.price} (${product.genre}/${product.category})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
