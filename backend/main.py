from fastapi import FastAPI, UploadFile, File, Form, HTTPException

from fastapi.middleware.cors import CORSMiddleware

from typing import List

import os

import base64

import uvicorn

import re

import asyncio

from utils import extract_text_from_pdf, get_phone_details, google_search_verify, verify_email_domain

from ai_logic import analyze_cv_ai, extract_detailed_report_ai, generate_quiz_ai

from database import engine

from models import Base

from sqlalchemy.orm import Session

from fastapi import Depends

from database import get_db

from models import Candidate, Analysis

from storage_utils import upload_pdf_to_supabase

import json

from auth import require_cv_api_access



Base.metadata.create_all(bind=engine)



app = FastAPI()



app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        origin.strip()
        for origin in os.getenv("FRONTEND_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ],

    allow_methods=["POST"],

    allow_headers=["Authorization", "Content-Type"],

)



# Google API Keys

GOOGLE_SEARCH_KEY = os.getenv("GOOGLE_API_KEY")

GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")





def _normalize_text(value: str) -> str:

    return re.sub(r"[^a-zA-Z0-9\s]", " ", (value or "").lower())





def _extract_degree_keywords(degree_text: str) -> List[str]:

    """

    Extract meaningful degree/program keywords only.

    Keeps this generic so it works across many CVs/universities.

    """

    cleaned = _normalize_text(degree_text)

    stop_words = {

        "in", "of", "and", "the", "at", "for", "program", "course", "degree",

        "bsc", "b", "sc", "bit", "ba", "bba", "bcom", "beng", "btech",

        "msc", "ma", "mba", "meng", "mtech",

        "phd", "hons", "honours", "honors",

        "bachelor", "masters", "master", "diploma", "certificate"

    }

    return [word for word in cleaned.split() if word not in stop_words and len(word) > 2]





def _degree_matches_link(degree_text: str, link: str) -> bool:

    """

    Validate that the selected institution website link likely belongs to the same degree/program.

    This avoids accepting another random course page from the same university domain.

    """

    if not degree_text or not link:

        return False



    keywords = _extract_degree_keywords(degree_text)



    # If we cannot extract reliable keywords, do not block the result

    # because some degrees may be short/abbreviated.

    if not keywords:

        return True



    haystack = _normalize_text(link)

    matched = sum(1 for word in keywords if word in haystack)



    # Require stronger proof for multi-keyword degrees.

    if len(keywords) >= 3:

        return matched >= 2

    return matched >= 1





@app.post("/analyze-multiple", dependencies=[Depends(require_cv_api_access)])

async def analyze_multiple_cvs(

        files: List[UploadFile] = File(...),

        jd: str = Form(...),

        constraints: str = Form(""),

        db: Session = Depends(get_db)

):

    results = []



    # 1. Read files into memory first

    file_data = []

    for file in files[:50]:

        content = await file.read()

        file_data.append((file.filename, content))



    # 2. Define the async wrapper for heavy tasks

    async def process_single_cv(filename, content):

        try:

            text = await asyncio.to_thread(extract_text_from_pdf, content)



            # AI Analysis call

            analysis = await asyncio.to_thread(analyze_cv_ai, text, jd, constraints)

            if not isinstance(analysis, dict):

                analysis = {"error": "Analysis failed"}



            if "score_breakdown" not in analysis:

                analysis["score_breakdown"] = {

                    "experience": 0, "skills": 0, "education": 0,

                    "projects_leadership": 0, "contact_validity": 0,

                    "keyword_density": 0, "formatting_word_count": 0,

                    "logical_consistency": 0

                }



            # Word count calculation

            word_count = len(text.split())



            # Keep old response format for frontend compatibility

            pdf_base64 = base64.b64encode(content).decode('utf-8')



            # Upload original PDF to Supabase Storage

            try:

                pdf_url = await asyncio.to_thread(upload_pdf_to_supabase, content, filename)

            except Exception:

                pdf_url = None



            return {

                "filename": filename,

                "content": content,

                "text": text,

                "analysis": analysis,

                "word_count": word_count,

                "pdf_base64": pdf_base64,

                "pdf_url": pdf_url

            }

        except Exception as e:

            print(f"❌ Error processing {filename}: {e}")

            return None



    # 3. Process all CVs concurrently

    processed_cvs = await asyncio.gather(*(process_single_cv(name, content) for name, content in file_data))



    # 4. Save to DB sequentially to avoid lock issues

    for data in processed_cvs:

        if not data or "error" in data["analysis"]:

            continue



        candidate_name = data["analysis"].get("name") or data["filename"]

        candidate_email = data["analysis"].get("email")

        candidate_phone = data["analysis"].get("phone")



        candidate = Candidate(

            candidate_name=candidate_name,

            email=candidate_email,

            phone=candidate_phone,

            original_cv_filename=data["filename"],

            cv_text=data["text"],

            pdf_url=data["pdf_url"]

        )

        db.add(candidate)

        db.commit()

        db.refresh(candidate)



        analysis_row = Analysis(

            candidate_id=candidate.id,

            job_description=jd,

            constraints=constraints,

            match_score=data["analysis"].get("match_score"),

            match_reason=data["analysis"].get("match_reason"),

            analysis_json=json.dumps(data["analysis"])

        )

        db.add(analysis_row)

        db.commit()

        db.refresh(analysis_row)



        results.append({

            "filename": data["filename"],

            "analysis": data["analysis"],

            "cv_text": data["text"],

            "pdf_view": data["pdf_base64"],

            "pdf_url": data["pdf_url"],

            "candidate_id": candidate.id,

            "analysis_id": analysis_row.id,

            "metadata": {"word_count": data["word_count"]}

        })



    return results





@app.post("/get-quiz", dependencies=[Depends(require_cv_api_access)])

async def get_quiz(cv_text: str = Form(...), jd: str = Form(...)):

    questions = generate_quiz_ai(cv_text, jd)

    return {"quiz": questions}





@app.post("/generate-report", dependencies=[Depends(require_cv_api_access)])

async def generate_report(

        cv_text: str = Form(...)

):

    details = extract_detailed_report_ai(cv_text)

    if not isinstance(details, dict):

        details = {}



    # FIXED: Ensure score_breakdown always exists for Full Analysis page

    if "score_breakdown" not in details or not isinstance(details["score_breakdown"], dict):

        details["score_breakdown"] = {

            "experience": 0,

            "skills": 0,

            "education": 0,

            "projects_leadership": 0,

            "contact_validity": 0,

            "keyword_density": 0,

            "formatting_word_count": 0,

            "logical_consistency": 0

        }



    # Initialize career_warnings early to capture all forensic penalties safely

    details['career_warnings'] = details.get('career_warnings', [])



    # Penalty Counter for Trust Score

    total_penalty = 0



    # 1. Phone Verification

    phone_raw = details.get('contact_info', {}).get('phone', '')

    phone_data = get_phone_details(phone_raw)

    details['phone_verification'] = phone_data



    # 2. Email Validity & Forensic Domain Check (TRUSTWORTHY WORDING + SIGNAL STATUS)

    email = details.get('contact_info', {}).get('email', '').strip()

    format_valid = bool(re.match(r"[^@]+@[^@]+\.[^@]+", email)) if email else False

    domain_valid = False

    email_valid = False



    if format_valid:

        domain_valid = verify_email_domain(email)

        email_valid = domain_valid



        if not domain_valid:

            total_penalty += 5

            details['career_warnings'].append(

                f"Email domain check failed for '{email.split('@')[-1]}'. Manual review recommended."

            )



    if 'contact_info' not in details:

        details['contact_info'] = {}



    details['contact_info']['email_valid'] = email_valid

    details['contact_info']['email_check'] = {

        "format_valid": format_valid,

        "domain_has_mx": domain_valid,

        "status": "signal_found" if email_valid else "manual_review"

    }



    # 3. Experience Verification

    exp_list = details.get('experience', [])

    exp_verifications = []

    for exp in exp_list:

        company = exp.get('company_name', '')

        search_name = exp.get('search_name', company)



        if company and company != "Official Name ONLY":

            # LinkedIn Search with Strict Mode using search_name

            link = google_search_verify(

                f"{search_name} LinkedIn",

                GOOGLE_SEARCH_KEY,

                GOOGLE_CSE_ID,

                strict_mode=True,

                institution_name=search_name

            )



            if link:

                verification_status = "signal_found"

                verification_confidence = "verified"

            else:

                verification_status = "manual_review"

                verification_confidence = "manual_review"

                total_penalty += 2

                details['career_warnings'].append(

                    f"No clear public company source matched automatically for claimed company: {company}. Manual review recommended."

                )



            exp_verifications.append({

                "item": f"{exp.get('role')} at {company}",

                "company": company,

                "search_name": search_name,

                "link": link,

                "status": verification_status,

                "verification_confidence": verification_confidence,

                "warning": "Public company source was not matched automatically. Manual review recommended." if not link else None

            })

    details['experience_links'] = exp_verifications



    # 4. Professional Certifications Verification

    cert_list = details.get('certifications', [])

    cert_verifications = []

    for cert in cert_list:

        cert_name = cert.get('course_name', cert.get('name', ''))

        issuing_org = cert.get('issuing_organization', '')



        if cert_name:

            search_query = f"{cert_name} {issuing_org}".strip()

            link = google_search_verify(search_query, GOOGLE_SEARCH_KEY, GOOGLE_CSE_ID, strict_mode=False)



            if link:

                verification_status = "signal_found"

                verification_confidence = "verified"

            else:

                verification_status = "manual_review"

                verification_confidence = "manual_review"

                total_penalty += 1



            cert_verifications.append({

                "name": cert_name,

                "course_name": cert_name,

                "issuing_organization": issuing_org,

                "link": link,

                "status": verification_status,

                "verification_confidence": verification_confidence,

                "warning": f"No clear public certification source was matched automatically for {cert_name}." if not link else None

            })

    details['certification_links'] = cert_verifications



    # 5. Education Verification (Degrees + A/L + O/L)

    edu_list = details.get('education', [])

    edu_verifications = []

    for edu in edu_list:

        inst = edu.get('institution', '')

        search_name = edu.get('search_name', inst)

        deg = edu.get('degree', '')

        status = edu.get('status', 'Completed')



        if inst or deg:

            # ADDED LOGIC: Check if it's a school level exam to skip searches

            is_school_level = any(keyword in deg.upper() for keyword in ["O/L", "A/L", "ORDINARY LEVEL", "ADVANCED LEVEL", "G.C.E"])



            if is_school_level:

                linkedin_link = None

                web_link = None

                verification_status = "signal_found"

                verification_confidence = "verified"

            else:

                # LinkedIn Verification with Strict Mode using search_name

                linkedin_link = google_search_verify(

                    f"{search_name} LinkedIn",

                    GOOGLE_SEARCH_KEY,

                    GOOGLE_CSE_ID,

                    strict_mode=True,

                    institution_name=search_name

                )



                # Search for the degree page on the institution side

                search_query = f"{search_name} {deg} program course"

                web_link = google_search_verify(

                    search_query,

                    GOOGLE_SEARCH_KEY,

                    GOOGLE_CSE_ID,

                    strict_mode=True,

                    institution_name=search_name

                )



                # NEW FIX:

                # Reject wrong course/program pages from the same institution domain.

                if web_link and not _degree_matches_link(deg, web_link):

                    web_link = None



                if web_link or linkedin_link:

                    verification_status = "signal_found"

                    verification_confidence = "verified" if (web_link and linkedin_link) else "likely"

                else:

                    verification_status = "manual_review"

                    verification_confidence = "manual_review"

                    total_penalty += 3

                    details['career_warnings'].append(

                        f"No clear public institution source matched automatically for degree: {deg}. Manual review recommended."

                    )



            edu_verifications.append({

                "item": f"{deg} at {inst}",

                "institution": inst,

                "search_name": search_name,

                "degree": deg,

                "link": web_link,

                "linkedin": linkedin_link,

                "status": status,

                "verification_status": verification_status,

                "verification_confidence": verification_confidence,

                # Frontend expects an array of warnings for education

                "warnings": [f"No clear public institution source was matched automatically for {deg}."] if not (web_link or linkedin_link) and not is_school_level else []

            })

    details['education_links'] = edu_verifications



    # Score Split Logic

    base_ats_score = details.get('ats_analysis', {}).get('score', 0)



    # Penalty cap

    applied_penalty = min(total_penalty, 30)



    # credibility score

    credibility_score = max(0, 100 - (applied_penalty * 3))



    # final overall score

    overall_score = round((base_ats_score * 0.7) + (credibility_score * 0.3))



    details['scores'] = {

        "jd_match_score": base_ats_score,

        "credibility_score": credibility_score,

        "overall_score": overall_score

    }



    # keep old field for backward compatibility

    if 'ats_analysis' not in details:

        details['ats_analysis'] = {}

    details['ats_analysis']['score'] = overall_score



    # 6. Finalizing Other Fields

    details['social_links'] = details.get('social_links', [])

    details['languages'] = details.get('languages', [])

    details['personal_leadership'] = details.get('extra_activities', [])

    details['skills'] = details.get('skills', [])

    # career_warnings is already handled above

    details['references'] = details.get('references', [])



    return details





if __name__ == "__main__":

    uvicorn.run(app, host="0.0.0.0", port=8000)