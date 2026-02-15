"""
PDF Module for EHR Processing
Provides PDF text extraction and optional Groq-based summarization.
"""

from .pdf_extractor import extract_text_from_pdf

try:
    from .groq_summarizer import initialize_groq_client, summarize_ehr_text
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    initialize_groq_client = None
    summarize_ehr_text = None

__all__ = ['extract_text_from_pdf', 'initialize_groq_client', 'summarize_ehr_text', 'GROQ_AVAILABLE']
