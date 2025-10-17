import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import dbConnect from "@/lib/mongodb";
import { Admin } from "@/models";

const COOKIE_NAME = "admin_token";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    const secret = process.env.ADMIN_JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as any;
    if (!decoded?.email) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    const admin = await Admin.findOne({ email: decoded.email }).lean();
    if (!admin) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    return NextResponse.json({ authenticated: true, role: "admin", user: { name: (admin as any).name, email: (admin as any).email } });
  } catch (e) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
