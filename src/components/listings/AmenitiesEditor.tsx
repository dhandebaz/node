"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { Plus, X, Check, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Amenity {
  id?: string;
  amenity_category: string;
  amenity_name: string;
  is_available: boolean;
  notes: string;
}

const AMENITY_CATEGORIES = [
  { id: "essentials", label: "Essentials", icon: "🛏️" },
  { id: "features", label: "Features", icon: "📺" },
  { id: "safety", label: "Safety", icon: "🔥" },
  { id: "location", label: "Location", icon: "🗺️" },
  { id: "parking", label: "Parking", icon: "🚗" },
  { id: "kitchen", label: "Kitchen", icon: "🍳" },
  { id: "bathroom", label: "Bathroom", icon: "🚿" },
  { id: "outdoor", label: "Outdoor", icon: "🌳" },
  { id: "other", label: "Other", icon: "📦" },
];

const COMMON_AMENITIES: Record<string, string[]> = {
  essentials: ["Wifi", "Bed linens", "Towels", "Pillows", "Blankets", "Hangers", "Iron", "Hair dryer"],
  features: ["TV", "AC", "Fan", "Heater", "Hot tub", "Pool", "Gym", "Smart TV", "Netflix"],
  safety: ["Fire extinguisher", "First aid kit", "Smoke detector", "Carbon monoxide detector", "Security system"],
  location: ["Beach access", "City view", "Mountain view", "Lake view", "Near metro", "Free street parking"],
  parking: ["Free parking", "Paid parking", "Garage", "EV charging", "Private driveway"],
  kitchen: ["Refrigerator", "Microwave", "Stove", "Oven", "Dishwasher", "Water purifier", "Coffee maker", "Toaster"],
  bathroom: ["Hot water", "Shower", "Bathtub", "Toilet", "Bidet", "Western toilet", "Indian toilet"],
  outdoor: ["Balcony", "Terrace", "Garden", "BBQ", "Outdoor seating", "Sun loungers"],
};

export function AmenitiesEditor({ listingId }: { listingId: string }) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("essentials");
  const [customName, setCustomName] = useState("");
  const [customNotes, setCustomNotes] = useState("");

  useEffect(() => {
    loadAmenities();
  }, [listingId]);

  const loadAmenities = async () => {
    try {
      const data = await fetchWithAuth<{ amenities: Amenity[] }>(`/api/listings/${listingId}/amenities`);
      setAmenities(data.amenities || []);
    } catch (error) {
      console.error("Failed to load amenities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAmenity = async (name: string) => {
    const newAmenity: Amenity = {
      amenity_category: selectedCategory,
      amenity_name: name,
      is_available: true,
      notes: ""
    };

    setSaving(true);
    try {
      const saved = await fetchWithAuth<{ amenity: Amenity }>(`/api/listings/${listingId}/amenities`, {
        method: "POST",
        body: JSON.stringify(newAmenity)
      });
      
      setAmenities([...amenities, saved.amenity]);
    } catch (error) {
      console.error("Failed to add amenity:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAmenity = async (amenityId: string) => {
    try {
      await fetchWithAuth(`/api/listings/${listingId}/amenities/${amenityId}`, {
        method: "DELETE"
      });
      setAmenities(amenities.filter(a => a.id !== amenityId));
    } catch (error) {
      console.error("Failed to remove amenity:", error);
    }
  };

  const handleToggleAmenity = async (amenityId: string, isAvailable: boolean) => {
    try {
      const updated = await fetchWithAuth<{ amenity: Amenity }>(`/api/listings/${listingId}/amenities/${amenityId}`, {
        method: "PATCH",
        body: JSON.stringify({ is_available: !isAvailable })
      });
      setAmenities(amenities.map(a => 
        a.id === amenityId ? { ...a, is_available: !isAvailable } : a
      ));
    } catch (error) {
      console.error("Failed to toggle amenity:", error);
    }
  };

  const getAmenitiesByCategory = (category: string) => 
    amenities.filter(a => a.amenity_category === category);

  const getCategoryInfo = (categoryId: string) => 
    AMENITY_CATEGORIES.find(c => c.id === categoryId) || AMENITY_CATEGORIES[8];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Existing Amenities */}
      {AMENITY_CATEGORIES.map(category => {
        const categoryAmenities = getAmenitiesByCategory(category.id);
        if (categoryAmenities.length === 0) return null;
        
        const info = getCategoryInfo(category.id);
        
        return (
          <div key={category.id} className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className="text-xs text-muted-foreground">({categoryAmenities.length})</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {categoryAmenities.map(amenity => (
                <div
                  key={amenity.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm",
                    amenity.is_available 
                      ? "bg-primary/10 border-primary/20 text-foreground" 
                      : "bg-muted border-muted text-muted-foreground line-through"
                  )}
                >
                  <button
                    onClick={() => handleToggleAmenity(amenity.id!, amenity.is_available)}
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center",
                      amenity.is_available 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "border-muted-foreground"
                    )}
                  >
                    {amenity.is_available && <Check className="w-3 h-3" />}
                  </button>
                  <span>{amenity.amenity_name}</span>
                  <button
                    onClick={() => handleRemoveAmenity(amenity.id!)}
                    className="p-0.5 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Add New Amenity Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add Amenity
      </button>

      {amenities.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No amenities added yet.</p>
          <p className="text-sm">Add amenities to help guests know what your property offers.</p>
        </div>
      )}

      {/* Add Amenity Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-card">
              <h3 className="font-semibold">Add Amenity</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {AMENITY_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={cn(
                        "p-2 text-sm border rounded-md text-center",
                        selectedCategory === cat.id 
                          ? "border-primary bg-primary/10" 
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="text-lg">{cat.icon}</div>
                      <div>{cat.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Select from common amenities</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(COMMON_AMENITIES[selectedCategory] || []).map(name => {
                    const exists = amenities.some(a => 
                      a.amenity_name.toLowerCase() === name.toLowerCase()
                    );
                    return (
                      <button
                        key={name}
                        onClick={() => !exists && handleAddAmenity(name)}
                        disabled={exists}
                        className={cn(
                          "px-3 py-1 text-sm border rounded-full",
                          exists
                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                            : "hover:bg-primary/10 hover:border-primary"
                        )}
                      >
                        {name} {exists && "✓"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="text-sm font-medium">Or add custom amenity</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter amenity name"
                  className="mt-2 w-full border rounded-md px-3 py-2"
                />
                <input
                  type="text"
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="mt-2 w-full border rounded-md px-3 py-2"
                />
                <button
                  onClick={() => {
                    if (customName.trim()) {
                      handleAddAmenity(customName.trim());
                      setCustomName("");
                      setCustomNotes("");
                    }
                  }}
                  disabled={!customName.trim() || saving}
                  className="mt-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Custom Amenity"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
