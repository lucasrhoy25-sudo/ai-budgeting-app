from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import math

app = FastAPI(title="AI Budgeting App")
# Allow frontend (React) to communicate with backend
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://ai-budgeting-frontend.onrender.com",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- DATA MODELS ----------

class Transaction(BaseModel):
    id: Optional[int] = None
    date: date
    merchant: str
    amount: float
    category: Optional[str] = None  # Needs, Wants, Future You


class InsightRequest(BaseModel):
    income: float
    transactions: List[Transaction]
    budget_needs_pct: float = 0.5
    budget_wants_pct: float = 0.3
    budget_future_pct: float = 0.2


class BudgetSummary(BaseModel):
    month: str
    income: float
    needs_spent: float
    wants_spent: float
    future_spent: float


class InsightResponse(BaseModel):
    summary: BudgetSummary
    insights: List[str]


# ---------- SIMPLE CATEGORY RULES (FAKE "AI" FOR NOW) ----------

NEED_KEYWORDS = ["rent", "mortgage", "electric", "gas", "water", "grocery", "utilities", "insurance"]
FUTURE_KEYWORDS = ["roth", "ira", "401k", "investment", "savings", "extra payment"]


def simple_categorize(merchant: str) -> str:
    m = merchant.lower()
    if any(k in m for k in FUTURE_KEYWORDS):
        return "Future You"
    if any(k in m for k in NEED_KEYWORDS):
        return "Needs"
    return "Wants"


# ---------- ROUTES ----------

@app.get("/")
def read_root():
    return {"message": "AI Budgeting API is running!"}


@app.post("/transactions/categorize", response_model=List[Transaction])
def categorize_transactions(transactions: List[Transaction]):
    """
    Takes a list of transactions and fills in the 'category' field
    using simple keyword rules.
    """
    for t in transactions:
        if not t.category:
            t.category = simple_categorize(t.merchant)
    return transactions


@app.post("/insights", response_model=InsightResponse)
def generate_insights(data: InsightRequest):
    """
    Takes income + transactions and returns:
    - a simple summary of Needs/Wants/Future You spending
    - some human-readable insights
    """
    txns = data.transactions

    # Auto-categorize if missing
    for t in txns:
        if not t.category:
            t.category = simple_categorize(t.merchant)

    needs = sum(t.amount for t in txns if t.category == "Needs")
    wants = sum(t.amount for t in txns if t.category == "Wants")
    future = sum(t.amount for t in txns if t.category == "Future You")

    summary = BudgetSummary(
        month="Current Month",
        income=data.income,
        needs_spent=needs,
        wants_spent=wants,
        future_spent=future,
    )

    insights: List[str] = []

    # Targets based on 50/30/20 or custom percentages
    target_needs = data.income * data.budget_needs_pct
    target_wants = data.income * data.budget_wants_pct
    target_future = data.income * data.budget_future_pct

    # Needs
    if needs > target_needs:
        diff = needs - target_needs
        insights.append(
            f"Your Needs spending is about ${math.floor(diff)} above your target this month."
        )
    else:
        insights.append("Your Needs spending is within your target. Essentials are under control.")

    # Wants
    if wants > target_wants:
        diff = wants - target_wants
        insights.append(
            f"You're overspending on Wants by roughly ${math.floor(diff)}. "
            f"Cutting one or two habits could bring you back on track."
        )
    else:
        insights.append("Your Wants spending is reasonable. You're enjoying life without overdoing it.")

    # Future You
    if future < target_future:
        diff = target_future - future
        insights.append(
            f"You’re putting about ${math.floor(diff)} less toward Future You than your goal. "
            f"Even an extra $50–$100 a month could help you catch up."
        )
    else:
        insights.append("You’re meeting or beating your Future You goal. Keep that momentum going 💪")

    return InsightResponse(summary=summary, insights=insights)
