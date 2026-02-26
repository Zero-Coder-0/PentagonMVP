const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const count = await prisma.project.count();
        console.log('Project Count:', count);
        const p = await prisma.project.findMany({ take: 3 });
        console.log(p);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
