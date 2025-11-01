import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Admin } from "@/models";
import bcrypt from "bcryptjs";

// POST /api/admin/seed
// Requires env vars: ADMIN_EMAIL, ADMIN_NAME, ADMIN_PASSWORD, ADMIN_SEED_TOKEN
// Request must include header: x-seed-token: <ADMIN_SEED_TOKEN>
export async function POST(req: NextRequest) {
  try {
    const tokenHeader = req.headers.get('x-seed-token');
    const seedToken = process.env.ADMIN_SEED_TOKEN;
    if (!seedToken || !tokenHeader || tokenHeader !== seedToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = process.env.ADMIN_EMAIL;
    const name = process.env.ADMIN_NAME || 'Healthcare Manager';
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing ADMIN_EMAIL or ADMIN_PASSWORD' }, { status: 500 });
    }

    await dbConnect();

    const existing = await Admin.findOne({ email }).lean();
    if (existing) {
      return NextResponse.json({ created: false, message: 'Admin already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Admin.create({ email, name, passwordHash });
    return NextResponse.json({ created: true });
  } catch (e: any) {
    console.error('Admin seed error:', e);
    return NextResponse.json({ error: 'Failed to seed admin' }, { status: 500 });
  }
}
