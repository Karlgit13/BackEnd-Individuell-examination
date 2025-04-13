// swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Swing Notes API',
            version: '1.0.0',
            description: 'API för att skapa, läsa, uppdatera och radera anteckningar med JWT-autentisering',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Utvecklingsserver',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Note: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            example: 'abc123',
                        },
                        title: {
                            type: 'string',
                            maxLength: 50,
                            example: 'Kom ihåg detta',
                        },
                        text: {
                            type: 'string',
                            maxLength: 300,
                            example: 'Det här är innehållet i anteckningen.',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-04-12T10:00:00Z',
                        },
                        modifiedAt: {
                            type: 'string',
                            format: 'date-time',
                            example: '2025-04-13T14:45:00Z',
                        },
                        userId: {
                            type: 'string',
                            example: 'user123',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Söker efter swagger-kommentarer i routes
};

const swaggerSpec = swaggerJSDoc(options);

export const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
