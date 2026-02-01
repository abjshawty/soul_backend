export type body = {
    customerName: string;
    customerEmail: string;
    items: Array<{
        productId: number;
        title: string;
        price: number;
        quantity: number;
    }>;
    totalAmount: number;
};