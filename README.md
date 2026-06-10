# Step-by-Step Test Guide: IP-Based Rate Limiting System

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

### Step 1: Create an API Key (Homepage)
1. Open your browser and navigate to `http://localhost:5173`.
2. Locate the **Generate a New Key** card.
3. In the **API Key Name** field, type `Demo Key` and click the **Generate API Key** button.
- **Expected Outcome**:
  - A green container appears showing: `✓ Key Generated Successfully`.
  - Your secure API key (prefixed with `sk_live_...`) is displayed.
  - Click the **Copy** button to copy it.
  - The key is added to the **Active Credentials** list below.
  - **DB Check**: A new document is created in the `api_keys` collection containing `{ name: "Demo Key", apiKey: "sk_live_..." }`.

### Step 2: Test API Requests (API Playground Page)
1. Click the **Playground** tab in the top navigation bar.
2. The **X-API-KEY HEADER** input field will automatically be prefilled with your copied key.
3. Click the blue **Send Request** button once.
- **Expected Outcome**:
  - A green badge appears showing `200 OK`.
  - The Response Body prints the JSON output: `"message": "API Request Successful!"`, server latency, key name (`Demo Key`), and client IP.
  - The **Rate Limit Status** (IP-Based Quota) ticks down from `10/10` to `9/10`.

### Step 3: Trigger IP Rate Limiting (10 Req / 3 Mins)
1. Rapidly click the **Send Request** button 11 times in under 3 minutes.
- **Expected Outcome**:
  - For the first 10 requests, you will receive `200 OK` as the remaining count decreases to `0/10`.
  - On the **11th click**, the status badge turns red showing `429 Too Many Requests`.
  - The Response Body displays:
    ```json
    {
      "success": false,
      "message": "IP rate limit exceeded"
    }
    ```
  - The card displays: `Resets in X seconds` (counting down from a maximum of 180 seconds).
  - **DB Check**: An entry in `ip_rate_limits` is updated with `count: 11`.

### Step 4: Verify Quota Reset
1. Stop clicking. Wait for the reset timer to count down to `0` seconds.
2. Click **Send Request** again.
- **Expected Outcome**:
  - The request succeeds again and returns `200 OK`.
  - Your remaining quota resets back to `9/10`.
  - **DB Check**: The document in `ip_rate_limits` is deleted automatically by the hybrid cleanup logic, and a fresh request cycle begins.

### Step 5: Test Auth Failures
1. Delete the API key from the **X-API-KEY HEADER** input field (leave it blank).
2. Click **Send Request** once.
- **Expected Outcome**:
  - The response badge shows `401 Unauthorized` and the body says: `{"success": false, "message": "Invalid API Key"}`.

### Step 6: Monitor Live Metrics (Usage Dashboard Page)
1. Click the **Dashboard** tab in the top navigation bar.
2. Select `Demo Key` from the **ACTIVE KEY** dropdown menu.
3. Ensure the **Auto-poll (3s)** checkbox is checked.
- **Expected Outcome**:
  - The dashboard updates every 3 seconds.
  - The **IP Rate Limit (3 Mins)** card displays your real-time active IP usage, remaining requests, and countdown.
  - The active selected API Key is monitored on the right metadata card.
