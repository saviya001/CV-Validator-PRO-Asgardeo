import os
import re
import pytesseract
import phonenumbers
import fitz  
from pathlib import Path
from pdf2image import convert_from_bytes
from googleapiclient.discovery import build
from phonenumbers import geocoder, carrier
import dns.resolver  # ADDED: For checking Fake Email Domains (MX Records)

BASE_DIR = Path(__file__).resolve().parent

POPPLER_PATH = os.path.join(BASE_DIR, "bin", "poppler", "Library", "bin")
TESSERACT_EXE = os.path.join(BASE_DIR, "bin", "tesseract", "tesseract.exe")
pytesseract.pytesseract.tesseract_cmd = TESSERACT_EXE


def extract_text_from_pdf(file_bytes):
    """
    First, the visible text and hidden hyperlinks in the PDF are extracted.
    Then, the remaining parts are read through OCR.
    """
    text = ""
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        for page in doc:
            text += page.get_text() + "\n"
            
            links = page.get_links()
            for link in links:
                if "uri" in link:
                    text += f" [LINK: {link['uri']}] "
        doc.close()

        if len(text.strip()) < 500:
            images = convert_from_bytes(file_bytes, poppler_path=POPPLER_PATH)
            for img in images:
                text += pytesseract.image_to_string(img) + "\n"
            
    except Exception as e:
        print(f"Extraction Error: {e}")
    return text


def count_words(text):
    if not text:
        return 0
    words = re.findall(r'\w+', text)
    return len(words)


def google_search_verify(query, api_key, cse_id, strict_mode=False, institution_name=""):
    """
    FIXED SEARCH LOGIC:
    Returns only trusted / official-looking sources.
    Blocks personal profiles, forums, blogs, and unrelated public discussion pages.
    If no trusted result is found, returns None.
    """
    if not api_key or not cse_id:
        return None

    search_query = query 

    try:
        service = build("customsearch", "v1", developerKey=api_key)
        res = service.cse().list(q=search_query, cx=cse_id, num=5).execute()

        if 'items' in res:
            raw_items = res['items']
            items = []

            blocked_domains = [
                "forum.freecodecamp.org",
                "reddit.com",
                "medium.com",
                "quora.com",
                "stackoverflow.com",
                "youtube.com",
                "facebook.com",
                "instagram.com",
                "x.com",
                "twitter.com",
                "tiktok.com",
                "pinterest.com",
                "dev.to",
                "geeksforgeeks.org",
                "w3schools.com",
                "tutorialspoint.com",
                "blogspot.com",
                "wordpress.com"
            ]
            
            # FIXED LOGIC: Block Personal LinkedIn Profiles + blocked public discussion/blog pages
            for item in raw_items:
                item_url = item['link'].lower()

                if "linkedin.com/in/" in item_url or "linkedin.com/people/" in item_url:
                    continue  # Skip this personal profile

                if any(domain in item_url for domain in blocked_domains):
                    continue  # Skip forums/blogs/discussion sites

                items.append(item)
                
            # If all results were blocked, return None (Trigger manual search)
            if not items:
                return None

            # SMART STRICT MODE
            if strict_mode and institution_name:
                valid_items = []
                
                clean_name = re.sub(r'[^a-zA-Z0-9\s]', '', institution_name.lower())
                stop_words = {'pvt', 'ltd', 'limited', 'private', 'inc', 'the', 'of', 'and'}
                name_parts = [p for p in clean_name.split() if p not in stop_words and len(p) > 1]
                
                if name_parts:
                    for item in items:
                        item_text = (item.get('title', '') + " " + item.get('snippet', '')).lower()
                        item_url = item.get('link', '').lower()
                        combined_text = f"{item_text} {item_url}"

                        matched_parts = sum(1 for part in name_parts if part in combined_text)

                        if len(name_parts) == 1:
                            if matched_parts >= 1:
                                valid_items.append(item)
                        else:
                            if matched_parts >= 2:
                                valid_items.append(item)
                else:
                    valid_items = items
                
                if not valid_items:
                    return None
                
                items = valid_items

            # 1. First Pass: Look for high-trust official domains
            trusted_patterns = [
                ".ac.lk",
                ".edu",
                ".gov",
                "ucsc.cmb.ac.lk",
                ".org",
                "linkedin.com/company/",
                "linkedin.com/school/",
                "coursera.org",
                "edx.org",
                "udacity.com",
                "aws.amazon.com",
                "learn.microsoft.com",
                "microsoft.com",
                "google.com",
                "grow.google",
                "cisco.com",
                "netacad.com",
                "oracle.com",
                "ibm.com",
                "cloudskillsboost.google"
            ]

            for item in items:
                link = item['link'].lower()
                if any(pattern in link for pattern in trusted_patterns):
                    return item['link']
            
            # 2. If no trusted official source found, return None
            return None
            
        return None
        
    except Exception as e:
        print(f"Google Search Error: {e}")
        return None


def get_phone_details(phone_text):
    if not phone_text:
        return {"valid": False, "error": "No number found"}

    try:
        match = re.search(r'(\+?\d[\d -]{8,15})', phone_text)
        if match:
            clean_num = match.group(0).replace(" ", "").replace("-", "")

            if clean_num.startswith('0') and len(clean_num) == 10:
                clean_num = "+94" + clean_num[1:]

            parsed_num = phonenumbers.parse(clean_num, "LK")

            return {
                "number": clean_num,
                "country": geocoder.description_for_number(parsed_num, "en"),
                "carrier": carrier.name_for_number(parsed_num, "en"),
                "valid": phonenumbers.is_valid_number(parsed_num)
            }
    except Exception as e:
        print(f"Phone Parse Error: {e}")

    return {"valid": False, "error": "Invalid format"}


def is_valid_url(url):
    regex = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return re.match(regex, url) is not None



def get_pdf_metadata(file_bytes):
    """
    Extracts embedded metadata from the PDF for forensic analysis.
    Useful to detect if someone is reusing another person's CV file.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        meta = doc.metadata
        doc.close()
        return {
            "author": meta.get("author", ""),
            "creator": meta.get("creator", ""),
            "producer": meta.get("producer", ""),
            "creation_date": meta.get("creationDate", ""),
            "mod_date": meta.get("modDate", "")
        }
    except Exception as e:
        print(f"Metadata Extraction Error: {e}")
        return {}


def verify_email_domain(email):
    """
    Checks if the email domain actually has a valid Mail Server (MX Record).
    This catches fake reference emails (e.g., manager@xyz-fake-company.com).
    """
    if not email or "@" not in email:
        return False
        
    domain = email.split('@')[-1].strip()
    try:
        # Check if MX (Mail Exchange) records exist for the domain
        records = dns.resolver.resolve(domain, 'MX')
        return len(records) > 0
    except Exception as e:
        print(f"Fake Domain or MX Record Missing for {domain}: {e}")
        return False