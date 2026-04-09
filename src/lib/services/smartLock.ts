/**
 * Smart Lock Integration Service
 * Similar to Nowistay's automated Smart Lock PIN provisioning.
 */

export interface SmartLockProvider {
  /**
   * Generates a unique PIN for the given timeframe.
   */
  generateAccessCode(
    lockId: string,
    guestName: string,
    validFrom: Date,
    validUntil: Date
  ): Promise<{ pin: string; codeId: string }>;
  /**
   * Revokes the access code before expiration if needed.
   */
  revokeAccessCode(lockId: string, codeId: string): Promise<boolean>;
}

export class SmartLockService {
  private static providers: Record<string, SmartLockProvider> = {};

  static registerProvider(name: string, provider: SmartLockProvider) {
    this.providers[name] = provider;
  }

  static async provisionGuestAccess(
    providerName: string,
    lockId: string,
    guestName: string,
    validFrom: Date,
    validUntil: Date
  ): Promise<{ pin: string; codeId: string } | null> {
    const provider = this.providers[providerName];
    if (!provider) {
      console.warn(`SmartLock provider ${providerName} not registered.`);
      return null;
    }

    try {
      return await provider.generateAccessCode(
        lockId,
        guestName,
        validFrom,
        validUntil
      );
    } catch (err) {
      console.error("Failed to provision guest access:", err);
      return null;
    }
  }

  static async revokeGuestAccess(
    providerName: string,
    lockId: string,
    codeId: string
  ): Promise<boolean> {
    const provider = this.providers[providerName];
    if (!provider) return false;

    try {
      return await provider.revokeAccessCode(lockId, codeId);
    } catch (err) {
      console.error("Failed to revoke guest access:", err);
      return false;
    }
  }
}

// ----------------------------------------
// NUKI Integration
// ----------------------------------------
class NukiProvider implements SmartLockProvider {
  private apiToken = process.env.NUKI_API_TOKEN;
  private baseUrl = "https://api.nuki.io/smartlock";

  async generateAccessCode(lockId: string, guestName: string, validFrom: Date, validUntil: Date) {
    if (!this.apiToken) throw new Error("NUKI_API_TOKEN not configured");
    
    // Nuki requires type 13 for Keypad code
    const payload = {
      name: guestName,
      type: 13,
      startDate: validFrom.toISOString(),
      endDate: validUntil.toISOString()
    };

    const res = await fetch(`${this.baseUrl}/${lockId}/auth`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${this.apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error(`Nuki Error: ${await res.text()}`);
    
    const data = await res.json();
    return { pin: String(data.code), codeId: String(data.id) };
  }

  async revokeAccessCode(lockId: string, codeId: string) {
    if (!this.apiToken) throw new Error("NUKI_API_TOKEN not configured");
    const res = await fetch(`${this.baseUrl}/${lockId}/auth/${codeId}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${this.apiToken}` }
    });
    return res.status === 204;
  }
}

// ----------------------------------------
// TTLOCK Integration
// ----------------------------------------
class TTLockProvider implements SmartLockProvider {
  private clientId = process.env.TTLOCK_CLIENT_ID;
  private accessToken = process.env.TTLOCK_ACCESS_TOKEN; // Typically resolved dynamically per tenant
  private baseUrl = "https://euapi.ttlock.com/v3";

  async generateAccessCode(lockId: string, guestName: string, validFrom: Date, validUntil: Date) {
    if (!this.clientId || !this.accessToken) throw new Error("TTLock credentials missing");

    const params = new URLSearchParams({
      clientId: this.clientId,
      accessToken: this.accessToken,
      lockId: lockId,
      keyboardPwdName: guestName,
      keyboardPwdType: "3", // 3 = period 
      startDate: validFrom.getTime().toString(),
      endDate: validUntil.getTime().toString(),
      date: new Date().getTime().toString()
    });

    const res = await fetch(`${this.baseUrl}/keyboardPwd/get`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const data = await res.json();
    if (data.errcode !== 0) throw new Error(`TTLock Error: ${data.errmsg}`);

    return { pin: data.keyboardPwd, codeId: String(data.keyboardPwdId) };
  }

  async revokeAccessCode(lockId: string, codeId: string) {
    if (!this.clientId || !this.accessToken) throw new Error("TTLock credentials missing");
    
    const params = new URLSearchParams({
      clientId: this.clientId,
      accessToken: this.accessToken,
      lockId: lockId,
      keyboardPwdId: codeId,
      deleteType: "2",
      date: new Date().getTime().toString()
    });

    const res = await fetch(`${this.baseUrl}/keyboardPwd/delete`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const data = await res.json();
    return data.errcode === 0;
  }
}

// Register built-in providers automatically
SmartLockService.registerProvider("nuki", new NukiProvider());
SmartLockService.registerProvider("ttlock", new TTLockProvider());
