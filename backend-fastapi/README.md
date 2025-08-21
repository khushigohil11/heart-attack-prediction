
# Backend (FastAPI)

## Quick start
1) Put your trained model file `heart_attack_risk_model.pkl` in this folder (same level as `main.py`).

2) Create a virtualenv and install dependencies:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
```

3) Run the API:
```bash
uvicorn main:app --reload --port 8000
```

4) Test:
- Health check: http://127.0.0.1:8000/health
- Predict: POST http://127.0.0.1:8000/predict
