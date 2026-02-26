import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Fetching policies...");
        const policies = await prisma.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE schemaname = 'public'
    `);

        console.log("\n--- POLICIES ---");
        console.log(JSON.stringify(policies, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2));

        console.log("\nFetching RLS status for tables...");
        const tables = await prisma.$queryRawUnsafe(`
      SELECT 
          schemaname, 
          tablename, 
          rowsecurity AS rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

        console.log("\n--- TABLES RLS STATUS ---");
        console.log(JSON.stringify(tables, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value, 2));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
