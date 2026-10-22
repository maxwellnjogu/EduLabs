import io
import os
import re
import logging
from typing import Tuple
from django.core.files.base import File
from security.utils import validate_and_save_upload, PROMPT_INJECTION_PATTERNS
from .models import LearningMaterial

logger = logging.getLogger(__name__)

# Max extractable text size to prevent memory exhaustion (e.g. 500KB)
MAX_EXTRACT_CHARS = 100_000


def sanitize_extracted_text(raw_text: str) -> Tuple[str, bool]:
    """
    Sanitizes extracted document text and checks for embedded prompt injection patterns.
    Returns (cleaned_text, injection_detected).
    """
    if not raw_text:
        return "", False

    injection_found = False
    cleaned = raw_text.replace("\x00", "")

    for pattern in PROMPT_INJECTION_PATTERNS:
        if pattern.search(cleaned):
            injection_found = True
            # Neutralize active injection directive in untrusted document text
            cleaned = pattern.sub("[REDACTED_INJECTION_DIRECTIVE]", cleaned)

    # Truncate to maximum safe character length
    if len(cleaned) > MAX_EXTRACT_CHARS:
        cleaned = cleaned[:MAX_EXTRACT_CHARS] + "\n\n[Document truncated for length]"

    return cleaned.strip(), injection_found


def extract_text_from_file(file_obj, filename: str) -> Tuple[str, str, str]:
    """
    Safely extracts text content from uploaded document stream.
    Returns: (extracted_text, processing_status, error_message)
    Processing status is one of: 'processed', 'failed', 'requires_review'.
    """
    ext = os.path.splitext(filename)[1].lower()

    try:
        file_obj.seek(0)
    except Exception:
        pass

    # Plain Text
    if ext == ".txt":
        try:
            content_bytes = file_obj.read()
            try:
                raw_text = content_bytes.decode("utf-8")
            except UnicodeDecodeError:
                raw_text = content_bytes.decode("latin-1", errors="replace")

            cleaned, has_injection = sanitize_extracted_text(raw_text)
            if not cleaned:
                return "", LearningMaterial.ProcessingStatus.FAILED, "Plain text document is empty."
            return cleaned, LearningMaterial.ProcessingStatus.PROCESSED, ""
        except Exception as exc:
            return "", LearningMaterial.ProcessingStatus.FAILED, f"Failed to read text file: {str(exc)[:200]}"

    # PDF Document
    elif ext == ".pdf":
        try:
            from pypdf import PdfReader

            # Ensure bytes stream
            if hasattr(file_obj, "read"):
                stream = io.BytesIO(file_obj.read())
            else:
                stream = file_obj

            reader = PdfReader(stream)
            if reader.is_encrypted:
                return "", LearningMaterial.ProcessingStatus.FAILED, "PDF is password-protected or encrypted."

            extracted_pages = []
            for idx, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                if page_text.strip():
                    extracted_pages.append(page_text.strip())

            raw_text = "\n\n".join(extracted_pages)
            cleaned, has_injection = sanitize_extracted_text(raw_text)

            if not cleaned:
                return (
                    "",
                    LearningMaterial.ProcessingStatus.FAILED,
                    "PDF contains no extractable digital text (may be image-scanned without OCR).",
                )
            return cleaned, LearningMaterial.ProcessingStatus.PROCESSED, ""
        except Exception as exc:
            return "", LearningMaterial.ProcessingStatus.FAILED, f"PDF extraction error: {str(exc)[:200]}"

    # Word DOCX Document
    elif ext == ".docx":
        try:
            import docx

            if hasattr(file_obj, "read"):
                stream = io.BytesIO(file_obj.read())
            else:
                stream = file_obj

            doc = docx.Document(stream)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)

            raw_text = "\n\n".join(paragraphs)
            cleaned, has_injection = sanitize_extracted_text(raw_text)

            if not cleaned:
                return "", LearningMaterial.ProcessingStatus.FAILED, "DOCX document contains no readable text."
            return cleaned, LearningMaterial.ProcessingStatus.PROCESSED, ""
        except Exception as exc:
            return "", LearningMaterial.ProcessingStatus.FAILED, f"DOCX extraction error: {str(exc)[:200]}"

    # Supported Image formats
    elif ext in [".png", ".jpg", ".jpeg", ".webp"]:
        try:
            from PIL import Image

            if hasattr(file_obj, "read"):
                stream = io.BytesIO(file_obj.read())
            else:
                stream = file_obj

            with Image.open(stream) as img:
                img.verify()

            return (
                "",
                LearningMaterial.ProcessingStatus.REQUIRES_REVIEW,
                "Visual diagram stored successfully. Image content requires manual review or multimodal vision inspection.",
            )
        except Exception as exc:
            return "", LearningMaterial.ProcessingStatus.FAILED, f"Invalid or corrupt image file: {str(exc)[:200]}"

    # Video references / URLs
    elif ext in [".mp4", ".mov", ".avi", ".mkv"]:
        return (
            "",
            LearningMaterial.ProcessingStatus.REQUIRES_REVIEW,
            "Video file reference stored. Automated audio transcript extraction is not currently configured.",
        )

    return "", LearningMaterial.ProcessingStatus.FAILED, f"Unsupported file extension: {ext}"


def process_uploaded_material(material: LearningMaterial, uploaded_file) -> LearningMaterial:
    """
    Validates, extracts text, and updates LearningMaterial processing state.
    Guaranteed not to raise unhandled exceptions.
    """
    material.processing_status = LearningMaterial.ProcessingStatus.PROCESSING
    material.processing_error = ""

    if not uploaded_file:
        # Notes or external URL
        if material.material_type in [LearningMaterial.MaterialType.YOUTUBE, LearningMaterial.MaterialType.VIDEO]:
            material.processing_status = LearningMaterial.ProcessingStatus.PROCESSED
            material.extracted_text = ""
            material.processing_error = "Video reference verified. Transcripts are not simulated."
        elif material.content.strip():
            cleaned, _ = sanitize_extracted_text(material.content)
            material.extracted_text = cleaned
            material.processing_status = LearningMaterial.ProcessingStatus.PROCESSED
        material.save()
        return material

    try:
        # Validate file size and format using security utils
        validate_and_save_upload(uploaded_file, upload_subdir="materials")
        material.original_filename = getattr(uploaded_file, "name", "uploaded_file")[:255]
        material.file_size = getattr(uploaded_file, "size", 0)

        # Extract text
        extracted_text, status, error_msg = extract_text_from_file(uploaded_file, material.original_filename)

        material.extracted_text = extracted_text
        material.processing_status = status
        material.processing_error = error_msg
    except Exception as exc:
        material.processing_status = LearningMaterial.ProcessingStatus.FAILED
        material.processing_error = str(exc)[:300]
        logger.warning("Material processing failed for material %s: %s", material.id, str(exc)[:200])

    material.save()
    return material
