import { describe, it, beforeEach, expect } from "vitest"

describe("Marketplace Contract", () => {
  let mockStorage: Map<string, any>
  let listingNonce: number
  let tokenBalances: Map<string, number>
  
  beforeEach(() => {
    mockStorage = new Map()
    listingNonce = 0
    tokenBalances = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "create-listing":
        const [productId, price] = args
        listingNonce++
        mockStorage.set(`listing-${listingNonce}`, {
          seller: sender,
          "product-id": productId,
          price,
          active: true,
        })
        return { success: true, value: listingNonce }
      
      case "buy-listing":
        const [listingId] = args
        const listing = mockStorage.get(`listing-${listingId}`)
        if (!listing) return { success: false, error: 404 }
        if (!listing.active) return { success: false, error: 400 }
        if ((tokenBalances.get(sender) || 0) < listing.price) return { success: false, error: "Insufficient balance" }
        tokenBalances.set(sender, (tokenBalances.get(sender) || 0) - listing.price)
        tokenBalances.set(listing.seller, (tokenBalances.get(listing.seller) || 0) + listing.price)
        listing.active = false
        mockStorage.set(`listing-${listingId}`, listing)
        return { success: true }
      
      case "get-listing":
        return { success: true, value: mockStorage.get(`listing-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should create a listing", () => {
    const result = mockContractCall("create-listing", [1, 100], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should retrieve a listing", () => {
    mockContractCall("create-listing", [1, 100], "user1")
    const result = mockContractCall("get-listing", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      seller: "user1",
      "product-id": 1,
      price: 100,
      active: true,
    })
  })
  
  it("should buy a listing", () => {
    mockContractCall("create-listing", [1, 100], "user1")
    tokenBalances.set("user2", 200)
    const result = mockContractCall("buy-listing", [1], "user2")
    expect(result.success).toBe(true)
    const listing = mockContractCall("get-listing", [1], "anyone").value
    expect(listing.active).toBe(false)
    expect(tokenBalances.get("user1")).toBe(100)
    expect(tokenBalances.get("user2")).toBe(100)
  })
  
  it("should not buy a listing with insufficient balance", () => {
    mockContractCall("create-listing", [1, 100], "user1")
    tokenBalances.set("user2", 50)
    const result = mockContractCall("buy-listing", [1], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe("Insufficient balance")
  })
})

