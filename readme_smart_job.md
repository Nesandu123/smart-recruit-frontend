# Smart Job Matching Platform

**Final Year Research Project**  
**Project ID:** 25-26J-413

## 📋 Overview

The Smart Job Matching Platform is an intelligent, fully digital recruitment system designed to simplify and automate the hiring process for key professional roles such as Software Engineers, Project Managers, Accountants, and Merchandisers.

### Target Users
- Recruitment Companies
- Universities
- Software Companies
- HR Managers

## 👥 Group Members

| Member | Component |Student Registration Number|
|--------|-----------|---------------------------|
| **Neethila A.L.N.** | Automated Software Engineers Hiring Platform |IT22272454|
| **Darren V.C.** | Automated Project Managers Hiring Platform |IT2180096|
| **Eranda W.G.H.** | Automated Merchandisers Hiring Platform |IT22003782|
| **Kalhan A.H.L.** | Automated Accountants Hiring Platform |IT21314506|


---
## Neethila A.L.N  -  IT22272454 
## Automated Software Engineers Hiring Platform 

## Repository Links

- **Frontend:** [https://github.com/Nesandu123/fyp-frontend.git](https://github.com/Nesandu123/fyp-frontend.git)
- **Backend:** [https://github.com/Nesandu123/fyp-backend.git](https://github.com/Nesandu123/fyp-backend.git)

### Problem Statement

Traditional hiring methods for software engineers face several critical challenges:

- Manual code review is time-consuming and inconsistent
- Traditional procedures (interviews, resume reviews) fail to provide comprehensive skill assessments
- Technical and soft skills are evaluated separately, leading to incomplete candidate evaluations
- Coding proficiency requires multifaceted evaluation that's difficult to standardize
- Algorithmic knowledge gaps are hard to identify systematically
- Code quality metrics lack automated assessment tools
- Interview evaluation relies heavily on subjective human judgment

### Solution

Our platform provides a comprehensive automated solution through three core components:

#### 1. **Automated Analysis**
Analyzes GitHub repositories for algorithmic patterns and code quality metrics

#### 2. **Intelligent Questions**
Generates contextual interview questions based on detected algorithms

#### 3. **Evaluation Engine**
Scores answers using semantic similarity and ML-based assessment

### Key Features

- **Repository Analysis:** Clone and analyze Python algorithm repositories
- **Algorithm Detection:** ML model identifies 20+ algorithmic patterns
- **Quality Metrics:** Cyclomatic complexity, LOC, comment ratio analysis
- **Interview Questions:** Context-aware assessment (Easy/Medium/Hard)
- **Smart Evaluation:** Semantic similarity matching with feedback

### Analysis Pipeline

1. GitHub repository cloned with `--depth 1`
2. AST analysis extracts functions and code structure
3. CodeBERT generates semantic embeddings
4. Random Forest predicts algorithms with confidence
5. Generate interview questions and score answers

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 15
- **Library:** React + TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/UI components

### Backend
- **Framework:** FastAPI + Python 3.10
- **Validation:** Pydantic validation
- **Processing:** Async processing

### ML/AI
- **Transformers:** Hugging Face
- **Deep Learning:** PyTorch
- **Machine Learning:** Scikit-learn
- **NLP:** NLTK

---

## 🚀 Installation

### Frontend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Nesandu123/fyp-frontend.git
cd fyp-frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Run local development server**
```bash
npm run dev
# or
yarn dev
```

4. **Open your browser**
Navigate to: [http://localhost:3000](http://localhost:3000)

#### Build & Production

**Build the production version:**
```bash
npm run build
```

**Start the production server:**
```bash
npm start
```

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Nesandu123/fyp-backend.git
cd fyp-backend
```

2. **Create virtual environment**
```bash
python -m venv venv
```

3. **Activate virtual environment**

**Windows:**
```bash
venv\Scripts\activate
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

4. **Install dependencies**
```bash
pip install -r requirements.txt
```

5. **Run the backend server**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📁 Project Structure

### Frontend
```
fyp-frontend/
├── app/                    # Next.js app router
├── components/             # Reusable components
│   └── ui/                # Shared UI elements
├── lib/                   # Utility & helper functions
├── public/                # Static assets
├── styles/                # Global styles
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

### Backend
```
fyp-backend/
├── app/
│   ├── main.py           # Application entry point
│   ├── api/              # API routes
│   ├── models/           # Database models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── core/             # Config & security
├── venv/                 # Virtual environment
├── requirements.txt
└── README.md
```

---

## 📄 License

This project is developed for research purposes only.

---

## 📧 Contact

For questions or collaboration opportunities, please reach out to the project team members.

---

**Note:** This is a Final Year Research Project (2025-2026) developed as part of academic requirements.