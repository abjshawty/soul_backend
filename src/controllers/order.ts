import { Order as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';
import { client } from '../db';

class Controller extends ControllerFactory<Build> {
    async linkProducts (orderId: number, products: { productId: number; title: string; price: number; quantity: number; }[]) {
        await client.orderedProducts.createMany({
            data: products.map(product => ({
                orderId,
                productId: product.productId,
                quantity: product.quantity
            }))
        });
    }
}

export default new Controller('order');
