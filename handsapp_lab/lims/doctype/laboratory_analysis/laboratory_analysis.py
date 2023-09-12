# Copyright (c) 2023, George Chartas and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class LaboratoryAnalysis(Document):
	pass
import frappe
from frappe import _

@frappe.whitelist()
def on_submit(doc, method):
    lab_sample = frappe.get_doc("Laboratory Sample", doc.sample_id)
    
    # Create a mapping of smpl_anal_parameter to value for Laboratory Analysis
    lab_analysis_mapping = {result.smpl_anal_parameter: result.result for result in doc.results}
    
    # Create a mapping of smpl_anal_parameter to value for Laboratory Sample
    lab_sample_mapping = {result.smpl_anal_parameter: result.value for result in lab_sample.results}
    
    # Initialize list for missing parameters
    missing_parameters = []
    
    for parameter, value in lab_analysis_mapping.items():
        if parameter in lab_sample_mapping:
            for result in lab_sample.results:
                if result.smpl_anal_parameter == parameter:
                    result.value = value
        else:
            missing_parameters.append(parameter)
    
    # Save the modified Laboratory Sample document
    lab_sample.save()
    
    # Notify about missing parameters
    if missing_parameters:
        frappe.msgprint(_("Missing analysis results for the following parameters in Laboratory Sample: {0}").format(", ".join(missing_parameters)), alert=True)
