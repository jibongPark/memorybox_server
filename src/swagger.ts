// swagger.ts
import swaggerAutogen from 'swagger-autogen';

const outputFile = './swagger-output.json';
const endpoints = ['./src/app.ts'];

const doc = {
  info: {
    title: 'Travel Planner API',
    description: '여행 기록 관리 서버 API',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
  securityDefinitions: {
    BearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'JWT 토큰: Bearer {token}'
    }
  },
  components: {
    schemas: {
      Trip: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          images: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/TripImage'
            }
          },
          startDate: { type: 'string', format: 'date-time' },
          
        }
      },
      TripImage: {
        type: 'object',
        properties: {
          filename: { type: 'string' },
          order: { type: 'integer' }
        }
      }
    }
  }
};

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpoints, doc);
