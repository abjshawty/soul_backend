import { Order as Build, Code } from '@prisma/client';
import { Order as Controller } from '../controllers';
import { Order as Type } from '../types';
import { ServiceFactory } from '../helpers';
import { sendMail } from '../utils';
import { env } from '../helpers';
class Service extends ServiceFactory<Build> {
    async createOrder (data: Type.body, code: Code) {
        const order = await super.create({
            name: data.name,
            email: data.email,
            cardNumber: data.cardNumber,
            expiry: data.expiry,
            cvv: data.cvv,
            phoneNumber: data.phoneNumber,
            paymentMethod: data.paymentMethod,
            code: code.code,
            total: data.cart.reduce((total, product) => total + product.price * product.quantity, 0),
            assignedTo: code.assignedTo,
        });
        await Controller.linkProducts(order.id, data.cart);
        sendMail(
            data.email,
            'Commande créée',
            `Commande créée avec succès avec l'identifiant ${order.id}.\n\n
            Vos articles:\n
            ${data.cart.map(
                product => `${product.quantity} x ${product.title}`
            ).join('\n')}\n\nTotal: €${order.total}`
        ).catch(error => console.error(error));

        sendMail(
            env.shop_email,
            'Nouvelle commande',
            `Nouvelle commande avec l'identifiant ${order.id}.\n\n
            Vos articles:\n
            ${data.cart.map(
                product => `${product.quantity} x ${product.title}`
            ).join('\n')}\n\nTotal: €${order.total}`
        ).catch(error => console.error(error));
        return await this.getById(order.id, { include: { items: true } });
    }
}
export default new Service(Controller);
