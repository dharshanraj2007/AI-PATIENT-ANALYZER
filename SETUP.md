# AI-PATIENT-ANALYZER Setup Guide

## 🚀 Quick Start for Team Members

### Prerequisites
- Python 3.8+
- Git

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd AI-PATIENT-ANALYZER
```

### 2️⃣ Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys
# Windows: notepad .env
# Mac/Linux: nano .env
```

**Required API Keys:**
- **GROQ_API_KEY**: Get free API key from https://console.groq.com/keys
  - Sign up for free account
  - Generate API key
  - Paste into `.env` file

**Your `.env` file should look like:**
```
GROQ_API_KEY=gsk_your_actual_groq_key_here
```

#### Train the ML Model
```bash
python train_model.py
```

This will:
- Generate synthetic patient data (18,000 records)
- Train the ML triage model
- Save model artifacts to `models/` directory
- Display accuracy metrics

#### Start the Backend Server
```bash
python app.py
```

Server will run on: http://localhost:5000

---

### 3️⃣ Frontend Setup

The frontend is static HTML/JS and served by Flask.

**Access the application:**
```
http://localhost:5000
```

---

## 🎯 Features

### 1. **ML-Based Triage System**
- Endpoint: `POST /api/predict`
- Predicts patient risk level (Low/Medium/High)
- Recommends appropriate department
- 95.3% accuracy

### 2. **AI-Powered EHR Summarization** (NEW!)
- Endpoint: `POST /api/summarize-ehr`
- Upload PDF medical records
- Groq AI (Llama 3.3) extracts structured data
- Auto-fills patient assessment form
- Displays summary in Analytics page

### 3. **Dashboard Analytics**
- Real-time statistics
- Risk distribution charts
- Feature importance visualization

---

## 🔑 API Key Management

### Getting Your Own Groq API Key

1. Visit: https://console.groq.com/keys
2. Sign up (free tier available)
3. Click "Create API Key"
4. Copy the key (starts with `gsk_`)
5. Paste into `backend/.env`:
   ```
   GROQ_API_KEY=gsk_your_key_here
   ```

**Important:**
- ✅ Never commit `.env` to Git
- ✅ Each team member uses their own API key
- ✅ Free tier includes generous usage limits

---

## 🧪 Testing

### Test ML Prediction
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "age": 45,
    "heart_rate": 95,
    "systolic_blood_pressure": 145,
    "oxygen_saturation": 96,
    "body_temperature": 37.2,
    "pain_level": 6,
    "chronic_disease_count": 2,
    "previous_er_visits": 1,
    "arrival_mode": "ambulance"
  }'
```

### Test EHR Summarization
```bash
python test_ehr_endpoint.py
```

This will:
- Create a sample EHR PDF
- Send to `/api/summarize-ehr`
- Display extracted medical data

---

## 📁 Project Structure

```
AI-PATIENT-ANALYZER/
├── backend/
│   ├── app.py                          # Flask server
│   ├── train_model.py                  # ML model training
│   ├── requirements.txt                # Python dependencies
│   ├── .env.example                    # Environment template
│   ├── .env                            # Your API keys (gitignored)
│   ├── models/
│   │   └── triage_model.pkl           # Trained ML model
│   └── services/
│       └── pdf_module/
│           ├── groq_summarizer.py     # Groq AI integration
│           └── pdf_extractor.py       # PDF text extraction
├── frontend/
│   ├── index.html                      # Main UI
│   ├── app.js                          # Frontend logic
│   └── style.css                       # Styling
├── test_ehr_endpoint.py               # EHR testing script
└── SETUP.md                            # This file
```

---

## 🐛 Troubleshooting

### "No module named 'groq'"
```bash
pip install groq
```

### "GROQ_API_KEY not found"
- Ensure `.env` file exists in `backend/` directory
- Check that `GROQ_API_KEY=...` is set correctly
- No quotes needed around the key value

### "Model file not found"
```bash
cd backend
python train_model.py
```

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <pid> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🎓 How It Works

### Architecture

```
┌─────────────┐
│   Frontend  │  (HTML/JS)
│  localhost  │
└──────┬──────┘
       │
       ├─────────────────────────────────┐
       │                                 │
       ▼                                 ▼
┌─────────────────┐           ┌──────────────────┐
│  ML Prediction  │           │  EHR Summary     │
│  /api/predict   │           │  /api/summarize  │
└────────┬────────┘           └────────┬─────────┘
         │                             │
         ▼                             ▼
┌─────────────────┐           ┌──────────────────┐
│ VotingClassifier│           │   Groq API       │
│ (GBM + RF)      │           │  (Llama 3.3)     │
│ 95.3% Accuracy  │           │  PDF → JSON      │
└─────────────────┘           └──────────────────┘
```

### Data Flow

1. **Patient Assessment**
   - User fills form OR uploads EHR PDF
   - If PDF: Groq extracts data → auto-fills form
   - Click "Run AI Assessment"
   - ML model predicts risk level
   - Results displayed with explanations

2. **EHR Summarization**
   - Upload PDF → `/api/summarize-ehr`
   - Groq AI extracts structured data
   - Form auto-fills with patient vitals
   - Summary displayed in Analytics tab

---

## 📊 System Requirements

- **Python**: 3.8+
- **RAM**: 2GB minimum
- **Disk**: 500MB for dependencies + models
- **Internet**: Required for Groq API calls

---

## 🔒 Security Notes

- `.env` file is gitignored (never committed)
- Each developer uses their own API keys
- API keys stored locally only
- No hardcoded credentials in code

---

## 📞 Support

If you encounter issues:
1. Check this SETUP.md
2. Review error messages in terminal
3. Ensure all dependencies installed
4. Verify API key is valid

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Backend server starts without errors
- [ ] Frontend loads at http://localhost:5000
- [ ] Dashboard shows statistics
- [ ] ML prediction works (sample data button)
- [ ] EHR upload accepts PDF files
- [ ] Summary displays in Analytics tab

---

**Ready to go! 🚀**
