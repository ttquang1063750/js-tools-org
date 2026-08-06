import json
import csv
import os

def clean_text(text):
    """
    Basic text cleaning: trim surrounding whitespace and lowercase.
    """
    # Real-world data always contains empty cells and wrong types. A text helper
    # that does not guard against them breaks the pipeline at record 10,000.
    if not isinstance(text, str):
        return ""
    return text.strip().lower()

def run_cleaning_pipeline(input_path, output_path):
    print("--- Starting the data cleaning pipeline ---")

    if not os.path.exists(input_path):
        print(f"Error: file {input_path} does not exist.")
        return

    # `with` closes the file on the way out, even if an error is raised inside
    # the block. It is Python's version of the try/finally you write by hand in
    # JavaScript. And encoding="utf-8" is not optional: drop it and accented
    # text turns into garbage characters on Windows.
    with open(input_path, "r", encoding="utf-8") as file:
        raw_data = json.load(file)

    cleaned_records = []

    for index, record in enumerate(raw_data):
        # .get(key, fallback) returns the fallback instead of raising when the
        # key is missing — the safe way to read data that came from outside.
        user_id = record.get("id", index)
        raw_comment = record.get("comment", "")

        cleaned_records.append({
            "user_id": user_id,
            "cleaned_comment": clean_text(raw_comment)
        })

    # Write the cleaned rows out as CSV, ready for the NLP lessons later on.
    with open(output_path, "w", newline="", encoding="utf-8") as csv_file:
        fieldnames = ["user_id", "cleaned_comment"]
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(cleaned_records)

    print(f"Done. Wrote {len(cleaned_records)} cleaned records to {output_path}")

# Everything below runs only when this file is executed directly,
# not when it is imported from another module.
if __name__ == "__main__":
    # The sample input is generated here so the lesson runs with no setup.
    # These comments stay in Vietnamese on purpose: they are the DATA being
    # cleaned, and they demonstrate why encoding="utf-8" matters above.
    mock_data = [
        {"id": 101, "comment": "  Mô hình AI chạy RẤT NHANH!  "},
        {"id": 102, "comment": "Tôi Cần hỗ Trợ kỹ thuật gấp...   "},
        {"id": 103, "comment": "   Tuyệt VỜI, 10 điểm. "}
    ]

    with open("raw_feedback.json", "w", encoding="utf-8") as f:
        json.dump(mock_data, f, ensure_ascii=False, indent=2)

    run_cleaning_pipeline("raw_feedback.json", "cleaned_feedback.csv")
