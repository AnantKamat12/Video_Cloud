"use client";

import React, { useEffect, useState, useMemo } from "react";
import VideoFeed from "./components/VideoFeed";
import { IVideo } from "@/models/Video";
//import { apiClient } from "@/lib/api-client";//commenting this line for vrecel error no use of imprting apiClient

export default function Home() {
  const [videos, setVideos] = useState<IVideo[]>([]);
  // 1. State to store the user's search input
  const [searchQuery, setSearchQuery] = useState("");

// app/page.tsx

useEffect(() => {
  const fetchVideos = async () => {
    try {
      const res = await fetch('/api/videos');
      if (!res.ok) {
        throw new Error("Failed to fetch videos");
      }
      const data = await res.json();

      // ✅ ADD THIS CHECK
      // Make sure data exists and data.videos is an array before setting state
      if (data && Array.isArray(data.videos)) {
        setVideos(data.videos);
      } else {
        // If the format is wrong, set an empty array to prevent crashes
        console.error("API response is not in the expected format:", data);
        setVideos([]);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
      setVideos([]); // Also set to empty array on fetch error
    }
  };

  fetchVideos();
}, []);

  // 2. Filter the videos based on the search query
  const filteredVideos = useMemo(() => {
    if (!searchQuery) {
      return videos; // If search is empty, return all videos
    }
    return videos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]); // Re-filter only when videos or query change

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-base-content">
        The Shared Videos....
      </h1>

      {/* 3. Search bar input field */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="search title"
          className="input input-bordered w-full max-w-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 4. Pass the filtered videos to the VideoFeed */}
      <VideoFeed videos={filteredVideos} />
    </main>
  );
}
