#!/usr/bin/env python3
"""
Bank Statement Identifier
Analyzes PDF content to identify the bank that issued the statement.
"""

import sys
import re
import argparse

# Import pdfplumber for PDF text extraction
try:
    import pdfplumber
except ImportError:
    print("Required library not found. Please install with:", file=sys.stderr)
    print("pip install pdfplumber", file=sys.stderr)
    sys.exit(1)

# Define bank identification patterns
BANK_PATTERNS = {
    "Wells Fargo": [
        r"wells\s+fargo",
        r"wf\.com",
        r"wellsfargo\.com"
    ],
    "TD Bank": [
        r"td\s+bank",
        r"tdbank\.com",
        r"td\s+online\s+banking"
    ],
    "Chase": [
        r"chase\s+bank",
        r"jpmorgan\s+chase",
        r"chase\.com"
    ]
    # Add more banks as needed
}

def parse_arguments():
    parser = argparse.ArgumentParser(description="Identify bank from PDF statement")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    return parser.parse_args()

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdfplumber"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # For bank identification, we only need to check the first few pages
            max_pages = min(3, len(pdf.pages))
            text = ""
            for i in range(max_pages):
                extracted = pdf.pages[i].extract_text()
                if extracted:  # Only add if not None
                    text += extracted
            return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def identify_bank(text):
    """Identify the bank based on patterns in the text"""
    text_lower = text.lower()

    for bank, patterns in BANK_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return bank

    return "Unknown"

def main():
    args = parse_arguments()

    # Extract text from PDF
    print(f"Analyzing bank statement: {args.pdf_path}", file=sys.stderr)
    pdf_text = extract_text_from_pdf(args.pdf_path)

    if not pdf_text.strip():
        print("Failed to extract text from PDF", file=sys.stderr)
        sys.exit(1)

    # Identify the bank
    bank = identify_bank(pdf_text)
    print(f"Identified bank: {bank}", file=sys.stderr)

    # Output just the bank name for the Node.js script to capture
    print(bank)

    return 0

if __name__ == "__main__":
    sys.exit(main())