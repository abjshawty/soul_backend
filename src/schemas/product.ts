const tags = ['Product'];
export const search = {
    tags,
    querystring: {
        type: 'object',
        properties: {
            id: {
                type: 'string'
            },
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            category: {
                type: 'string'
            },
            genre: {
                type: 'string'
            },
            description: {
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
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            category: {
                type: 'string'
            },
            genre: {
                type: 'string'
            },
            description: {
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
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            category: {
                type: 'string'
            },
            genre: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            support: {
                type: 'string'
            },
            image: {
                type: 'string'
            },
        },
        required: ['title', 'price', 'category', 'genre', 'description', 'support', 'image']
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
            title: {
                type: 'string'
            },
            price: {
                type: 'number'
            },
            category: {
                type: 'string'
            },
            genre: {
                type: 'string'
            },
            description: {
                type: 'string'
            },
            support: {
                type: 'string'
            },
            image: {
                type: 'string'
            },
        },
        required: []
    }
};
