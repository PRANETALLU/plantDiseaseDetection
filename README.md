# Plant Disease Detection

A full-stack **plant health** app: an **Expo (React Native)** mobile client, a **FastAPI** service for image classification and a lightweight chat endpoint, and **Supabase** for authentication and data. Users sign in, scan plant photos, review history, use a crop-care chat, and participate in a community forum backed by Supabase tables.

---

## Repository layout

| Path | Role |
|------|------|
| `client/my-new-project/` | Expo app (React Native): navigation, screens, Supabase client |
| `server/` | FastAPI app: TensorFlow disease model + GPT-2–style text generation for `/chat` |

---

## Features (from source)

1. **Authentication** — Email/password via Supabase (`UserContext.js`, `auth/Login.js`, `auth/Signup.js`). Unauthenticated users see Welcome → Login/Signup; authenticated users see the main stack.

2. **Scan plant images** — `ScanImage.js` picks from gallery or camera (`react-native-image-picker`), calls `POST http://127.0.0.1:8000/predict/` with `{ image_uri }`, shows `predicted_class`, and inserts a row into Supabase table `scans` (`user_id`, `scan_date`, `image_uri`, `diagnosis`).

3. **Scan history** — `HistoryPage.js` lists `scans` for the current user, supports pull-to-refresh, filters (all / healthy / diseased), detail modal, and delete.

4. **Crop Care Tips** — `CropCareTips.js` is a chat UI that calls `POST http://127.0.0.1:8000/chat/` with `{ query }` and displays `response` from the server (Hugging Face `gpt2` generation in `server/main.py`).

5. **Community forum** — `CommunityForum.js` uses Supabase tables `posts` (`id`, `title`, `content`, `category`, `created_at`, `user_id`) and `comments` (`post_id`, `user_id`, `content`, …). Supports search, category filters, create/edit/delete posts (owner-only), and comments.

---

## Tech stack

- **Client:** Expo ~52, React Native, React Navigation (stack), React Native Paper, `@supabase/supabase-js`, `axios`, `moment`, `react-native-image-picker`, `@react-native-async-storage/async-storage`, and related UI libs (see `client/my-new-project/package.json`).
- **Server:** FastAPI, TensorFlow/Keras (`plant_disease_model.h5`), Pillow, NumPy, `transformers` + PyTorch for GPT-2 text generation.
- **Backend-as-a-service:** Supabase (Auth + Postgres for `scans`, `posts`, `comments`).

---

## ML API (`server/main.py`)

- **`POST /predict/`** — Body: `{ "image_uri": "<string>" }`. The server treats this as base64 image data (strips a `data:image/...;base64,` prefix if present), resizes to **224×224**, runs the Keras model, and returns:
  - `predicted_class` — one of: `Bacterial_Disease`, `Environmental_Stress`, `Fungal_Disease`, `Healthy`, `Viral_Disease`
  - `confidence` — float
- **`POST /chat/`** — Body: `{ "query": "<string>" }`. Returns `{ "response": "<generated text>" }` using the `gpt2` tokenizer/model.

**CORS** is enabled for `http://localhost:8081` (typical Expo web/dev URL). If you use another origin, update `allow_origins` in `main.py`.

**Client/server alignment:** `ScanImage.js` sends `image_uri: image.uri` (a local `file://` URI from the picker). `main.py` decodes base64 in that field. For reliable predictions, either send base64 from the client (e.g. enable `includeBase64` in the picker options and pass that string) or change the server to read the file from the URI path.

---

## Supabase setup

The Expo app reads credentials from Expo config (`app.config.js`):

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Create a `.env` file in `client/my-new-project/` with those variables (loaded via `app.config.js` / `dotenv`).

**Tables expected by the app:**

- **`scans`** — at least: `user_id`, `scan_date`, `image_uri`, `diagnosis` (and `id` for history/delete).
- **`posts`** — `id`, `title`, `content`, `category`, `created_at`, `user_id`.
- **`comments`** — `post_id`, `user_id`, `content`, `created_at` (and `id` as returned by inserts).

Enable Row Level Security and policies appropriate for your security model; the app uses the anon key and authenticated user `user.id`.

---

## Running locally

### Python API

From `server/`:

1. Create a virtual environment and install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

2. Place the trained weights file **`plant_disease_model.h5`** next to `main.py` (path is hardcoded as `MODEL_PATH = "plant_disease_model.h5"`).

3. Start the API (example):

   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The mobile app is configured to call **`http://127.0.0.1:8000`**. On a physical device, use your machine’s LAN IP and ensure the phone can reach that host, or use a tunnel; you would then update the `fetch` URLs in `ScanImage.js` and `CropCareTips.js` accordingly.

### Expo client

From `client/my-new-project/`:

1. Copy/configure `.env` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

2. Install and start:

   ```bash
   npm install
   npx expo start
   ```

Use `npm run android`, `npm run ios`, or `npm run web` as needed.

---

## Project entry points

- **App bootstrap:** `client/my-new-project/index.js` → `App.js` wraps `UserAuthProvider` and `RootNavigator`.
- **Navigation:** `RootNavigator.js` — `AuthStack` (Welcome, Login, Signup) vs `AppStack` (Home, Scan Image, History, Community Forum, Crop Care Tips).
- **Supabase client:** `supabaseClient.js` uses `Constants.expoConfig.extra` from `app.config.js`.

---

## License

See `client/my-new-project/package.json` (`license` field) for the client package license.
