"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/fetcher";
import { cn } from "@/lib/utils";
import { useDashboardStore } from "@/store/useDashboardStore";
import { getBusinessLabels } from "@/lib/business-context";
import { Star, MessageSquare, ExternalLink, Check, X, Filter, Loader2, Plus } from "lucide-react";
import { format, parseISO, isAfter } from "date-fns";

interface Review {
  id: string;
  listing_id: string;
  guest_name: string;
  platform: string;
  rating: number;
  title: string;
  content: string;
  response_text: string | null;
  responded_at: string | null;
  received_at: string;
}

interface Listing {
  id: string;
  title: string;
}

export default function ReviewsPage() {
  const { tenant } = useDashboardStore();
  const labels = getBusinessLabels(tenant?.businessType);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [filterListing, setFilterListing] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({
    listingId: "",
    guestName: "",
    platform: "direct",
    rating: 5,
    title: "",
    content: ""
  });

  useEffect(() => {
    if (tenant?.id) {
      loadData();
    }
  }, [tenant?.id]);

  const loadData = async () => {
    try {
      const reviewsData = await fetchWithAuth<{ reviews: Review[] }>(`/api/reviews?tenant_id=${tenant?.id}`);
      setReviews(reviewsData.reviews || []);
      
      const listingsData = await fetchWithAuth<{ listings: Listing[] }>(`/api/listings?tenant_id=${tenant?.id}`);
      setListings(listingsData.listings || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedReview || !responseText.trim()) return;
    
    setSubmitting(true);
    try {
      const updated = await fetchWithAuth<{ review: Review }>(`/api/reviews/${selectedReview.id}/respond`, {
        method: "POST",
        body: JSON.stringify({ response_text: responseText }),
      });
      
      setReviews(reviews.map(r => 
        r.id === selectedReview.id ? updated.review : r
      ));
      setSelectedReview({ ...selectedReview, response_text: responseText, responded_at: new Date().toISOString() });
      setResponseText("");
    } catch (error) {
      console.error("Failed to respond:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter(r => {
    if (filterPlatform !== "all" && r.platform !== filterPlatform) return false;
    if (filterRating !== "all" && r.rating !== parseInt(filterRating)) return false;
    if (filterListing !== "all" && r.listing_id !== filterListing) return false;
    return true;
  });

  const averageRating = reviews.length 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  const ratingBreakdown = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length ? Math.round((reviews.filter(r => r.rating === rating).length / reviews.length) * 100) : 0
  }));

  const getListingTitle = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    return listing?.title || "Unknown Property";
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "airbnb": return "bg-red-500";
      case "booking": return "bg-blue-500";
      case "mmt": return "bg-orange-500";
      case "google": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage guest reviews from all platforms</p>
        </div>
        <button
          onClick={() => {
            if (listings.length > 0) {
              setNewReview(prev => ({ ...prev, listingId: listings[0].id }));
            }
            setShowAddModal(true);
          }}
          disabled={listings.length === 0}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-4 w-4 mr-2 inline" />
          Add Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span className="text-2xl font-bold">{averageRating}</span>
            <span className="text-muted-foreground">/ 5</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{reviews.length}</div>
          <p className="text-sm text-muted-foreground mt-1">Total Reviews</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{reviews.filter(r => r.rating >= 4).length}</div>
          <p className="text-sm text-muted-foreground mt-1">Positive (4-5★)</p>
        </div>
        <div className="bg-card border rounded-lg p-4">
          <div className="text-2xl font-bold">{reviews.filter(r => !r.response_text).length}</div>
          <p className="text-sm text-muted-foreground mt-1">Pending Response</p>
        </div>
      </div>

      {/* Rating Breakdown */}
      {reviews.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <h3 className="font-semibold mb-3">Rating Breakdown</h3>
          <div className="space-y-2">
            {ratingBreakdown.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="w-8 text-sm">{rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 rounded-full" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-muted-foreground text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select 
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Platforms</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking.com</option>
          <option value="mmt">MakeMyTrip</option>
          <option value="google">Google</option>
          <option value="direct">Direct</option>
        </select>
        
        <select 
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        <select 
          value={filterListing}
          onChange={(e) => setFilterListing(e.target.value)}
          className="bg-background border rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All Properties</option>
          {listings.map(listing => (
            <option key={listing.id} value={listing.id}>{listing.title}</option>
          ))}
        </select>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12">
          <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No reviews yet</h3>
          <p className="text-muted-foreground">Guest reviews will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredReviews.map((review) => (
            <div 
              key={review.id}
              className={cn(
                "bg-card border rounded-lg p-4 cursor-pointer transition-colors hover:bg-accent",
                selectedReview?.id === review.id && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full", getPlatformColor(review.platform))} />
                  <span className="font-medium capitalize">{review.platform}</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star 
                      key={i} 
                      className={cn(
                        "h-4 w-4", 
                        i < review.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                      )} 
                    />
                  ))}
                </div>
              </div>
              
              <p className="mt-2 font-medium">{review.title || "No title"}</p>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{review.content}</p>
              
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{getListingTitle(review.listing_id)}</span>
                <span className="text-muted-foreground">
                  {review.received_at ? format(parseISO(review.received_at), "MMM d, yyyy") : ""}
                </span>
              </div>

              {review.response_text ? (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Your response:</p>
                  <p className="text-sm">{review.response_text}</p>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-sm text-orange-500">
                  <MessageSquare className="h-4 w-4" />
                  <span>Pending response</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Respond to Review</h3>
                <button 
                  onClick={() => { setSelectedReview(null); setResponseText(""); }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", getPlatformColor(selectedReview.platform))} />
                <span className="capitalize">{selectedReview.platform}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{getListingTitle(selectedReview.listing_id)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-5 w-5", 
                      i < selectedReview.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                    )} 
                  />
                ))}
              </div>

              <div>
                <h4 className="font-medium">{selectedReview.title || "No title"}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedReview.content}</p>
              </div>

              {selectedReview.response_text ? (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-xs text-muted-foreground mb-1">Your previous response:</p>
                  <p className="text-sm">{selectedReview.response_text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedReview.responded_at && format(parseISO(selectedReview.responded_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Your Response</label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Thank you for your feedback..."
                    className="mt-1 w-full border rounded-md p-3 min-h-[120px] text-sm"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{responseText.length}/500 characters</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => { setSelectedReview(null); setResponseText(""); }}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              {!selectedReview.response_text && (
                <button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || submitting}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Response"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border rounded-lg w-full max-w-lg">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Add Review</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <p className="text-sm text-muted-foreground">
                Manually add a guest review. For automated review fetching, connect via iCal or enter reviews from external platforms.
              </p>
              
              <div>
                <label className="text-sm font-medium">Property *</label>
                <select
                  value={newReview.listingId}
                  onChange={(e) => setNewReview({ ...newReview, listingId: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="">Select property</option>
                  {listings.map(listing => (
                    <option key={listing.id} value={listing.id}>{listing.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Guest Name *</label>
                <input
                  type="text"
                  value={newReview.guestName}
                  onChange={(e) => setNewReview({ ...newReview, guestName: e.target.value })}
                  placeholder="Enter guest name"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Platform *</label>
                <select
                  value={newReview.platform}
                  onChange={(e) => setNewReview({ ...newReview, platform: e.target.value })}
                  className="mt-1 w-full border rounded-md px-3 py-2"
                >
                  <option value="direct">Direct / Manual</option>
                  <option value="airbnb">Airbnb (Manual Entry)</option>
                  <option value="booking">Booking.com (Manual Entry)</option>
                  <option value="mmt">MakeMyTrip (Manual Entry)</option>
                  <option value="google">Google Reviews (Manual Entry)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Rating *</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReview({ ...newReview, rating: star })}
                      className="p-1"
                    >
                      <Star 
                        className={cn(
                          "h-8 w-8", 
                          star <= newReview.rating ? "fill-yellow-500 text-yellow-500" : "text-muted"
                        )} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  type="text"
                  value={newReview.title}
                  onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                  placeholder="Review title"
                  className="mt-1 w-full border rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Review Content</label>
                <textarea
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  placeholder="Enter the guest's review..."
                  className="mt-1 w-full border rounded-md px-3 py-2 min-h-[100px]"
                />
              </div>
            </div>

            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm border rounded-md hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newReview.listingId || !newReview.guestName) return;
                  setSubmitting(true);
                  try {
                    await fetchWithAuth("/api/reviews", {
                      method: "POST",
                      body: JSON.stringify({
                        tenant_id: tenant?.id,
                        listing_id: newReview.listingId,
                        platform: newReview.platform,
                        rating: newReview.rating,
                        title: newReview.title,
                        content: newReview.content,
                        guest_name: newReview.guestName
                      })
                    });
                    loadData();
                    setShowAddModal(false);
                    setNewReview({ listingId: "", guestName: "", platform: "direct", rating: 5, title: "", content: "" });
                  } catch (error) {
                    console.error("Failed to add review:", error);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                disabled={!newReview.listingId || !newReview.guestName || submitting}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
