import { log } from "@/lib/logger";

export interface MetaProductParams {
  id: string; // Retailer ID
  name: string;
  description: string;
  availability: "in stock" | "out of stock" | "preorder";
  condition: "new" | "used" | "refurbished";
  price: number;
  currency: string;
  image_url: string;
  url: string;
  brand: string;
}

const GRAPH_API_VERSION = "v21.0";

export class MetaCatalogService {
  /**
   * Create a new Product Catalog for a Business
   */
  static async createCatalog(businessId: string, accessToken: string, name: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${businessId}/owned_product_catalogs`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to create catalog");

      log.info("[MetaCatalog] Product catalog created", { id: data.id });
      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaCatalog] Create catalog failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Add or Update a Product in a Catalog
   */
  static async upsertProduct(catalogId: string, accessToken: string, product: MetaProductParams) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${catalogId}/products`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            retailer_id: product.id,
            name: product.name,
            description: product.description,
            availability: product.availability,
            condition: product.condition,
            price: product.price * 100, // API usually expects cents
            currency: product.currency,
            image_url: product.image_url,
            url: product.url,
            brand: product.brand
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to upsert product");

      return { success: true, id: data.id };
    } catch (e) {
      log.error("[MetaCatalog] Upsert product failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }

  /**
   * Batch Upload Products (Recommended for larger catalogs)
   */
  static async batchUpload(catalogId: string, accessToken: string, products: MetaProductParams[]) {
    try {
      const requests = products.map(p => ({
        method: "UPDATE",
        retailer_id: p.id,
        data: {
          name: p.name,
          description: p.description,
          availability: p.availability,
          condition: p.condition,
          price: p.price * 100,
          currency: p.currency,
          image_url: p.image_url,
          url: p.url,
          brand: p.brand
        }
      }));

      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${catalogId}/batch`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ requests }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Batch upload failed");

      return { success: true, handle: data.handles };
    } catch (e) {
      log.error("[MetaCatalog] Batch upload failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
  /**
   * Get Catalogs for a Business
   */
  static async getCatalogs(businessId: string, accessToken: string) {
    try {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${businessId}/owned_product_catalogs?` +
        new URLSearchParams({
          fields: "id,name,vertical",
          access_token: accessToken
        })
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error?.message || "Failed to fetch catalogs");

      return { success: true, data: data.data };
    } catch (e) {
      log.error("[MetaCatalog] Get catalogs failed", { error: e });
      return { success: false, error: (e as Error).message };
    }
  }
}
