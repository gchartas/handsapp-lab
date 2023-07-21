# Copyright (c) 2023, George Chartas and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class LaboratoryEquipmentMaintenance(Document):
	pass

def update_linked_equipment(doc, method):
    equipment = frappe.get_doc("Laboratory Equipment", doc.leid)
    equipment.mnt_last = doc.mnt_date
    equipment.mnt_next = doc.mnt_next
    equipment.mnt_status = doc.mnt_status
    equipment.save()
    
