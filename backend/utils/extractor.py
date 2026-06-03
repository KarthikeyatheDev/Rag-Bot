from pypdf import PdfReader

def extract_text_from_txt(
    file_path: str
):

    with open(
        file_path,
        "r",
        encoding="utf-8"
    ) as file:

        return file.read()
    
def extract_text_from_pdf(
    file_path: str
):

    reader = PdfReader(file_path)

    text = ""

    for page in reader.pages:

        extracted = page.extract_text()

        if extracted:

            text += extracted

    return text

def extract_text(
    file_path: str,
    filename: str):
    if filename.endswith(".txt"):
        return extract_text_from_txt(
        file_path
    )
    
    elif filename.endswith(".pdf"):
        return extract_text_from_pdf(
        file_path
    )
    else:
        return ""