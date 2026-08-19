const { PrismaClient } = require('@prisma/client');

// Single shared PrismaClient instance across the app.
const prisma = new PrismaClient();

module.exports = prisma;
