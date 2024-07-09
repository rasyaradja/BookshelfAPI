const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 9000,
    host: process.env.HOST || (process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0'),
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  server.route(routes);

  // Error handling for requests
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response.isBoom) {
      return h.response({
        status: 'error',
        message: response.output.payload.message,
      }).code(response.output.statusCode);
    }
    return h.continue;
  });

  try {
    await server.start();
    console.log(`Server running on ${server.info.uri}`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  process.exit(1);
});

init();