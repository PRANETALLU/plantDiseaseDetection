from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
from PIL import Image
import io
import base64
from fastapi.middleware.cors import CORSMiddleware
import os
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected request body using Pydantic
class ImageRequest(BaseModel):
    image_uri: str  # Base64-encoded image string

class ChatRequest(BaseModel):
    query: str  # User's query for chat

# Load your plant disease model
MODEL_PATH = "plant_disease_model.h5"
model = load_model(MODEL_PATH, compile=False)

# Target size for model input
IMG_SIZE = (224, 224)

# Class labels mapping for plant disease prediction
index_to_label = {
    0: 'Bacterial_Disease',
    1: 'Environmental_Stress',
    2: 'Fungal_Disease',
    3: 'Healthy',
    4: 'Viral_Disease',
}

# Load the Hugging Face model
HF_MODEL_NAME = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(HF_MODEL_NAME)
chat_model = AutoModelForCausalLM.from_pretrained(HF_MODEL_NAME)

def decode_base64_image(base64_string: str) -> Image:
    """
    Decode a base64 image string into a PIL Image object.
    """
    try:
        # Remove "data:image/jpeg;base64," if present
        base64_string = base64_string.split(",")[-1]
        img_data = base64.b64decode(base64_string)
        img = Image.open(io.BytesIO(img_data))
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error decoding image: {e}")

@app.post("/predict/")
async def predict_disease(request: ImageRequest):
    """
    Predict plant disease from a base64-encoded image URI.
    """
    try:
        # Decode the base64 image
        img = decode_base64_image(request.image_uri)
        
        # Preprocess the image
        img = img.resize(IMG_SIZE)
        img_array = image.img_to_array(img) / 255.0  # Normalize
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

        # Perform prediction
        predictions = model.predict(img_array)
        predicted_class_index = np.argmax(predictions)
        confidence = float(predictions[0][predicted_class_index])

        # Get the predicted class label
        predicted_class_label = index_to_label[predicted_class_index]

        return {"predicted_class": predicted_class_label, "confidence": confidence}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

@app.post("/chat/")
async def chat(request: ChatRequest):
    """
    Provide crop care tips and disease information based on user input using Hugging Face.
    """
    try:
        user_query = request.query

        # Tokenize user input
        input_ids = tokenizer.encode(user_query, return_tensors="pt")  # PyTorch tensor

        # Generate a response
        output = chat_model.generate(
            input_ids,
            max_length=150,
            num_return_sequences=1,
            no_repeat_ngram_size=2,
            temperature=0.7,
            top_p=0.9,
        )

        # Decode the response
        response_text = tokenizer.decode(output[0], skip_special_tokens=True)

        return {"response": response_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing query: {e}")