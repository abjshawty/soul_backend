export type body = {
    name: string;
    email: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    phoneNumber: string;
    paymentMethod: string;
    cart: [
        {
            id: string;
            title: string;
            price: number;
            quantity: number;
        }
    ];
};