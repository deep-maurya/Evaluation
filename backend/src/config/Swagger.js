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
        url: 'https://evaluation-1-1q6d.onrender.com/'
      },
      {
        url: 'http://localhost:9090'
      }
    ],
  },
  apis: ['./src/*.js','./src/router/*.js'], // files containing annotations as above
};

const openapiSpecification = swaggerJsdoc(options);
module.exports = {openapiSpecification}