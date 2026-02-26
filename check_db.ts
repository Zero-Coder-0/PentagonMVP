import { prisma } from './src/lib/prisma';
async function main() {
    const count = await prisma.project.count();
    console.log('Project Count:', count);
}
main();
