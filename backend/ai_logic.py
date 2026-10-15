import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    client = None
    print("⚠️ Warning: GEMINI_API_KEY not found in environment variables")


MODEL_NAME = 'gemini-2.5-flash'


def analyze_cv_ai(cv_text, jd_text, constraints):
    """
    Phase 1: Basic Analysis and Ranking.
    FIXED: Consistency with 0 temperature and rigid scoring rubric.
    ADDED: Logical Anomalies detection for overlaps and impossible skills.
    """
    if not client:
        return {"error": "API key not configured"}

    prompt = f"""
    Act as a strict HR Recruiter. Analyze this CV against the JD and Constraints.

    SCORING RUBRIC (Strictly follow this to calculate match_score):
    1. Experience (25%): Full marks for matching roles/duration. Deduct if vague.
    2. Skills (20%): Match percentage of CV skills against JD requirements.
    3. Education (15%): Presence of required degrees/institutions AND school results (A/L, O/L).
    4. Projects & Leadership (10%): Quality and relevance of listed items.
    5. Contact & Validity (10%): Presence of valid Email, Phone, and Professional links.
    6. Keyword Density (10%): Use of industry-standard terms from JD.
    7. Formatting & Word Count (10%): Professional structure and appropriate length.
    8. Logical Anomalies & Overlaps (Crucial Penalty): Deduct an extra 5-10% if you detect overlapping full-time roles, illogical timelines (e.g. full time degree + full time job), or claimed experience in a technology that exceeds its existence.

    PENALTY: Deduct 2% for every missing critical requirement or invalid data point.

    JD: {jd_text}
    Constraints: {constraints}
    CV: {cv_text[:7000]}

    Return ONLY raw JSON:
    {{
        "name": "Candidate Full Name", 
        "match_score": 0, 
        "match_reason": "Provide a detailed objective reason based on the rubric.", 
        "skills_found": [],
        "missing_skills": [],
        "score_breakdown": {{
            "experience": 0,
            "skills": 0,
            "education": 0,
            "projects_leadership": 0,
            "contact_validity": 0,
            "keyword_density": 0,
            "formatting_word_count": 0,
            "logical_consistency": 0
        }}
    }}
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0  # Consistency fix
            )
        )
        res_text = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(res_text)

        if "score_breakdown" not in data or not isinstance(data["score_breakdown"], dict):
            data["score_breakdown"] = {
                "experience": 0,
                "skills": 0,
                "education": 0,
                "projects_leadership": 0,
                "contact_validity": 0,
                "keyword_density": 0,
                "formatting_word_count": 0,
                "logical_consistency": 0
            }

        return data
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        return {"error": "Analysis failed"}


def extract_detailed_report_ai(cv_text):
    """
    Phase 2: Deep Extraction.
    STRICT: Mandatory inclusion of school results (AL/OL) and exact extraction.
    ADDED: Deep forensic analysis for career_warnings (Overlaps & Anomalies).
    ADDED: Achievements to extra_activities & Certificates from Education background to Education array.
    FIXED: score_breakdown added for full analysis page.
    """
    if not client:
        return {}

    prompt = f"""
    Perform a high-precision extraction from the CV text. Return ONLY raw JSON.

    STRICT EXTRACTION RULES:
    1. 'education': 
        - You MUST include ALL school-level history found in the CV, specifically G.C.E. A/L and G.C.E. O/L results.
        - You MUST include academic degrees, diplomas, higher diplomas, and school qualifications in the 'education' array.
        - 'institution': Use the EXACT full name from the CV (e.g., 'Horizon Campus', 'CHARTERED INSTITUTE OF PERSONNEL MANAGEMENT').
        - 'search_name': Extract ONLY the widely known short brand name or acronym of the institution for online searching (e.g., extract 'CIPM' from 'CHARTERED INSTITUTE OF PERSONNEL MANAGEMENT', 'UCSC' from 'University of Colombo School of Computing').
        - 'degree': Exact result/stream (e.g., 'G.C.E Advanced Level (E-Technology Stream)', 'BSC(Hons) in IT').
        - 'status': "Ongoing" if currently studying/reading. Otherwise "Completed".
    2. 'languages': English, Sinhala, Tamil, etc. MUST be in this list ONLY. Move them out of 'skills'.
    3. 'skills': Technical/Soft skills only. No languages.
    4. 'certifications': Extract the exact course name into 'course_name' and the exact issuing organization into 'issuing_organization' (e.g., course_name: 'Certificate in Web Development', issuing_organization: 'Sololearn').
       - You MUST place professional certificates, vendor certifications, short course certificates, and online learning certificates in the 'certifications' array even if they appear under an 'Education' or 'Educational Background' section in the CV.
    5. 'social_links': Use '[LINK: ...]' metadata for accuracy.
    6. 'references': Extract all contact person details from the document.
    7. 'career_warnings': You MUST critically analyze timelines and claims. Add specific warnings to the array if you detect:
        - Overlapping full-time jobs (extract start and end dates carefully).
        - Chronological mismatches (e.g., working a full-time senior role while enrolled in a full-time degree).
        - Time-based skill anomalies (e.g., claimed years of experience in a technology exceeds how long it has existed).
    8. 'extra_activities': You MUST include all extracurricular activities, AND you MUST extract ALL Awards, Recognitions, and Achievements (e.g., 'Top 20% Performer', 'Trailblazer Recognition') found anywhere in the CV into this array.
    9. 'experience': 
        - 'company_name': Extract the exact full name as written (e.g., 'WSO2 (PVT) LTD').
        - 'search_name': You MUST extract ONLY the core brand name for online searching. Remove words like 'PVT', 'LTD', 'INC', 'Holdings', 'LANKA', 'COLOMBO', 'SRI LANKA' (e.g., extract 'WSO2' from 'WSO2 (PVT) LTD', extract 'Pearson' from 'PEARSON LANKA (PVT) LTD', extract 'LSEG' from 'LSEG BUSINESS SERVICES COLOMBO (PVT) LTD').
    10. 'score_breakdown':
        - You MUST return a numeric percentage score for each category below based on the CV quality and content.
        - Use values between 0 and 100.
        - This is required for the Full Analysis page UI.
        - The fields are:
            * experience
            * skills
            * education
            * projects_leadership
            * contact_validity
            * keyword_density
            * formatting_word_count
            * logical_consistency

    JSON STRUCTURE:
    {{
        "ats_analysis": {{
            "score": 0,
            "reason": "Detailed ATS technical evaluation summary."
        }},
        "score_breakdown": {{
            "experience": 0,
            "skills": 0,
            "education": 0,
            "projects_leadership": 0,
            "contact_validity": 0,
            "keyword_density": 0,
            "formatting_word_count": 0,
            "logical_consistency": 0
        }},
        "contact_info": {{
            "email": "",
            "phone": "",
            "portfolio_url": "" 
        }},
        "social_links": [{{"platform": "LinkedIn/GitHub/Portfolio", "url": ""}}],
        "career_warnings": [],
        "projects": [{{"title": "", "description": ""}}],
        "extra_activities": [{{"activity": "", "organization": "", "description": ""}}],
        "education": [{{"institution": "EXACT FULL NAME", "search_name": "SHORT NAME / ACRONYM", "degree": "EXACT DEGREE/RESULT", "year": "", "status": "Ongoing/Completed"}}],
        "experience": [{{"company_name": "EXACT FULL NAME", "search_name": "CORE BRAND NAME ONLY (e.g. Pearson)", "role": "", "duration": ""}}],
        "certifications": [{{"course_name": "", "issuing_organization": ""}}],
        "skills": [],
        "languages": [],
        "references": [{{"name": "", "designation": "", "company": ""}}]
    }}

    CV Text: {cv_text[:19000]}
    """
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.0  # Stability fix
            )
        )
        res_text = response.text.strip().replace('```json', '').replace('```', '')
        data = json.loads(res_text)

        if "score_breakdown" not in data or not isinstance(data["score_breakdown"], dict):
            data["score_breakdown"] = {
                "experience": 0,
                "skills": 0,
                "education": 0,
                "projects_leadership": 0,
                "contact_validity": 0,
                "keyword_density": 0,
                "formatting_word_count": 0,
                "logical_consistency": 0
            }

        return data
    except Exception as e:
        print(f"❌ Detailed extraction error: {e}")
        return {}


def generate_quiz_ai(cv_text, jd_text):

    if not client:
        return "API key not configured"

    prompt = f"Act as a Technical Interviewer. Generate 5 tough, specific interview questions by comparing CV: {cv_text[:4000]} and JD: {jd_text}. Focus on validating the claims made in the CV."

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.2  
            )
        )
        return response.text
    except Exception as e:
        print(f"❌ Quiz error: {e}")
        return "Quiz generation failed."