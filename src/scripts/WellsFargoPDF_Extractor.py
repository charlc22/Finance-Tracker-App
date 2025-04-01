import pdfplumber
import re
import os
import pandas as pd
import sys

# Categorization dictionary
finance_categories = {
    "E-Commerce": ["Amazon","AMZN", "eBay", "Alibaba", "Temu", "Wayfair", "Etsy", "Walmart Online", "Best Buy Online", "Target Online"],
    "Subscriptions & Streaming": ["Blizzard","CLOUDFLARE","Netflix", "Hulu", "Disney+", "HBO Max", "Spotify", "Apple Music", "Apple", "YouTube Premium", "Youtubepre", "Audible", "Amazon Prime", "PlayStation Plus", "Xbox Game Pass", "Adobe", "Dropbox", "Google One", "iCloud"],
    "Groceries": ["SHOPRITE","Walmart", "WAL-MART", "Kroger", "Safeway", "Whole Foods", "Aldi", "Trader Joe’s", "Publix", "Costco", "Sam’s Club", "Lidl"],
    "Restaurants & Fast Food": ["DOORDASH","FOODA","McDonald's", "Burger King", "Subway", "Chipotle", "Starbucks", "Dunkin", "KFC", "Taco Bell", "Domino’s", "Chick-fil-A", "Pizza Hut", "Popeyes", "Wendy's", "WENDYS", "Five Guys", "HIBACHI", "Grill"],
    "Utilities": ["Duke Energy", "Con Edison", "PG&E", "National Grid", "Xfinity", "Spectrum", "Verizon", "AT&T", "T-Mobile", "Cox Communications"],
    "Travel & Transportation": ["Uber", "Mta", "njt", "Lyft", "Delta Airlines", "United Airlines", "American Airlines", "Expedia", "Airbnb", "Booking.com", "Marriott", "Hilton", "Hertz", "Enterprise Rent-A-Car", "Amtrak", "Greyhound"],
    "Entertainment & Recreation": ["DICE","AMC","BAR","Steam", "YESTERCADES", "Dave & buster's","Regal Cinemas", "AMC Theatres", "Bowlero", "Dave & Buster’s", "Escape Rooms", "Concert Tickets", "Eventbrite", "StubHub", "Sports Tickets"],
    "Health & Fitness": ["CVS", "Walgreens", "GNC", "Vitamin Shoppe", "Peloton", "Planet Fitness", "LA Fitness", "24 Hour Fitness", "Equinox", "Anytime Fitness", "MyFitnessPal", "Fitbit"],
    "Retail & Clothing": ["Nike", "Adidas", "Zara", "H&M", "Nordstrom", "Macy’s", "Bloomingdale’s", "Urban Outfitters", "Uniqlo", "Old Navy", "Banana Republic", "Gap", "Foot Locker","UNIQUE"],
    "Automotive & Gas": ["Ezpass","MOTOR VEHICLE","Shell", "Chevron", "ExxonMobil", "BP", "Tesla Supercharger", "AutoZone", "O'Reilly Auto Parts", "Pep Boys", "CarMax", "Toyota Service", "ROCKAUTO"],
    "Education & Learning": ["Udemy", "Coursera", "Skillshare", "LinkedIn Learning", "MasterClass", "Khan Academy", "Duolingo", "Quizlet", "Pearson", "Chegg", "COMPTIA", "University"],
    "Home Improvement": ["Home Depot", "Lowe’s", "Ace Hardware", "Menards", "IKEA", "Overstock"],
    "Insurance": ["Geico", "Progressive", "State Farm", "Allstate", "Liberty Mutual", "Nationwide", "USAA", "MetLife"],
    "Charity & Donations": ["Red Cross", "GoFundMe", "UNICEF", "Feeding America", "Salvation Army", "WWF", "Charity: Water"],
    "Financial Services & Banks": ["ATM","Capital One","Vanguard","Acorns","Bank of America", "Chase", "Wells Fargo", "Citibank", "PayPal", "Venmo", "Cash App", "Western Union", "Robinhood", "E-Trade", "Fidelity", "Charles Schwab", "Zelle"],
    "Other": ["Post Office", "USPS", "FedEx", "UPS", "MoneyGram"]
}

# Function to categorize a description
def categorize_transaction(description):
    desc_lower = description.lower()
    for category, keywords in finance_categories.items():
        if any(keyword.lower() in desc_lower for keyword in keywords):
            return category
    return "Other"  # Default to "Other" if no match

def sort_transactions_by_category(transactions):
    return sorted(transactions, key=lambda x: x["category"])

# Function to extract text from a single PDF
def extract_text_from_pdf(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        text = ""
        for page in pdf.pages:
            extracted = page.extract_text()
            if extracted:  # Only add if not None
                text += extracted
    return text

# Function to parse and categorize transactions from text
def parse_transactions(text):
    pattern = r"^(?:\d{4}\s+)?(\d{1,2}/\d{1,2})\s+(?:\d{1,2}/\d{1,2}\s+)?(.+?)\s+(\$?[\d,]+\.\d{2})(?:\s+\$?[\d,]+\.\d{2})?$"
    transactions = re.findall(pattern, text, re.MULTILINE)
    return [
        {
            "date": t[0],
            "description": t[1],
            "amount": float(t[2].replace("$", "").replace(",", ""))
        }
        for t in transactions
        if "ONLINE PAYMENT THANK YOU" not in t[1].upper()
    ]

def add_categories(transactions):
    return [
        {
            "date": t["date"],
            "description": t["description"],
            "amount": t["amount"],
            "category": categorize_transaction(t["description"])
        }
        for t in transactions
    ]

def filter_withdrawals(transactions):
    return [
        transaction
        for transaction in transactions
        if not any(phrase in transaction["description"].upper() for phrase in ["ZELLE FROM", "PAYROLL"])
    ]

def process_to_list(full_pdf_path):
    raw_text = extract_text_from_pdf(full_pdf_path)
    transactions = parse_transactions(raw_text)
    withdrawals = filter_withdrawals(transactions)
    categorized_withdrawals = add_categories(withdrawals)
    return sort_transactions_by_category(categorized_withdrawals)

def main():
    if len(sys.argv) != 2:
        print("Usage: python script.py <pdf_file_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    if not os.path.isfile(pdf_path):
        print(f"Error: File '{pdf_path}' not found.")
        sys.exit(1)

    processed_withdrawals = process_to_list(pdf_path)
    for withdrawal in processed_withdrawals:
        print(withdrawal)

if __name__ == "__main__":
    main()
