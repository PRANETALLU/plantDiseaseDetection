from fastapi import FastAPI, File, UploadFile

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!"}

@app.get("/predict")
def predict_disease(image_path: str):
    # Simulate prediction (replace with your actual prediction logic)
    return {"disease": "Powdery Mildew"}