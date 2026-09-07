# backend/app/eligibility_engine/rules.py


# ============================================================
# GLOBAL ELIGIBILITY RULES
# ============================================================

SC_REQUIRED = True

ANNUAL_FAMILY_INCOME_MAX_INR = 500_000


# ============================================================
# PROJECT COST RULES
# ============================================================

PROJECT_COST_RULES = {
    "MFS": {
        "min_inr": 0,
        "max_inr": 140_000,
    },

    "AMY": {
        "min_inr": 0,
        "max_inr": 140_000,
    },

    "TERM_LOAN": {
        "min_inr_exclusive": 140_000,
        "max_inr": 5_000_000,
    },

    "UNY": {
        "min_inr": 0,
        "max_inr": 500_000,
    },
}


# ============================================================
# CHANNEL PARTNER RULES
# ============================================================

CHANNEL_PARTNER_RULES = {
    "MFS": {
        "allowed_partner_types": [],
    },

    "AMY": {
        "allowed_partner_types": [
            "NBFC-MFI",
        ],
    },

    "TERM_LOAN": {
        "allowed_partner_types": [],
    },

    "UNY": {
        "allowed_partner_types": [
            "Co-operative Bank",
            "Cooperative Society",
            "Small Finance Bank",
        ],
    },
}


# ============================================================
# INTEREST RATE RULES
# ============================================================

INTEREST_RATE_RULES = {
    "MFS": {
        "type": "fixed",
        "rate_percent": 6.5,
    },

    "AMY": {
        "type": "fixed",
        "rate_percent": 15.0,
    },

    "TERM_LOAN": {
        "type": "fixed",
        "rate_percent": 8.0,
    },

    "UNY": {
        "type": "partner_dependent",
        "rates": {
            "Co-operative Bank": 13.0,
            "Cooperative Society": 13.0,
            "Small Finance Bank": 15.0,
        },
    },
}


# ============================================================
# LOAN AMOUNT RULES
# ============================================================

LOAN_AMOUNT_RULES = {
    "MFS": {
        "percentage_of_project_cost": 90,
        "maximum_loan_inr": 125_000,
    },

    "AMY": {
        "percentage_of_project_cost": 90,
        "maximum_loan_inr": 125_000,
    },

    "TERM_LOAN": {
        "percentage_of_project_cost": 90,
        "maximum_loan_inr": 4_500_000,
    },

    "UNY": {
        "maximum_loan_inr": 450_000,
    },
}


# ============================================================
# REPAYMENT RULES
# ============================================================

REPAYMENT_RULES = {
    "MFS": {
        "period_years": 3,
        "moratorium_months": 3,
        "installment_frequency": "quarterly",
    },

    "AMY": {
        "period_years": 3,
        "moratorium_months": 3,
        "installment_frequency": "quarterly",
    },

    "TERM_LOAN": {
        "period_years": 7,
        "moratorium_months": 6,
        "special_moratorium": {
            "plantation": 12,
            "construction": 12,
        },
        "installment_frequency": "quarterly",
    },

    "UNY": {
        "period_years": 5,
        "moratorium_months": 3,
        "installment_frequency": [
            "quarterly",
            "half-yearly",
        ],
    },
}


# ============================================================
# APPLICATION RULES
# ============================================================

APPLICATION_RULES = {
    "MFS": {
        "direct_nsfdc_application": False,
        "channel_partner_required": True,
    },

    "AMY": {
        "direct_nsfdc_application": False,
        "channel_partner_required": True,
    },

    "TERM_LOAN": {
        "direct_nsfdc_application": False,
        "channel_partner_required": True,
    },

    "UNY": {
        "direct_nsfdc_application": False,
        "channel_partner_required": True,
    },
}


# ============================================================
# GETTER FUNCTIONS
# ============================================================

def get_project_cost_rules(scheme_id):
    return PROJECT_COST_RULES.get(scheme_id, {})


def get_channel_partner_rules(scheme_id):
    return CHANNEL_PARTNER_RULES.get(
        scheme_id,
        {
            "allowed_partner_types": [],
        },
    )


def get_interest_rate_rules(scheme_id):
    return INTEREST_RATE_RULES.get(scheme_id, {})


def get_loan_amount_rules(scheme_id):
    return LOAN_AMOUNT_RULES.get(scheme_id, {})


def get_repayment_rules(scheme_id):
    return REPAYMENT_RULES.get(scheme_id, {})


def get_application_rules(scheme_id):
    return APPLICATION_RULES.get(
        scheme_id,
        {
            "direct_nsfdc_application": False,
            "channel_partner_required": True,
        },
    )