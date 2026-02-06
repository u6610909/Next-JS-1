import { ensureIndexes } from "@/lib/ensureIndexes";
import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("pass") ?? false;

  // Simple security check
  if (!challenge) {
    return NextResponse.json({ message: "Invalid usage" }, { status: 400 });
  }

  // Check against environment variable
  const pass = process.env.ADMIN_SETUP_PASS;
  if (challenge != pass) {
    return NextResponse.json({ message: "Admin password incorrect" }, { status: 400 });
  }

  try {
    await ensureIndexes();
    return NextResponse.json({ message: "Indexes ensured" });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 500 });
  }
}