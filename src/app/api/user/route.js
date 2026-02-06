import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

// Handle OPTIONS for CORS (required for frontend connection)
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

// GET: List all users
export async function GET() {
  try {
    const client = await getClientPromise();
    const db = client.db("wad-01");
    // Exclude password from the result for security
    const result = await db.collection("user").find({}, { projection: { password: 0 } }).toArray();
    
    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders
    });
  } catch (exception) {
    return NextResponse.json({ message: exception.toString() }, {
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST: Create new user
export async function POST(req) {
  try {
    const data = await req.json();
    const { username, email, password, firstname, lastname } = data;

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing mandatory data" }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const client = await getClientPromise();
    const db = client.db("wad-01");

    // Insert user with hashed password
    const result = await db.collection("user").insertOne({
      username,
      email,
      password: await bcrypt.hash(password, 10), // Hash the password
      firstname,
      lastname,
      status: "ACTIVE"
    });

    return NextResponse.json({ id: result.insertedId }, {
      status: 200,
      headers: corsHeaders
    });

  } catch (exception) {
    const errorMsg = exception.toString();
    let displayErrorMsg = errorMsg;

    // Handle duplicate errors specifically
    if (errorMsg.includes("duplicate")) {
      if (errorMsg.includes("username")) displayErrorMsg = "Duplicate Username!!";
      else if (errorMsg.includes("email")) displayErrorMsg = "Duplicate Email!!";
    }

    return NextResponse.json({ message: displayErrorMsg }, {
      status: 400,
      headers: corsHeaders
    });
  }
}