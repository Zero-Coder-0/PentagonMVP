import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
console.log(Object.keys(p).filter(key => typeof (p as any)[key] === 'object' && (p as any)[key] !== null && 'createMany' in (p as any)[key]));
