import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs/promises";

// OPTION 1: Handle CORS
export async function OPTIONS(req) {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// OPTION 2: Handle Image Upload (POST)
export async function POST(req, { params }) {
  const { id } = await params;

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    // 1. Validate File Existence
    if (!file) {
      return NextResponse.json(
        { message: "No file uploaded" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Validate File Type (Images only) [cite: 1333]
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: "Only image files allowed" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Generate Unique Filename [cite: 1341, 1401]
    const ext = file.name.split(".").pop();
    const filename = uuidv4() + "." + ext;
    
    // 4. Define Save Path (public/profile-images) [cite: 1342, 1397]
    const uploadDir = path.join(process.cwd(), "public", "profile-images");
    
    // Ensure directory exists
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const savePath = path.join(uploadDir, filename);

    // 5. Save File to Disk [cite: 1345]
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(savePath, Buffer.from(arrayBuffer));

    // 6. Update User in Database [cite: 1350, 1353]
    const client = await getClientPromise();
    const db = client.db("wad-01");
    
    // Save the relative path so Frontend can access it
    const publicPath = `/profile-images/${filename}`;

    await db.collection("user").updateOne(
      { _id: new ObjectId(id) },
      { $set: { profileImage: publicPath } }
    );

    return NextResponse.json(
      { message: "Upload successful", imageUrl: publicPath },
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500, headers: corsHeaders }
    );
  }
}