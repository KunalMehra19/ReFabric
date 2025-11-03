# 🛍️ AI-Driven Fabric Marketplace (Athena)

## 🌟 Overview  
The **AI-Driven Fabric Marketplace (Athena)** is a full-stack web platform designed to connect **fabric vendors** and **buyers** through a smart, AI-assisted system.  

Vendors can upload fabric images, and an integrated Vision-to-Text AI model automatically analyzes and tags properties like **fabric type**, **pattern**, and **dominant colors**.  
Buyers can then explore, filter, and purchase fabrics online using this rich metadata.

---

## 💡 Key Technologies  

This project integrates modern web development frameworks with a cutting-edge machine learning pipeline.

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React.js** + **Tailwind CSS** | Modern, responsive user interface and styling |
| **Backend** | **Flask** REST API | Hosts the critical `/upload` endpoint for AI inference and data processing |
| **AI Layer** | **Hugging Face** Vision2Seq | Proprietary model (`0x-Jayveersinh-Raj/fabric_classifier`) for identifying fabric properties and generating captions |
| **Database/Auth** | **Supabase** (PostgreSQL) | Stores fabric listings, metadata, and handles user authentication (Email and Google OAuth) |

---

## ⚙️ Core Backend Logic: `/upload` Endpoint  

The core functionality resides in the Flask backend, which analyzes an uploaded fabric image and transforms it into structured metadata.

### API Contract  
- **Endpoint:** `POST /upload`  
- **Request:** `multipart/form-data` (key: `'image'`)  
- **Response Example:**  
  ```json
  {
    "fabric_type": "cotton",
    "pattern": "floral",
    "dominant_colors": ["#e0c59d", "#7b3f00", "#f2e5b8"],
    "raw_text": "cotton floral fabric"
  }


### AI Tagging and Color Extraction

1. **Image Processing:** The uploaded image is converted to a tensor format using `AutoProcessor`.
2. **Caption Generation:** The Vision2Seq model predicts a descriptive text caption (e.g., `"cotton floral fabric"`).
3. **Color Detection:** KMeans clustering is applied to the RGB pixels to identify and extract the top three dominant colors, returned as HEX codes.
4. **Tagging:** Fabric type (first word of the caption) and pattern are extracted using rule-based keyword filtering.

---

## 🚀 User Flows

### 🧵 Vendor Flow

The vendor logs in, navigates to **"Upload Fabric"**, and submits an image.
The AI response (tags and colors) is displayed and saved to the Supabase database for listing creation.

### 👗 Buyer Flow

The buyer browses the **"Marketplace"** and can apply filters based on **fabric type**, **pattern**, or **color**.
They can then add items to their cart or purchase directly.

---

## 🛠️ Technical Setup

### Prerequisites

* Python 3.x
* Node.js (for React)
* Supabase project (API URL and Key)

---

### 1️⃣ Backend Setup (Flask/Python)

The backend code is handled by `app.py`.

```bash
# Install required Python packages
pip install Flask transformers scikit-learn pillow numpy opencv-python

# Run the Flask API
python app.py
```

*Note: Requires the Hugging Face model `"0x-Jayveersinh-Raj/fabric_classifier"` to be accessible.*

---

### 2️⃣ Frontend Setup (React/Node)

The React application is located in the `frontend/` directory.

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

*Note: Ensure environment variables for Supabase Auth and Database connection are configured in `.env`.*

---

## ☁️ Deployment Targets

| Component          | Recommended Platform           |
| :----------------- | :----------------------------- |
| **Flask API**      | PythonAnywhere, Render, or AWS |
| **React Frontend** | Vercel or Netlify              |
| **Database/Auth**  | Supabase (Unified backend)     |

---

## 👤 Contact

**Kunal Mehra**

* **Affiliation:** IIT Delhi, Department of Textile Technology
* **Email:** [kunal.mehra191105@gmail.com](mailto:kunal.mehra191105@gmail.com)
* **Contact:** +91 9256473721
* **Date:** November 3, 2025

---


