import { corsHeaders } from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const client = await getClientPromise();
        const db = client.db("sample_mflix"); // Default sample DB
        
        // Fetch 5 comments to test connection
        const result = await db.collection("comments")
            .find({})
            .limit(5)
            .toArray();

        return NextResponse.json(result, {
            headers: corsHeaders
        });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Failed to connect" }, { status: 500, headers: corsHeaders });
    }
}