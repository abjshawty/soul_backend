const tags = ['Order'];

export const login = {
    tags,
    body: {
        type: 'object',
        properties: {
            code: {
                type: 'string'
            }
        },
        required: ['code']
    }
};

export const search = {
    tags,
    querystring: {
        type: 'object',
        properties: {
            id: {
                type: 'string'
            },
            createdAt: {
                type: 'string',
                format: 'date-time'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time'
            }
        }
    }
};

export const find = {
    tags,
    querystring: {
        type: 'object',
        properties: {
            id: {
                type: 'string'
            },
            createdAt: {
                type: 'string',
                format: 'date-time'
            },
            updatedAt: {
                type: 'string',
                format: 'date-time'
            }
        }
    }
};

export const getOrDelete = {
    tags,
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    }
};

export const create = {
    tags,
    body: {
        type: 'object',
        properties: {
            name: {
                type: 'string'
            },
            email: {
                type: 'string',
                format: 'email'
            },
            cardNumber: {
                type: 'string'
            },
            expiry: {
                type: 'string',
            },
            cvv: {
                type: 'string'
            },
            phoneNumber: {
                type: 'string'
            },
            paymentMethod: {
                type: 'string'
            },
            cart: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        price: {
                            type: 'number'
                        },
                        quantity: {
                            type: 'number'
                        }
                    },
                    required: ['id', 'price', 'quantity']
                }
            }
        },
        required: []
    }
};

export const update = {
    tags,
    params: {
        type: 'object',
        properties: {
            id: { type: 'string' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
        }
    }
};
