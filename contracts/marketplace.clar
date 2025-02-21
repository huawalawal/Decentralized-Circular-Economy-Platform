(define-data-var next-listing-id uint u0)

(define-map listings
  { id: uint }
  {
    seller: principal,
    product-id: uint,
    price: uint,
    active: bool
  }
)

(define-fungible-token marketplace-token)

(define-public (create-listing (product-id uint) (price uint))
  (let ((listing-id (var-get next-listing-id)))
    (var-set next-listing-id (+ listing-id u1))
    (ok (map-set listings
      { id: listing-id }
      {
        seller: tx-sender,
        product-id: product-id,
        price: price,
        active: true
      }
    ))
  )
)

(define-public (buy-listing (listing-id uint))
  (let ((listing (unwrap! (map-get? listings { id: listing-id }) (err u404))))
    (asserts! (get active listing) (err u400))
    (try! (ft-transfer? marketplace-token (get price listing) tx-sender (get seller listing)))
    (ok (map-set listings
      { id: listing-id }
      (merge listing { active: false })
    ))
  )
)

(define-read-only (get-listing (listing-id uint))
  (map-get? listings { id: listing-id })
)

