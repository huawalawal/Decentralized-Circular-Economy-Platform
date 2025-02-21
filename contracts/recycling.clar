(define-data-var next-event-id uint u0)

(define-map recycling-events
  { id: uint }
  {
    product-id: uint,
    recycler: principal,
    amount: uint
  }
)

(define-fungible-token recycling-token)

(define-public (recycle-product (product-id uint) (amount uint))
  (let ((event-id (var-get next-event-id)))
    (var-set next-event-id (+ event-id u1))
    (try! (ft-mint? recycling-token amount tx-sender))
    (ok (map-set recycling-events
      { id: event-id }
      {
        product-id: product-id,
        recycler: tx-sender,
        amount: amount
      }
    ))
  )
)

(define-read-only (get-recycling-event (event-id uint))
  (map-get? recycling-events { id: event-id })
)

(define-read-only (get-recycling-balance (account principal))
  (ok (ft-get-balance recycling-token account))
)

