"""
PDF Text Extraction Module
Extracts raw text from EHR PDF files using pdfplumber.
"""

import pdfplumber
import re


def extract_text_from_pdf(file):
    """
    Extract text from PDF file.
    
    Args:
        file: File-like object or path to PDF file
        
    Returns:
        str: Extracted and cleaned text from all pages
    """
    text_parts = []
    
    with pdfplumber.open(file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    
    # Combine all pages
    full_text = '\n'.join(text_parts)
    
    # Clean excessive whitespace
    full_text = re.sub(r'\n\s*\n', '\n\n', full_text)
    full_text = re.sub(r' +', ' ', full_text)
    
    return full_text.strip()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python pdf_extractor.py <path_to_pdf>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    
    try:
        extracted_text = extract_text_from_pdf(pdf_path)
        print("=" * 60)
        print("PDF TEXT EXTRACTION TEST")
        print("=" * 60)
        print(f"\nTotal characters extracted: {len(extracted_text)}")
        print(f"\nFirst 500 characters:\n")
        print(extracted_text[:500])
        print("\n" + "=" * 60)
    except Exception as e:
        print(f"Error extracting text: {e}")
        sys.exit(1)
