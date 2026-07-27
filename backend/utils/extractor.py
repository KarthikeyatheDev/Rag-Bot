from io import BytesIO
from pypdf import PdfReader


def extract_text_from_txt(file_path: str):

    with open(file_path, "r", encoding="utf-8") as file:

        return file.read()


def extract_text_from_pdf(file_path: str):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        extracted = page.extract_text()

        if extracted:

            text += extracted

    return text


def extract_text(file_bytes: bytes, filename: str) -> str:
    filename = filename.lower()

    if filename.endswith(".txt"):
        return file_bytes.decode("utf-8")

    elif filename.endswith(".pdf"):
        pdf = PdfReader(BytesIO(file_bytes))
        text = ""

        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

        return text

    else:
        raise ValueError("Unsupported file type")
