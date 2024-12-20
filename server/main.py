from fastapi import FastAPI, File, UploadFile
from tensorflow import load_model

app = FastAPI()

MODEL_PATH = "plant_disease_model.h5"  # Path to your saved model
model = load_model(MODEL_PATH)

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

@app.get("/predict")
def predict_disease(image_path: str):
    # Simulate prediction (replace with your actual prediction logic)
    return {"disease": "Powdery Mildew"}