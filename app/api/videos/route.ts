import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";// Corrected common path for authOptions
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/models/Video";

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    let query = {};

    // Logic to filter videos based on session
    if (session) {
      // Logged-in users see all videos
      query = {};
    } else {
      // Logged-out users only see public videos
      query = { private: false };
    }

    const videos = await Video.find(query).sort({ createdAt: -1 }).lean();
    
// This ensures the response is always { videos: [...] }
return NextResponse.json({ videos: videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const body: IVideo = await request.json();

    // Validate required fields
    if (
      !body.title ||
      !body.description ||
      !body.videoUrl ||
      !body.thumbnailUrl
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create a new video object including the private field
    const newVideo = await Video.create({
        ...body,
        private: body.private ?? false, // Saves the private field from the request
    });

    return NextResponse.json(newVideo);
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}