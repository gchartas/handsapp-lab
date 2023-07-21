# Copyright (c) 2023, George Chartas and contributors
# For license information, please see license.txt

#import frappe
from frappe.model.document import Document

class LaboratoryEquipmentCalibration(Document):
	pass

import frappe
from frappe.utils.file_manager import save_file
from frappe.utils.pdf import get_pdf
from frappe.utils.print_format import download_pdf

def update_linked_equipment(doc, method):
    # Get HTML format of the document
    html = frappe.get_print(doc.doctype, doc.name, print_format=None)

    # Convert HTML to PDF
    pdf = get_pdf(html)

    # Create a filename
    filename = f'{doc.name.replace(" ", "-")}.pdf'

    # Save the file and link it to the document
    file = save_file(filename, pdf, "Laboratory Equipment Calibration", doc.name, is_private=1)

    # Attach the file to the `certificate` field and save the document
    if doc.responsibility == 'User':
      doc.certificate = file.file_url
      doc.db_update()
    
    equipment = frappe.get_doc("Laboratory Equipment", doc.leid)
    equipment.cal_last = doc.calibration_date
    equipment.cal_next = doc.next_calibration_date
    equipment.cal_attach = doc.certificate
    equipment.cal_status = doc.calibration_status
    equipment.save()
