#!/usr/bin/env python3
"""
TD Bank PDF Parser
Processes a TD Bank PDF statement and returns transaction data as JSON.
"""

import sys
import os
import json
import re
import argparse

# Import pdfplumber for PDF text extraction
try:
    import pdfplumber
except ImportError:
    print("Required library not found. Please install with:", file=sys.stderr)
    print("pip install pdfplumber", file=sys.stderr)
    sys.exit(1)

# Categorization dictionary - same as WellsFargo parser for consistency
finance_categories = {
    "E-Commerce": ["Amazon","AMZN", "eBay", "Alibaba", "Temu", "Wayfair", "Etsy", "Walmart Online", "Best Buy Online", "Target Online"],
    "Subscriptions & Streaming": ["Blizzard","CLOUDFLARE","Netflix", "Hulu", "Disney+", "HBO Max", "Spotify", "Apple Music", "Apple", "YouTube Premium", "Youtubepre", "Audible", "Amazon Prime", "PlayStation Plus", "Xbox Game Pass", "Adobe", "Dropbox", "Google One", "iCloud"],
    "Groceries": ["SHOPRITE","Walmart", "WAL-MART", "Kroger", "Safeway", "Whole Foods", "Aldi", "Trader Joe's", "Publix", "Costco", "Sam's Club", "Lidl"],
    "Restaurants & Fast Food": ["DOORDASH","FOODA","McDonald's", "Burger King", "Subway", "Chipotle", "Starbucks", "Dunkin", "KFC", "Taco Bell", "Domino's", "Chick-fil-A", "Pizza Hut", "Popeyes", "Wendy's", "WENDYS", "Five Guys", "HIBACHI", "Grill"],
    "Utilities": ["Duke Energy", "Con Edison", "PG&E", "National Grid", "Xfinity", "Spectrum", "Verizon", "AT&T", "T-Mobile", "Cox Communications"],
    "Travel & Transportation": ["Uber", "Mta", "njt", "Lyft", "Delta Airlines", "United Airlines", "American Airlines", "Expedia", "Airbnb", "Booking.com", "Marriott", "Hilton", "Hertz", "Enterprise Rent-A-Car", "Amtrak", "Greyhound"],
    "Entertainment & Recreation": ["DICE","AMC","BAR","Steam", "YESTERCADES", "Dave & buster's","Regal Cinemas", "AMC Theatres", "Bowlero", "Dave & Buster's", "Escape Rooms", "Concert Tickets", "Eventbrite", "StubHub", "Sports Tickets"],
    "Health & Fitness": ["CVS", "Walgreens", "GNC", "Vitamin Shoppe", "Peloton", "Planet Fitness", "LA Fitness", "24 Hour Fitness", "Equinox", "Anytime Fitness", "MyFitnessPal", "Fitbit"],
    "Retail & Clothing": ["Nike", "Adidas", "Zara", "H&M", "Nordstrom", "Macy's", "Bloomingdale's", "Urban Outfitters", "Uniqlo", "Old Navy", "Banana Republic", "Gap", "Foot Locker","UNIQUE"],
    "Automotive & Gas": ["Ezpass","MOTOR VEHICLE","Shell", "Chevron", "ExxonMobil", "BP", "Tesla Supercharger", "AutoZone", "O'Reilly Auto Parts", "Pep Boys", "CarMax", "Toyota Service", "ROCKAUTO"],
    "Education & Learning": ["Udemy", "Coursera", "Skillshare", "LinkedIn Learning", "MasterClass", "Khan Academy", "Duolingo", "Quizlet", "Pearson", "Chegg", "COMPTIA", "University"],
    "Home Improvement": ["Home Depot", "Lowe's", "Ace Hardware", "Menards", "IKEA", "Overstock"],
    "Insurance": ["Geico", "Progressive", "State Farm", "Allstate", "Liberty Mutual", "Nationwide", "USAA", "MetLife"],
    "Charity & Donations": ["Red Cross", "GoFundMe", "UNICEF", "Feeding America", "Salvation Army", "WWF", "Charity: Water"],
    "Financial Services & Banks": ["ATM","Capital One","Vanguard","Acorns","Bank of America", "Chase", "Wells Fargo", "Citibank", "PayPal", "Venmo", "Cash App", "Western Union", "Robinhood", "E-Trade", "Fidelity", "Charles Schwab", "Zelle"],
    "Other": ["Post Office", "USPS", "FedEx", "UPS", "MoneyGram"]
}

def parse_arguments():
    parser = argparse.ArgumentParser(description="Parse TD Bank statement")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    return parser.parse_args()

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdfplumber"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:  # Only add if not None
                    text += extracted
            return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def categorize_transaction(description):
    """Categorize a transaction based on the description"""
    desc_lower = description.lower()
    for category, keywords in finance_categories.items():
        if any(keyword.lower() in desc_lower for keyword in keywords):
            return category
    return "Other"  # Default to "Other" if no match

def parse_transactions(text):
    """Parse transactions from TD Bank statement text"""
    # TD Bank format typically has date, description, and amount in columns
    # This pattern matches TD Bank format: date, description, debit or credit amount
    pattern = r"(\d{2}/\d{2}/\d{2,4})\s+(.+?)\s+([-+]?\$[\d,]+\.\d{2})"
    transactions = re.findall(pattern, text, re.MULTILINE)

    parsed_transactions = []
    for t in transactions:
        # Skip headers or invalid entries
        if "BEGINNING BALANCE" in t[1].upper() or "ENDING BALANCE" in t[1].upper():
            continue

        # Process the amount
        amount_str = t[2].replace("$", "").replace(",", "")
        amount = float(amount_str)

        # Determine transaction type (credit or debit)
        # For TD Bank, debits are typically positive values in the debit column
        transaction_type = "debit"
        if amount < 0:
            # If amount is negative in TD Bank format, it might be a credit
            amount = abs(amount)
            transaction_type = "credit"
        elif "DEPOSIT" in t[1].upper() or "TRANSFER FROM" in t[1].upper() or "DIRECT DEPOSIT" in t[1].upper():
            transaction_type = "credit"

        description = t[1].strip()

        parsed_transactions.append({
            "date": t[0],  # Format: MM/DD/YYYY
            "description": description,
            "amount": amount,
            "type": transaction_type,
            "category": categorize_transaction(description)
        })

    return parsed_transactions

def main():
    args = parse_arguments()

    # Extract text from PDF
    print(f"Processing TD Bank statement: {args.pdf_path}", file=sys.stderr)
    pdf_text = extract_text_from_pdf(args.pdf_path)

    if not pdf_text.strip():
        print("Failed to extract text from PDF", file=sys.stderr)
        sys.exit(1)

    # After extracting text from PDF
    print(f"Extracted text sample: {pdf_text[:500]}", file=sys.stderr)  # Show first 500 chars

    # Parse and categorize transactions
    transactions = parse_transactions(pdf_text)
    print(f"Found {len(transactions)} transactions", file=sys.stderr)

    # After parsing transactions
    if len(transactions) == 0:
        print("WARNING: No transactions found. Check regex pattern.", file=sys.stderr)

    # Separate debits and credits
    debits = [t for t in transactions if t["type"] == "debit"]
    credits = [t for t in transactions if t["type"] == "credit"]

    # Calculate total amounts
    total_debits = sum(t["amount"] for t in debits)
    total_credits = sum(t["amount"] for t in credits)

    # Create category breakdown for debits (expenses)
    category_breakdown = {}
    for t in debits:
        category = t["category"]
        if category not in category_breakdown:
            category_breakdown[category] = 0
        category_breakdown[category] += t["amount"]

    # Create result object
    result = {
        "transactions": transactions,
        "summary": {
            "totalTransactions": len(transactions),
            "totalDebits": total_debits,
            "totalCredits": total_credits,
            "netChange": total_credits - total_debits
        },
        "categoryBreakdown": category_breakdown,
        "bankIdentifier": "TD Bank"  # Add bank identifier to the output
    }

    # Output JSON result to stdout for Node.js to capture
    print(json.dumps(result))

    return 0

if __name__ == "__main__":
    sys.exit(main())