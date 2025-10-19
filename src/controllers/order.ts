import { Order as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';
import { client } from '../db';

class Controller extends ControllerFactory<Build> {
    async linkProducts (orderId: string, products: { id: string; title: string; price: number; quantity: number; }[]) {
        client.orderedProducts.createMany({
            data: products.map(product => ({
                orderId,
                productId: product.id,
                quantity: product.quantity
            }))
        });

    }
}

export default new Controller('order');
