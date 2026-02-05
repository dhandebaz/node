export const COMPANY_CONFIG = {
  headquarters: {
    address: "Okhla, Delhi, India",
    city: "New Delhi",
    state: "Delhi",
    country: "India",
  },
  datacenters: [
    {
      id: "DC-DEL-01",
      name: "Okhla – Delhi",
      location: {
        city: "New Delhi",
        state: "Delhi",
        country: "India",
      },
      address: "Okhla, Delhi, India",
      capacity: {
        total: 180,
        active: 6,
      },
      status: "active" as const,
      goLiveDate: "2023-11-15T00:00:00Z",
      infrastructure: {
        powerProfile: "Dual source grid + N+1 DG Backup",
        networkProfile: "Carrier Neutral, 10Gbps Uplink",
        coolingProfile: "Precision AC (N+1)",
      },
      notes: ["Primary HQ and Datacenter."],
    }
  ]
};
