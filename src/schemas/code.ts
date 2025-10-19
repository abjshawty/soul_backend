const tags = ['Code'];

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
            code: {
                type: 'string'
            },
            discount: {
                type: 'number'
            },
            assignedTo: {
                type: 'string'
            }
        },
        required: ['code', 'discount', 'assignedTo']
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
            code: {
                type: 'string'
            },
            discount: {
                type: 'number'
            },
            assignedTo: {
                type: 'string'
            }
        }
    }
};
