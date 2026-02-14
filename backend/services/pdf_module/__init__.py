"""
PDF Module for EHR Processing
Provides PDF text extraction and Groq-based summarization.
"""

from .pdf_extractor import extract_text_from_pdf
from .groq_summarizer import initialize_groq_client, summarize_ehr_text

__all__ = ['extract_text_from_pdf', 'initialize_groq_client', 'summarize_ehr_text']
