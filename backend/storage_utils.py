import uuid
from supabase_client import supabase

def upload_pdf_to_supabase(file_bytes: bytes, filename: str):
    unique_name = f"{uuid.uuid4()}_{filename}"

    supabase.storage.from_("cv-files").upload(
        unique_name,
        file_bytes,
        {"content-type": "application/pdf"}
    )

    public_url = supabase.storage.from_("cv-files").get_public_url(unique_name)
    return public_url