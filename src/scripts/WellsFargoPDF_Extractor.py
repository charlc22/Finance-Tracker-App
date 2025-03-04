import pdfplumber
import re
import os
import pandas as pd
# README This code takes a pdf, scans it for text, strips it to transactions, and categorizes it.

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

# Function to extract text from a single PDF
def extract_text_from_pdf(pdf_path): # pulls raw text from pdf
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
        if "ONLINE PAYMENT THANK YOU" not in t[1].upper()  # Filter out false positives
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

def filter_withdrawals(transactions): # function to filter out deposits and keep only withdrawals
    return [
        transaction
        for transaction in transactions
        if not any(phrase in transaction["description"].upper() for phrase in ["ZELLE FROM", "PAYROLL"])
    ]

def process_single_pdf(pdf_path, output_path="transactions_single.csv"):
    all_transactions = []
    print(f"Processing {os.path.basename(pdf_path)}...")
    text = extract_text_from_pdf(pdf_path)
    transactions = parse_transactions(text)
    withdrawals = filter_withdrawals(transactions)
    categorized_withdrawals = add_categories(withdrawals)
    all_transactions.extend(categorized_withdrawals)
    
    # Convert to DataFrame and save to CSV at the specified output path
    if all_transactions:
        df = pd.DataFrame(all_transactions, columns=["date", "description", "amount", "category"])
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Saved {len(all_transactions)} transactions to {output_path}")
    else:
        print("No transactions found.")

def main():
    # Main execution
    pdf_path = "statements/020725 WellsFargo.pdf"  # Your PDF file name
    raw_text = extract_text_from_pdf(pdf_path) # Raw text
    transactions = parse_transactions(raw_text)  # Returns an organized list
    withdrawals = filter_withdrawals(transactions)  # Filters organized list to only withdrawals
    categorized_withdrawals = add_categories(withdrawals)  # Adds categories
    # Print the results to check
    for withdrawal in categorized_withdrawals:
        print(withdrawal)

    # process_single_pdf(pdf_path) # export a single csv with categories

if __name__ == "__main__":
    main()