(define-data-var next-product-id uint u0)

(define-map products
  { id: uint }
  {
    name: (string-ascii 64),
    manufacturer: principal,
    owner: principal,
    status: (string-ascii 20)
  }
)

(define-public (create-product (name (string-ascii 64)))
  (let ((product-id (var-get next-product-id)))
    (var-set next-product-id (+ product-id u1))
    (ok (map-set products
      { id: product-id }
      {
        name: name,
        manufacturer: tx-sender,
        owner: tx-sender,
        status: "created"
      }
    ))
  )
)

(define-public (transfer-product (product-id uint) (new-owner principal))
  (let ((product (unwrap! (map-get? products { id: product-id }) (err u404))))
    (asserts! (is-eq tx-sender (get owner product)) (err u403))
    (ok (map-set products
      { id: product-id }
      (merge product { owner: new-owner })
    ))
  )
)

(define-read-only (get-product (product-id uint))
  (map-get? products { id: product-id })
)

