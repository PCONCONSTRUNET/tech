const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.settings.findFirst().then(console.log).finally(() => prisma.$disconnect());
