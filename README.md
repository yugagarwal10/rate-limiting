# Step-by-Step Test Guide: API Key Rate Limiting System

Follow these instructions to run the project and verify all functionalities.

---

## 1. Quick Start

### Step 1: Start MongoDB
Ensure MongoDB is running locally on port `27017`.
- **On Windows (Service)**: Start via Services Manager or run `net start MongoDB` as Administrator.
- **On Windows (Manual Process)**: Run `mongod` pointing to a data folder:
  ```powershell
  & "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath C:\data\db --port 27017
  ```

### Step 2: Start Backend
```bash
cd backend

## Environment Variables

Create a `.env` file in the backend directory and add the following:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rate-limiter
```
npm install
npm run dev
```
*(Server starts on `http://localhost:5000`)*

### Step 3: Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Client starts on `http://localhost:5173`)*

---

## 2. Step-by-Step Testing Procedure & Expected Outcomes

### Step 1: Create API Key A and API Key B (Homepage)
1. Open your browser and navigate to `http://localhost:5173`.
2. In the **API Key Name** field, type `Key A` and click the **Generate API Key** button.
3. Once generated, copy this key (e.g. `sk_live_key_A...`).
4. Again, in the **API Key Name** field, type `Key B` and click the **Generate API Key** button.
5. Copy this second key (e.g. `sk_live_key_B...`).
- **Expected Outcome**:
  - Both keys appear in the **Active Credentials** list.
  - **DB Check**: Two documents are created in the `api_keys` collection.

### Step 2: Test API Key A Requests (API Playground Page)
1. Click the **Playground** tab in the top navigation bar.
2. In the **X-API-KEY HEADER** input field, paste the copied **Key A** string.
3. Click the blue **Send Request** button once.
- **Expected Outcome**:
  - A green badge appears showing `200 OK`.
  - The Response Body prints the successful JSON response.
  - The **Rate Limit Status** (API Key Quota) ticks down from `10/10` to `9/10`.

### Step 3: Trigger API Key Rate Limiting on Key A
1. Rapidly click the **Send Request** button 11 times.
- **Expected Outcome**:
  - On the **11th click**, the status badge turns red showing `429 Too Many Requests`.
  - The Response Body displays:
    ```json
    {
      "success": false,
      "message": "API Key rate limit exceeded"
    }
    ```
  - The rate limit panel displays: `Resets in X seconds` (counting down from 180s).
  - **DB Check**: An entry in `api_key_rate_limits` is updated with `count: 11` for Key A.

### Step 4: Verify Key B remains Active (Independent Quotas)
1. Delete the Key A string from the **X-API-KEY HEADER** input.
2. Paste the **Key B** string and click **Send Request** once.
- **Expected Outcome**:
  - The request succeeds immediately returning `200 OK`!
  - The **Rate Limit Status** updates to show `9/10` remaining for Key B.
  - This proves that **Key B is completely unaffected by the rate limiting on Key A**, confirming that quotas are isolated per API key.

### Step 5: Verify Quota Reset
1. Go back and select **Key A** (paste Key A string in the input field).
2. Wait for the reset timer to count down and reach `0` seconds.
3. Click **Send Request** again.
- **Expected Outcome**:
  - The request succeeds with `200 OK`.
  - **DB Check**: Key A's rate limit document is deleted automatically by our hybrid cleanup logic, resetting Key A's quota.

### Step 6: Monitor Live Metrics (Usage Dashboard Page)
1. Click the **Dashboard** tab in the top navigation bar.
2. Select `Key A` or `Key B` from the **ACTIVE KEY** dropdown menu.
3. Toggle **Auto-poll (3s)**.
- **Expected Outcome**:
  - The **API Key Rate Limit (3 Mins)** card displays the real-time active quota details and reset countdown specifically for the selected key.
