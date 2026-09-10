## YOJANAX

**AI-Driven Scheme Matching for Marginalized Entrepreneurs**
*Smart India Hackathon — Problem Statement 26092*

YOJANAX is a multilingual web platform that helps Scheduled Caste (SC) beneficiaries discover the concessional credit and educational loan schemes they're eligible for, estimate financing costs, and locate the nearest authorized Channel Partner to apply through — replacing scattered, offline confusion with one guided digital flow.

---

## The Problem

The government offers concessional financial assistance to SC beneficiaries with an annual family income up to ₹5.00 Lakhs, covering up to 90% of project or education costs at interest rates as low as 6.5%–8% per annum. But:

- Applications can't be filed directly — they must go through a **Channel Finance System** of 100+ partners (SCAs, PSBs, RRBs, NBFC-MFIs).
- Citizens often don't know which scheme fits them — a Micro Finance Scheme (up to ₹1.40 lakh), a Term Loan (up to ₹50 lakh), or an Educational Loan.
- Finding a nearby partner that's actually equipped and eligible to process a given loan category is difficult.

The result: misrouted applications, offline confusion, and delayed disbursements.

## Our Solution

YOJANAX bridges beneficiaries and channelizing agencies with three core tools:

| Module | What it does |
|---|---|
| **Smart Scheme Recommender** | Takes basic inputs (project type, estimated cost, income level, education status) via a guided questionnaire and recommends the most suitable scheme(s), with a match score and reasoning. |
| **Financial Calculator** | Estimates EMIs based on scheme-specific loan limits, interest rates, and moratorium periods. |
| **Geo-Spatial Partner Locator** | Helps users find the nearest eligible Channel Partner based on location and category. |

Alongside these, an in-app assistant (**AASHA — AI-Assisted Scheme Help Agent**) answers quick questions about schemes, eligibility, partners, and the calculator directly in the UI.

## Features

- 🧭 **Guided questionnaire** — captures the applicant's profile (business/education need, cost, income, category) step by step
- 🎯 **Scheme recommendations** — ranked matches with a "why this may suit you" explanation for each
- 📄 **Scheme detail pages** — overview, benefits, eligibility, application process, and required documents per scheme
- 🧮 **EMI / financing calculator** — estimates repayment based on scheme terms
- 📍 **Nearby partner lookup** — locate Channel Partners near the applicant
- 🤖 **AASHA chatbot** — floating assistant for quick scheme/eligibility/partner questions, no external AI dependency
- 🌐 **Multilingual UI** — supports English, Hindi, Marathi, Bhojpuri, Tamil, Telugu, Malayalam, Gujarati, Odia, and Bengali
- 📊 **30-scheme dataset** — covers entrepreneurship, education, housing, health, and financial-inclusion schemes with ministry, benefits, and eligibility fields, sourced without invented eligibility criteria

## Tech Stack

- **Frontend:** React + Vite, Tailwind CSS
- **Backend:** REST API (Python/FastAPI-style) serving scheme, eligibility, calculator, and partner endpoints
- **Data:** Structured JSON dataset of 30 government schemes (id, name, ministry, benefits, eligibility, source link)

> Update this section with the exact versions/libraries your final `package.json` and backend `requirements.txt` use.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/schemes` | Returns all schemes in the dataset |
| `GET` | `/schemes/{scheme_id}` | Returns a single scheme by ID |
| `POST` | `/eligibility/check` | Checks a user's eligibility against a scheme's criteria |
| `POST` | `/calculator/calculate` | Calculates estimated EMI/financing figures |
| `GET` | `/partners` | Lists Channel Partners |
| `GET` | `/partners/{partner_id}` | Returns details for a single partner |

## Getting Started

### Frontend
```bash
cd YojanaX-1
npm install
npm run dev
```

### Backend
```bash
cd YojanaX-1
pip install -r requirements.txt
uvicorn main:app --reload
```

> Adjust folder names, install commands, and run commands to match your actual repo layout.

## Project Structure

```
yojanax/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Chatbot.jsx        # AASHA assistant widget
│   │   ├── pages/
│   │   │   ├── Questionnaire.jsx
│   │   │   ├── Recommendations.jsx
│   │   │   └── SchemeDetails.jsx
│   │   └── data/
│   │       └── indiaStatesDistricts.js
│   └── ...
├── backend/
│   ├── app/
│   │   ├── schemes_data.py        # loads ncsc_schemes.json
│   │   └── ncsc_schemes.json      # 30-scheme dataset
│   └── ...
└── README.md
```

## Impact Goals

- Improve financial literacy among SC beneficiaries about concessional lending options available to them
- Reduce misrouted applications by matching users to the correct scheme and correct partner upfront
- Improve transparency in the channel finance ecosystem and support faster disbursement

## Important Notes on Data Accuracy

Eligibility text in the scheme dataset is preserved exactly as extracted from official scheme sources — nothing is inferred or invented. Where a scheme's source material didn't state a concrete eligibility condition, that is marked explicitly (e.g. *"not specified in source"*) rather than filled in with an assumption. Users should always verify current eligibility and terms with the official scheme source or Channel Partner before applying.

## Team

> Hacksmith_
- Omkar Upadhyay
- Rehan Shikalgar
- Shambhavi Singh
- Rahul Maurya
- Isha Malapure
- Vanshika Singh
