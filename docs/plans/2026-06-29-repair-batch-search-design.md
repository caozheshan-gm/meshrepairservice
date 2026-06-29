# Repair Batch Search Design

## Goal

Allow staff to find products from the product list by entering part of a repair batch number while preserving one row per product.

## Design

Add a dedicated repair batch search input immediately before the serial number search input. The filter is stored in the `repairBatch` URL parameter, supports case-insensitive partial matching, resets pagination when changed, and combines with the serial search using AND semantics.

Extend `admin_product_list` with an aggregated, searchable value containing every non-empty `repair_records.customer_repair_batch_no` for each product. Because aggregation remains inside the existing product-level view, result rows, counts, sorting, and pagination continue to operate at product granularity.

The UI submits on Enter and uses the same clear/apply behavior as serial search. No repair record is duplicated in the grid and no product data is copied into another table.

## Verification

Verify partial batch matches, combined batch and serial searches, clearing the filter, pagination URL persistence, and one-row-per-product behavior. Run lint and a production build, then test the running page in a browser.
