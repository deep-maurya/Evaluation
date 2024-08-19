const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Evaluation',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:9090', // URL of your development server
        description: 'Development server'
      },
      {
        url: 'https://api.example.com', // URL of your production server
        description: 'Production server'
      }
    ],
  },
  apis: ['./src/*.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);
module.exports = {openapiSpecification}