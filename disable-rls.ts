import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Disabling Row Level Security for public tables...");

        // Disable RLS on the main tables involved in the flow
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" DISABLE ROW LEVEL SECURITY;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "property_drafts" DISABLE ROW LEVEL SECURITY;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "project_units" DISABLE ROW LEVEL SECURITY;`);
        await prisma.$executeRawUnsafe(`ALTER TABLE "project_specifications" DISABLE ROW LEVEL SECURITY;`);

        // Drop existing policies just in case
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "users can read own row" ON "users";`);
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "profiles_read_policy" ON "users";`); // guess

        console.log("✅ RLS Disabled Successfully.");

    } catch (e) {
        console.error("❌ Failed to disable RLS:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
