# Repair Batch Search Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add partial repair batch search to the product list without duplicating products.

**Architecture:** Extend the product-level Supabase view with aggregated repair batch numbers, then filter that field through a dedicated URL-backed search input. Keep filtering, counting, sorting, and pagination server-side.

**Tech Stack:** Next.js App Router, TypeScript, MUI, Supabase/PostgreSQL

---

### Task 1: Extend the product list view

**Files:**
- Modify: Supabase view `public.admin_product_list`

1. Add an aggregated `repair_batch_numbers` text column from non-empty repair records.
2. Preserve one row per product and existing view columns.
3. Query known partial batch values and verify counts contain no duplicate product IDs.

### Task 2: Add server-side batch filtering

**Files:**
- Modify: `meshrepair/app/admin/products/page.tsx`

1. Add `repairBatch` to search parameters and row typing.
2. Select `repair_batch_numbers` from the view.
3. Apply case-insensitive partial filtering before ordering and pagination.
4. Ensure redirects and pagination preserve the parameter.

### Task 3: Add the batch search control

**Files:**
- Modify: `meshrepair/components/admin/products-data-grid.tsx`

1. Add the batch field to filter types and local search state.
2. Render it immediately left of serial search.
3. Submit both fields together, reset to page 1, and support clearing.
4. Keep the controls responsive on narrow screens.

### Task 4: Verify behavior

**Files:**
- No production file changes expected

1. Run `npm run lint` and expect success.
2. Run `npm run build` and expect success.
3. Verify partial, combined, clear, URL persistence, and no-duplicate behavior in the browser.
