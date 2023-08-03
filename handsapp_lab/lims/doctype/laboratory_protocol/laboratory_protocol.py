# Copyright (c) 2023, George Chartas and contributors
# For license information, please see license.txt

from frappe.model.document import Document
from frappe.model.naming import make_autoname
import frappe

class LaboratoryProtocol(Document):
    def before_insert(self):
        # frappe.msgprint('Poutanakia FTW')   Debug message
        self.code_doc = make_autoname('LP-.####')
