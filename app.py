from flask import Flask, request, jsonify
from PIL import Image
from io import BytesIO
from transformers import AutoProcessor, AutoModelForVision2Seq
import numpy as np
import cv2
from sklearn.cluster import KMeans
from flask_cors import CORS



# Load the model and processor
try:
    processor = AutoProcessor.from_pretrained("0x-Jayveersinh-Raj/fabric_classifier")
    model = AutoModelForVision2Seq.from_pretrained("0x-Jayveersinh-Raj/fabric_classifier")
    model_loaded = True
except Exception as e:
    print(f"Error loading model: {e}")
    model_loaded = False

app = Flask(__name__)
CORS(app)  

def extract_dominant_colors(image, n_colors=3):
    """Extracts dominant colors using KMeans clustering."""
    # Convert PIL image to OpenCV format
    img = np.array(image)
    if img.ndim == 2:  # grayscale
        img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
    else:
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
    
    # Resize to speed up clustering
    img = cv2.resize(img, (150, 150), interpolation=cv2.INTER_AREA)
    
    # Reshape and cluster
    img_data = img.reshape((-1, 3))
    kmeans = KMeans(n_clusters=n_colors, random_state=42, n_init=10)
    kmeans.fit(img_data)
    
    # Sort colors by frequency
    unique, counts = np.unique(kmeans.labels_, return_counts=True)
    sorted_idx = np.argsort(-counts)
    dominant_colors = [kmeans.cluster_centers_[i] for i in sorted_idx]
    
    # Convert to hex
    hex_colors = ['#%02x%02x%02x' % tuple(map(int, color)) for color in dominant_colors]
    return hex_colors

@app.route('/upload', methods=['POST'])
def upload_image():
    if not model_loaded:
        return jsonify({"error": "Model not loaded. Please check the server logs."}), 500

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    image_file = request.files['image']
    try:
        # Read the content of the image file
        image_bytes = BytesIO(image_file.read())
        image = Image.open(image_bytes).convert("RGB")

        # Run HuggingFace model for fabric classification
        inputs = processor(images=image, return_tensors="pt")
        generated_ids = model.generate(**inputs, max_length=20)
        generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

        # Extract dominant colors
        colors = extract_dominant_colors(image, n_colors=3)

        response = {
            "fabric_type": generated_text,
            "dominant_colors": colors
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": f"Error processing image: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True)
