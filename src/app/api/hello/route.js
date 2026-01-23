import { NextResponse } from "next/server";
import { corsHeaders } from "@/lib/cors";

export async function GET() {
    return NextResponse.json(
        { message: "hello world" },
        { headers: corsHeaders }
    );
}

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}