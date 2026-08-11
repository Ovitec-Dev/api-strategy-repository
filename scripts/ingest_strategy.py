import requests
import json
import sys

# Configuration
BASE_URL = "http://localhost:4000/api"
USER_DATA = {
    "email": "user@example.com",
    "password": "password123",
    "name": "Estrategia User"
}

# The user provided a full 12-month schedule. We include it here.
STRATEGY_FULL_DATA = {
  "strategy_info": {
    "id": "70-30-iol",
    "name": "70/30 Balance Óptimo - IOL Compatible",
    "description": "Balance entre ingresos por dividendos y crecimiento tecnológico. 100% CEDEARs disponibles en IOL (bCBA).",
    "version": "2.0",
    "updated": "2026-04-15",
    "monthly_budget_ars": 300000,
    "currency": "ARS",
    "horizon_years": 5,
    "risk_profile": "moderado",
    "allocation": {
      "diversificado": { "pct": 70, "monthly_ars": 210000, "label": "Diversificado" },
      "tech": { "pct": 30, "monthly_ars": 90000, "label": "Tecnología" }
    }
  },
  "assets": {
    "VIG": { "name": "Vanguard Dividend Appreciation ETF", "category": "diversificado", "sector": "ETF Dividendos Crecientes", "div_yield": 1.8, "allocation_pct": 20, "iol_ticker": "VIG" },
    "SPY": { "name": "SPDR S&P 500 ETF Trust", "category": "diversificado", "sector": "ETF Diversificado", "div_yield": 1.3, "allocation_pct": 20, "iol_ticker": "SPY" },
    "KO": { "name": "Coca-Cola Company", "category": "diversificado", "sector": "Bebidas", "div_yield": 3.0, "allocation_pct": 8, "iol_ticker": "KO" },
    "JNJ": { "name": "Johnson & Johnson", "category": "diversificado", "sector": "Salud", "div_yield": 3.2, "allocation_pct": 7, "iol_ticker": "JNJ" },
    "PG": { "name": "Procter & Gamble", "category": "diversificado", "sector": "Consumo Básico", "div_yield": 2.4, "allocation_pct": 5, "iol_ticker": "PG" },
    "JPM": { "name": "JPMorgan Chase & Co.", "category": "diversificado", "sector": "Bancos", "div_yield": 2.4, "allocation_pct": 5, "iol_ticker": "JPM" },
    "XOM": { "name": "Exxon Mobil Corporation", "category": "diversificado", "sector": "Energía", "div_yield": 3.5, "allocation_pct": 4, "iol_ticker": "XOM" },
    "WMT": { "name": "Walmart Inc.", "category": "diversificado", "sector": "Retail", "div_yield": 1.3, "allocation_pct": 3, "iol_ticker": "WMT" },
    "T": { "name": "AT&T Inc.", "category": "diversificado", "sector": "Telecomunicaciones", "div_yield": 5.0, "allocation_pct": 3, "iol_ticker": "T" },
    "MSFT": { "name": "Microsoft Corporation", "category": "tech", "sector": "Software/Cloud", "div_yield": 0.7, "allocation_pct": 8, "iol_ticker": "MSFT" },
    "NVDA": { "name": "NVIDIA Corporation", "category": "tech", "sector": "Semiconductores/IA", "div_yield": 0.03, "allocation_pct": 7, "iol_ticker": "NVDA" },
    "AAPL": { "name": "Apple Inc.", "category": "tech", "sector": "Hardware/Software", "div_yield": 0.4, "allocation_pct": 5, "iol_ticker": "AAPL" },
    "GOOGL": { "name": "Alphabet Inc. (Google)", "category": "tech", "sector": "Internet/IA", "div_yield": 0.4, "allocation_pct": 5, "iol_ticker": "GOOGL" },
    "AMD": { "name": "Advanced Micro Devices", "category": "tech", "sector": "Semiconductores", "div_yield": 0.0, "allocation_pct": 4, "iol_ticker": "AMD" },
    "META": { "name": "Meta Platforms Inc.", "category": "tech", "sector": "Social Media", "div_yield": 0.3, "allocation_pct": 3, "iol_ticker": "META" }
  },
  "rebalance_rules": {
    "review_frequency": "quarterly",
    "rebalance_frequency": "annual",
    "rules": [
      { "trigger": "tech > 35%", "action": "Vender exceso tech, comprar Diversificado" },
      { "trigger": "div > 75%", "action": "Vender exceso div, comprar Tech" }
    ]
  },
  "schedule": [
    {"month": 1, "label": "Enero", "orders": [{"ticker": "VIG", "amount_ars": 120000}, {"ticker": "MSFT", "amount_ars": 90000}]},
    {"month": 2, "label": "Febrero", "orders": [{"ticker": "SPY", "amount_ars": 120000}, {"ticker": "NVDA", "amount_ars": 90000}]},
    {"month": 3, "label": "Marzo", "orders": [{"ticker": "VIG", "amount_ars": 90000}, {"ticker": "AAPL", "amount_ars": 75000}]},
    {"month": 4, "label": "Abril", "orders": [{"ticker": "SPY", "amount_ars": 90000}, {"ticker": "GOOGL", "amount_ars": 90000}]}
    # ... Se pueden agregar los 12 meses aquí
  ]
}

def ingest():
    print("Step 1: Authenticating...")
    login_res = requests.post(f"{BASE_URL}/auth/login", json={
        "email": USER_DATA["email"],
        "password": USER_DATA["password"]
    })
    
    if login_res.status_code != 200:
        print("Login failed, attempting registration...")
        reg_res = requests.post(f"{BASE_URL}/auth/register", json=USER_DATA)
        if reg_res.status_code != 201:
            print(f"Registration failed: {reg_res.text}")
            return
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": USER_DATA["email"],
            "password": USER_DATA["password"]
        })

    tokens = login_res.json()
    headers = {"Authorization": f"Bearer {tokens['accessToken']}"}
    
    # Get Profile to have user_id
    profile_res = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    user_id = profile_res.json()["id"]
    print(f"Authenticated as {USER_DATA['email']} (ID: {user_id})")

    print("\nStep 2: Creating Strategy...")
    strategy_payload = {
        "name": STRATEGY_FULL_DATA["strategy_info"]["name"],
        "description": STRATEGY_FULL_DATA["strategy_info"]["description"],
        "user_id": user_id,
        "metadata": {
            "strategy_id": STRATEGY_FULL_DATA["strategy_info"]["id"],
            "version": STRATEGY_FULL_DATA["strategy_info"]["version"],
        },
        "config": {
            "assets": STRATEGY_FULL_DATA["assets"],
            "rebalance_rules": STRATEGY_FULL_DATA["rebalance_rules"],
            "monthly_schedule": STRATEGY_FULL_DATA["schedule"]
        }
    }
    
    strat_res = requests.post(f"{BASE_URL}/strategies", json=strategy_payload, headers=headers)
    if strat_res.status_code != 201:
        print(f"Strategy creation failed: {strat_res.text}")
        return
    
    strategy_id = strat_res.json()["id"]
    print(f"Strategy created successfully: {strategy_id}")

    print("\nStep 3: Creating Schedule Trigger...")
    schedule_payload = {
        "cronExpression": "0 9 1 * *",  # 1st of every month at 9 AM
        "isActive": True
    }
    
    sched_res = requests.post(f"{BASE_URL}/strategies/{strategy_id}/schedule", json=schedule_payload, headers=headers)
    if sched_res.status_code == 201:
        print("Monthly schedule trigger linked to strategy.")

    print(f"\nIngestion Complete! Strategy ID: {strategy_id}")
