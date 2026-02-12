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
                type: 'number'
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
                type: 'number'
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
            id: { type: 'number' }
        },
        required: ['id']
    }
};

export const create = {
    tags,
    body: {
        type: 'object',
        properties: {
            customerName: {
                type: 'string',
                minLength: 1
            },
            customerEmail: {
                type: 'string',
                format: 'email'
            },
            items: {
                type: 'array',
                minItems: 1,
                items: {
                    type: 'object',
                    properties: {
                        productId: {
                            type: 'number'
                        },
                        title: {
                            type: 'string'
                        },
                        price: {
                            type: 'number',
                            minimum: 0
                        },
                        quantity: {
                            type: 'number',
                            minimum: 1
                        }
                    },
                    required: ['productId', 'title', 'price', 'quantity']
                }
            },
            totalAmount: {
                type: 'number',
                minimum: 0
            }
        },
        required: ['customerName', 'customerEmail', 'items', 'totalAmount']
    }
};

export const update = {
    tags,
    params: {
        type: 'object',
        properties: {
            id: { type: 'number' }
        },
        required: ['id']
    },
    body: {
        type: 'object',
        properties: {
        }
    }
};
