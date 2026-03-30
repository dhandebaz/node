"use server";

import { ListingType } from "@/types";

export async function extractAirbnbInfo(url: string) {
  if (!url || !url.includes("airbnb")) {
    throw new Error("Invalid Airbnb URL");
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch listing: ${response.statusText}`);
    }

    const html = await response.text();

    // 1. Extract Images from multiple patterns
    const imageMatches = html.match(/"image":\s*\[([^\]]+)\]/);
    let images: string[] = [];
    if (imageMatches && imageMatches[1]) {
      images = imageMatches[1]
        .split(",")
        .map((img) => img.trim().replace(/"/g, ""))
        .filter((img) => img.startsWith("http"));
    }

    // 1b. Look for more image patterns in __INITIAL_STATE__
    if (images.length < 5) {
      const moreImages = html.match(/"original_picture_url":"([^"]+)"/g);
      if (moreImages) {
        const uniqueImages = new Set(images);
        moreImages.forEach(match => {
          const url = match.match(/"original_picture_url":"([^"]+)"/)?.[1];
          if (url) uniqueImages.add(url);
        });
        images = Array.from(uniqueImages);
      }
    }

    // 2. Fallback for Images (og:image)
    if (images.length === 0) {
      const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (ogImage) images.push(ogImage);
    }

    // 3. Extract Full Description and Title
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || "";
    // Og:description usually has "Enjoy X in Y...". Better to try and find the main description block if possible.
    const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || "";
    
    // Page Title
    const pageTitle = ogTitle || html.match(/<title>([^<]+)<\/title>/)?.[1] || "";

    // Extract Info from Title
    let name = pageTitle.split(" - ")[0].split(" · ")[0];
    let city = "";
    let type: ListingType = "Homestay";

    const parts = pageTitle.split(" in ");
    if (parts.length >= 2) {
      const typePart = parts[0].toLowerCase();
      if (typePart.includes("apartment") || typePart.includes("flat") || typePart.includes("condo")) {
        type = "Apartment";
      } else if (typePart.includes("villa") || typePart.includes("house") || typePart.includes("home")) {
        type = "Villa";
      } else if (typePart.includes("guest house") || typePart.includes("guesthouse") || typePart.includes("cottage")) {
        type = "Guest House";
      }
      city = parts[1].split(" · ")[0].split(" - ")[0].trim();
    }

    if (name.length < 5) name = pageTitle.split(" - ")[0].trim();

    // 4. Extract Amenities (Expanded List)
    const amenities: string[] = [];
    const commonAmenities = [
      "Wifi", "Kitchen", "Parking", "Air conditioning", "Pool", "TV", "Washer", "Dryer", 
      "Heating", "Dedicated workspace", "Iron", "Hair dryer", "Crib", "High chair",
      "Self check-in", "Beach access", "Mountain view", "City skyline view", "Hot tub"
    ];
    commonAmenities.forEach(a => {
      if (html.toLowerCase().includes(a.toLowerCase()) || ogDescription.toLowerCase().includes(a.toLowerCase())) {
        amenities.push(a);
      }
    });

    return {
      success: true,
      data: {
        name: name || "New Property",
        city: city || "",
        type: type,
        description: ogDescription, // Return the full string found in meta tag
        images: images.slice(0, 15), // Extract up to 15 gallery images
        amenities: amenities.slice(0, 10),
      },
    };
  } catch (error) {
    console.error("[extractAirbnbInfo] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to extract listing info",
    };
  }
}
