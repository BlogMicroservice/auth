import app from './app';
import config from './config/config';
import { connectRabbitMQ } from './config/rabitmq';

connectRabbitMQ().then(() => {
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
});
