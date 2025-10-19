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

        // Generate HTML email
        const emailHtml = await this.generateEmail(order, data.cart);
        const plainText = `Commande créée avec succès avec l'identifiant ${order.id}.\n\nVos articles:\n${data.cart.map(product => `${product.quantity} x ${product.title}`).join('\n')}\n\nTotal: €${order.total}`;

        // Send confirmation email to customer
        sendMail(
            data.email,
            'Confirmation de commande - Soul Shop',
            plainText,
            emailHtml
        ).catch(error => console.error(error));

        // Send notification email to shop
        const shopEmailHtml = await this.generateEmailToShop(order, data.cart);
        const shopPlainText = `Nouvelle commande avec l'identifiant ${order.id}.\n\nClient: ${order.name} (${order.email})\nTéléphone: ${order.phoneNumber}\nMéthode de paiement: ${order.paymentMethod}\n\nArticles:\n${data.cart.map(product => `${product.quantity} x ${product.title} - €${(product.price * product.quantity).toFixed(2)}`).join('\n')}\n\nTotal: €${order.total}`;

        sendMail(
            env.shop_email,
            '🎉 Nouvelle commande - Soul Shop',
            shopPlainText,
            shopEmailHtml
        ).catch(error => console.error(error));

        return await this.getById(order.id, { include: { items: true } });
    }
    async generateEmail (order: Build, cart: Type.body['cart']) {
        // Generate cart items HTML
        const cartItemsHtml = cart.map(item => `
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="color: #333333; font-size: 15px;">${item.quantity} × ${item.title}</span>
                                                </td>
                                                <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="color: #333333; font-size: 15px; font-weight: 500;">€${(item.price * item.quantity).toFixed(2)}</span>
                                                </td>
                                            </tr>`).join('');

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Merci pour votre commande !</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Bonjour ${order.name},
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Nous avons bien reçu votre commande et nous vous en remercions. Voici un récapitulatif de votre achat :
                            </p>
                            
                            <!-- Order Details Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 25px 0; border: 1px solid #e9ecef;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Identifiant de commande
                                        </p>
                                        <p style="margin: 0 0 20px; color: #333333; font-size: 14px; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 8px 12px; border-radius: 4px; display: inline-block;">
                                            ${order.id}
                                        </p>
                                        
                                        <p style="margin: 20px 0 12px; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Vos articles
                                        </p>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            ${cartItemsHtml}
                                            <tr>
                                                <td style="padding: 15px 0 0;">
                                                    <span style="color: #333333; font-size: 16px; font-weight: 600;">Total</span>
                                                </td>
                                                <td align="right" style="padding: 15px 0 0;">
                                                    <span style="color: #667eea; font-size: 18px; font-weight: 700;">€${order.total.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 25px 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Votre commande sera traitée dans les plus brefs délais. Vous recevrez un email de confirmation d'expédition dès que votre colis sera envoyé.
                            </p>
                            
                            <p style="margin: 0 0 10px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Si vous avez des questions, n'hésitez pas à nous contacter.
                            </p>
                            
                            <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                                Cordialement,<br>
                                <strong>L'équipe</strong>
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6; text-align: center;">
                                Cet email est un message automatique, merci de ne pas y répondre directement.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
        return html;
    }

    async generateEmailToShop (order: Build, cart: Type.body['cart']) {
        // Generate cart items HTML
        const cartItemsHtml = cart.map(item => `
                                            <tr>
                                                <td style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="color: #333333; font-size: 15px; font-weight: 600;">${item.title}</span>
                                                </td>
                                                <td align="center" style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="color: #333333; font-size: 15px;">×${item.quantity}</span>
                                                </td>
                                                <td align="right" style="padding: 10px 0; border-bottom: 1px solid #e9ecef;">
                                                    <span style="color: #333333; font-size: 15px; font-weight: 500;">€${(item.price * item.quantity).toFixed(2)}</span>
                                                </td>
                                            </tr>`).join('');

        const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nouvelle commande</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Nouvelle Commande</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 25px; color: #333333; font-size: 16px; line-height: 1.6;">
                                Une nouvelle commande vient d'être passée sur Soul Shop !
                            </p>
                            
                            <!-- Order ID Badge -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 25px;">
                                <tr>
                                    <td style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px 20px; border-radius: 4px;">
                                        <p style="margin: 0 0 5px; color: #059669; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Identifiant de commande
                                        </p>
                                        <p style="margin: 0; color: #333333; font-size: 16px; font-family: 'Courier New', monospace; font-weight: 600;">
                                            ${order.id}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Customer Information -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 0 0 25px; border: 1px solid #e9ecef;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 15px; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Informations client
                                        </p>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6c757d; font-size: 14px;">Nom :</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #333333; font-size: 14px; font-weight: 600;">${order.name}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6c757d; font-size: 14px;">Email :</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #333333; font-size: 14px;">${order.email}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6c757d; font-size: 14px;">Téléphone :</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #333333; font-size: 14px;">${order.phoneNumber}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6c757d; font-size: 14px;">Méthode de paiement :</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #333333; font-size: 14px; font-weight: 600;">${order.paymentMethod}</span>
                                                </td>
                                            </tr>
                                            ${order.code !== '333333' ? `
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #6c757d; font-size: 14px;">Code promo :</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="color: #10b981; font-size: 14px; font-weight: 600;">${order.code}</span>
                                                </td>
                                            </tr>` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <!-- Order Items -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f9fa; border-radius: 6px; margin: 0 0 25px; border: 1px solid #e9ecef;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 15px; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Articles commandés
                                        </p>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <th align="left" style="padding: 10px 0; border-bottom: 2px solid #dee2e6; color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                                    Produit
                                                </th>
                                                <th align="center" style="padding: 10px 0; border-bottom: 2px solid #dee2e6; color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                                    Qté
                                                </th>
                                                <th align="right" style="padding: 10px 0; border-bottom: 2px solid #dee2e6; color: #6c757d; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                                                    Montant
                                                </th>
                                            </tr>
                                            ${cartItemsHtml}
                                            <tr>
                                                <td colspan="2" style="padding: 20px 0 0;">
                                                    <span style="color: #333333; font-size: 18px; font-weight: 700;">Total</span>
                                                </td>
                                                <td align="right" style="padding: 20px 0 0;">
                                                    <span style="color: #10b981; font-size: 20px; font-weight: 700;">€${order.total.toFixed(2)}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0; color: #6c757d; font-size: 14px; line-height: 1.6; text-align: center;">
                                Commande passée le ${new Date(order.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; border-top: 1px solid #e9ecef; text-align: center;">
                            <p style="margin: 0; color: #6c757d; font-size: 13px; line-height: 1.6;">
                                Soul Shop - Notification automatique
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;
        return html;
    }
}
export default new Service(Controller);
