# Plant Disease Detection App

A **React Native** application that allows users to **scan plant images**, detect **plant diseases using a machine learning model**, and maintain a **history of scans**. The app also includes a **community forum** and **crop care tips** to assist farmers and plant enthusiasts.  

---

## Features

1. **Scan Plant Images**
   - Pick images from your device’s gallery.
   - Detect plant diseases using a machine learning model hosted via an API.
   - Display detected disease results in real-time.

2. **Scan History**
   - View all previously scanned images with diagnoses.
   - Delete scans from history.
   - View detailed scan info in a modal.

3. **Community Forum**
   - Create and browse posts about plant diseases, farming tips, or general queries.
   - Filter posts by category.
   - Search posts by title or content.

4. **Crop Care Tips**
   - Ask questions about crop care.
   - Receive AI-generated responses to queries in a chat interface.

5. **Disease Library**
   - Browse a library of common plant diseases.
   - View disease description, symptoms, and images.
   - Data fetched from Plant.id API.

---

## Screens

1. **Scan Image**
   - Pick an image from the device gallery.
   - Detect disease using the ML model API.
   - Save scan details (image, date, diagnosis) to Supabase.

2. **History Page**
   - Shows a list of previous scans.
   - Includes scan date, image, and diagnosis.
   - Supports viewing details in a modal and deleting scans.

3. **Community Forum**
   - List posts by category.
   - Create new posts via a modal form.
   - Search and filter posts.

4. **Crop Care Tips**
   - Ask questions about crops.
   - Receive AI-driven advice in a chat interface.

5. **Disease Library**
   - Lists diseases fetched from Plant.id API.
   - Tap to view detailed description and symptoms.

---

## Tech Stack

- **Frontend:** React Native, React Native Paper, React Navigation
- **Backend / Database:** Supabase (PostgreSQL)
- **Machine Learning API:** Custom ML API (Python, FastAPI)
- **Third-Party APIs:** Plant.id API for disease library
- **State Management:** React hooks (`useState`, `useEffect`)
- **Networking:** Fetch API, Axios
- **Other Libraries:**  
  - `react-native-image-picker` for image selection  
  - `moment` for date formatting  
  - `@react-native-picker/picker` for dropdown selections  

---

