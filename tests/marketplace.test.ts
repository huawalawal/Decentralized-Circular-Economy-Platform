import { describe, it, beforeEach, expect } from "vitest"

describe("Product Lifecycle Contract", () => {
  let mockStorage: Map<string, any>
  let productNonce: number
  
  beforeEach(() => {
    mockStorage = new Map()
    productNonce = 0
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "create-product":
        const [name] = args
        productNonce++
        mockStorage.set(`product-${productNonce}`, {
          name,
          manufacturer: sender,
          owner: sender,
          status: "created",
        })
        return { success: true, value: productNonce }
      
      case "transfer-product":
        const [productId, newOwner] = args
        const product = mockStorage.get(`product-${productId}`)
        if (!product) return { success: false, error: 404 }
        if (product.owner !== sender) return { success: false, error: 403 }
        product.owner = newOwner
        mockStorage.set(`product-${productId}`, product)
        return { success: true }
      
      case "get-product":
        return { success: true, value: mockStorage.get(`product-${args[0]}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should create a product", () => {
    const result = mockContractCall("create-product", ["Test Product"], "user1")
    expect(result.success).toBe(true)
    expect(result.value).toBe(1)
  })
  
  it("should retrieve a product", () => {
    mockContractCall("create-product", ["Test Product"], "user1")
    const result = mockContractCall("get-product", [1], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toEqual({
      name: "Test Product",
      manufacturer: "user1",
      owner: "user1",
      status: "created",
    })
  })
  
  it("should transfer a product", () => {
    mockContractCall("create-product", ["Test Product"], "user1")
    const result = mockContractCall("transfer-product", [1, "user2"], "user1")
    expect(result.success).toBe(true)
    const product = mockContractCall("get-product", [1], "anyone").value
    expect(product.owner).toBe("user2")
  })
  
  it("should not transfer a product if not the owner", () => {
    mockContractCall("create-product", ["Test Product"], "user1")
    const result = mockContractCall("transfer-product", [1, "user3"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe(403)
  })
})
