import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const count = await prisma.project.count();
        const mapProjects = await prisma.project.findMany({
            where: { lat: { not: null }, lng: { not: null } },
            select: { id: true, project_name: true, city_zone: true }
        });
        return NextResponse.json({ count, mapProjectsCount: mapProjects.length, sample: mapProjects.slice(0, 3) });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
