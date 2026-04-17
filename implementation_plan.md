# TimberTrack Integration Plan

This plan details the full-stack integration of the existing Stitch UI with a new Node.js + Express + MongoDB backend.

## 1. UI Analysis

Based on the 7 exported Stitch screens, here is the structure:

1. **Dashboard**
   - **View:** Recent Rentals Table (Customer, Items, Out Date, Status, Action).
   - **Actions:** Quick links to "Add Inventory" and "New Rental".
2. **Inventory**
   - **View:** Table of inventory (Item Name, Category, Total Qty, Available, Price/Day, Status).
   - **Actions:** "Add Item", search inventory, numeric inputs for qty and price.
3. **Customers**
   - **View:** List of customers (assumed from layout actions).
   - **Actions:** "Add Customer" (Fields: Name, Phone number etc.)
4. **Rentals & New Rental**
   - **View:** Active vs Completed Rentals table.
   - **Actions:** Search by name/equipment, select dates, "Confirm Rental". 
5. **Rental Detail & Return Items**
   - **View:** Rental information.
   - **Actions:** "Return Items", "Generate Bill", add notes for damaged goods.

## 2. Backend Strategy & Endpoint Mapping (Express + MongoDB)

Since previous backend structures typical for this type of app involve MVC, we will create a `backend` folder with `routes`, `controllers`, and `models`.

| Screen / Action | HTTP Method | Endpoint | Payload Structure (Proposed) |
| --- | --- | --- | --- |
| **Inventory List** | GET | `/api/inventory` | None |
| **Add Inventory** | POST | `/api/inventory` | `{ name, category, totalQty, pricePerDay }` |
| **Customers List** | GET | `/api/customers` | None |
| **Add Customer** | POST | `/api/customers` | `{ name, phone, email }` |
| **Rentals List** | GET | `/api/rentals` | None |
| **Create Rental** | POST | `/api/rentals` | `{ customerId, items: [{itemId, qty}], startDate, endDate }` |
| **Rental Detail** | GET | `/api/rentals/:id` | None |
| **Process Return** | POST | `/api/returns` | `{ rentalId, returnNotes/damageAmount }` |

## 3. Frontend Strategy (Vite + React)

The prompt requests using "React state or context". We will:
1. Initialize a Vite React project in `frontend/`.
2. Move the downloaded HTML/CSS components into React components to ensure they stay visually identical.
3. Establish a central `api.js` (using `axios` or `fetch`) to communicate with the backend.
4. Replace static HTML tables/blocks with mapped React state variables.
5. Add loading indicators & simple inline form validation.

## 4. Open Questions & User Review Required

> [!IMPORTANT]  
> 1. Is there a specific "previous backend" folder in your filesystem that holds the original models/controllers? (I checked `timber-track-saa-s-system-xt` & `Timber_Track_Kiro` but found no backend code). If not, I will scaffold a fresh Express + Mongoose API from scratch.
> 2. The Stitch UI consists of raw HTML files. I will convert these layout structures to a new React application. Please confirm you are okay with this port to React to fulfill the "React state or context" requirement.

## 5. Execution Steps

1. **Setup Backend:** Scaffolding out Node + Express app with Mongoose models for `Inventory`, `Customer`, and `Rental`.
2. **Setup Frontend:** Scaffolding out Vite + React. Transferring the Stitch graphical HTML assets and CSS over.
3. **Data Binding:** Wiring React state to the `api.js` integrations.
4. **Validation & Polish:** Implementing loading spinners and form validation per prompt requirements.
