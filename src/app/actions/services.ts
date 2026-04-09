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

    // --- 1. NEW: Extract and Parse JSON-LD for Reliable Data ---
    const ldJsonMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let ldData: any = null;
    if (ldJsonMatch) {
      try {
        const parsed = JSON.parse(ldJsonMatch[1]);
        // Airbnb often has an array of JSON-LD, find the one with 'name' or 'description'
        ldData = Array.isArray(parsed) ? parsed.find(item => item.name || item.description) : parsed;
      } catch (e) {
        console.warn("[extractAirbnbInfo] Failed to parse JSON-LD:", e);
      }
    }

    // --- 2. Extract Images (Priority: JSON-LD > __INITIAL_STATE__ > meta) ---
    let images: string[] = [];
    if (ldData && Array.isArray(ldData.image)) {
      images = ldData.image.filter((img: any) => typeof img === "string" && img.startsWith("http"));
    }

    if (images.length < 5) {
      const moreImages = html.match(/"original_picture_url":"([^"]+)"/g);
      if (moreImages) {
        const uniqueImages = new Set(images);
        moreImages.forEach((match: string) => {
          const url = match.match(/"original_picture_url":"([^"]+)"/)?.[1];
          if (url) uniqueImages.add(url);
        });
        images = Array.from(uniqueImages);
      }
    }

    if (images.length === 0) {
      const ogImage = html.match(/<meta property="og:image" content="([^"]+)"/)?.[1];
      if (ogImage) images.push(ogImage);
    }

    // --- 3. Extract Name, City, Type (Priority: JSON-LD > meta > Title) ---
    const ogTitle = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] || "";
    const ogDescription = html.match(/<meta property="og:description" content="([^"]+)"/)?.[1] || "";
    const pageTitle = (html.match(/<title>([^<]+)<\/title>/)?.[1] || ogTitle).split(" - Airbnb")[0].trim();

    let name = ldData?.name || "";
    let description = ldData?.description || "";
    let city = ldData?.address?.addressLocality || "";
    let type: ListingType = "Homestay";

    // 3b. High-Fidelity Name Extraction
    if (ogTitle && !ogTitle.toLowerCase().includes("airbnb") && ogTitle.length < 100) {
      name = ogTitle.split(" · ")[0]; 
    } else if (!name || name.includes("Rental unit") || name.includes("house in")) {
      name = pageTitle.split(" · ")[0];
    }

    // 3c. Description Extraction & Cleaning
    if (!description || description === name) {
      if (ogDescription) {
        description = ogDescription.replace(/^[A-Z][a-z]{2}\s\d{1,2},.*?\.\s/, "").trim();
      }
    }
    
    if (description.startsWith(name)) {
      description = description.replace(name, "").replace(/^[ \-\:\.]+/ , "").trim();
    }

    // 3d. Extract City and Type
    if (!city) {
      if (ldData?.address?.addressLocality) {
        city = ldData.address.addressLocality;
      } else {
        const parts = pageTitle.split(" in ");
        if (parts.length >= 2) {
          city = parts[1].split(" · ")[0].trim();
        }
      }
    }

    const typeCandidate = (ldData?.["@type"] || pageTitle.split(" in ")[0]).toLowerCase();
    if (typeCandidate.includes("apartment") || typeCandidate.includes("flat") || typeCandidate.includes("condo")) {
      type = "Apartment";
    } else if (typeCandidate.includes("villa") || typeCandidate.includes("house") || typeCandidate.includes("home")) {
      type = "Villa";
    } else if (typeCandidate.includes("guest house") || typeCandidate.includes("guesthouse") || typeCandidate.includes("cottage")) {
      type = "Guest House";
    }

    // 4. Extract Amenities
    const amenities: string[] = [];
    const commonAmenities = [
      "Wifi", "Kitchen", "Parking", "Air conditioning", "Pool", "TV", "Washer", "Dryer", 
      "Heating", "Dedicated workspace", "Iron", "Hair dryer", "Crib", "High chair",
      "Self check-in", "Beach access", "Mountain view", "City skyline view", "Hot tub",
      "GYM", "Breakfast", "Elevator", "Fireplace", "Smoke alarm"
    ];
    commonAmenities.forEach(a => {
      const searchTarget = (description + " " + html).toLowerCase();
      if (searchTarget.includes(a.toLowerCase())) {
        amenities.push(a);
      }
    });

    return {
      success: true,
      data: {
        name: name.trim() || "New Property",
        city: city || "",
        type: type,
        description: (description === name || description.length < 10) ? "" : description,
        images: images.slice(0, 30),
        amenities: amenities.slice(0, 20),
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
