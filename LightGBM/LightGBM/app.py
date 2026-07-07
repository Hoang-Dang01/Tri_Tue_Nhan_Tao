import os
import sys
from pathlib import Path
from typing import Optional
from pydantic import BaseModel

# Ensure project root is on sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import pandas as pd
import numpy as np

from ai.predict import load_model, _META
from ai.feature_extractor import extract_features

app = FastAPI(title="Phân Tích URL Độc Hại")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request schema
class AnalyzeRequest(BaseModel):
    url: str
    threshold: Optional[float] = None
    include_page: Optional[bool] = None

@app.get("/")
async def read_index():
    index_path = BASE_DIR / "static" / "index.html"
    if not index_path.exists():
        raise HTTPException(status_code=404, detail="Frontend build missing. Please make sure static/index.html is created.")
    return FileResponse(index_path)

@app.post("/api/analyze")
async def analyze_url(req: AnalyzeRequest):
    try:
        url = req.url.strip()
        if not url:
            raise HTTPException(status_code=400, detail="URL cannot be empty")
        
        # Load the model (cached inside ai.predict)
        model = load_model()
        
        # Determine include_page default from model metadata if not provided
        include_page = req.include_page
        if include_page is None:
            include_page = bool(_META.get("include_page", False))
            
        # Extract features (once)
        feats = extract_features(url, include_page=include_page)
        feats_copy = feats.copy()  # Copy to return raw features to UI
        
        # Format for model prediction
        feats["url"] = url
        df = pd.DataFrame([feats])
        
        # Predict probability
        proba = model.predict_proba(df)[0]
        classes = list(getattr(model, "classes_", [0, 1]))
        malicious_label = int(os.getenv("AI_MALICIOUS_LABEL", _META.get("malicious_label", 0)))
        mal_idx = classes.index(malicious_label) if malicious_label in classes else 0
        prob = float(proba[mal_idx])
        
        # Determine decision threshold
        if req.threshold is not None:
            th = req.threshold
        elif "AI_THRESHOLD" in os.environ:
            th = float(os.environ["AI_THRESHOLD"])
        elif "best_threshold" in _META:
            th = float(_META["best_threshold"])
        else:
            th = 0.5
            
        is_malicious = prob >= th
        
        return {
            "url": url,
            "probability": round(prob, 6),
            "is_malicious": bool(is_malicious),
            "threshold": round(th, 6),
            "features": feats_copy,
            "include_page": include_page,
            "meta": {
                "best_cv_f1": _META.get("best_cv_f1"),
                "model_type": _META.get("model_type"),
            }
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# Mount static folder
static_dir = BASE_DIR / "static"
static_dir.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

if __name__ == "__main__":
    import uvicorn
    # Chỉ theo dõi thay đổi trong thư mục app (BASE_DIR) để tránh quét thư mục .git ở ngoài gây nặng CPU
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True, reload_dirs=[str(BASE_DIR)])
