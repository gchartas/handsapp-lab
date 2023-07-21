from frappe import _

def get_data():
    return [
        {
            "fieldname": "language",
            "label": _("Languages"),
            "fieldtype": "Select",
            "options": "\nEnglish\nGreek",  # Add any other allowed languages separated by a new line if needed
            "default": "English",
            "required": 1,
            "translatable": 0
        }
    ]
