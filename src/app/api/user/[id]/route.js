import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// GET: Get single user detail
export async function GET(req, { params }) {
  const { id } = await params; 
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("user").findOne({ _id: new ObjectId(id) }, { projection: { password: 0 } });
    
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 400, headers: corsHeaders });
  }
}

// PATCH: Update specific fields
export async function PATCH(req, { params }) {
  const { id } = await params;
  const data = await req.json();
  
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Use $set to update only provided fields
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 400, headers: corsHeaders });
  }
}

// DELETE: Remove user
export async function DELETE(req, { params }) {
  const { id } = await params;
  
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    const result = await db.collection("user").deleteOne({ _id: new ObjectId(id) });
    
    return NextResponse.json(result, { status: 200, headers: corsHeaders });
  } catch (error) {
    return NextResponse.json({ message: error.toString() }, { status: 400, headers: corsHeaders });
  }
}