require('dotenv').config();

const app = require('./app');
const prisma = require('./utils/prisma');

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function bootstrap() {
  // Fail fast when the JWT secret is missing/weak (never ship without it)
  const secret = process.env.JWT_SECRET || '';
  if (secret.length < 32 || secret.includes('change-me')) {
    console.error(
      '✖ JWT_SECRET is not configured correctly.\n' +
        '  Generate one with:  node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"\n' +
        '  and put it in your .env file.'
    );
    process.exit(1);
  }

  // Verify DB connectivity before listening
  try {
    await prisma.$connect();
    console.log('✔ Connected to PostgreSQL');
  } catch (err) {
    console.error('✖ Could not connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  app.listen(PORT, HOST, () => {
    console.log(`✔ Blue Mobile backend running on ${HOST}:${PORT}`);
    if (process.env.NODE_ENV !== 'production') {
      console.log(`  Local: http://localhost:${PORT}`);
    }
  });
}

bootstrap();
