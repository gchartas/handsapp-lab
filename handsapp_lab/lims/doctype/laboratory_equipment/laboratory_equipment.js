// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Equipment', {
    refresh: function(frm) {
        frm.fields_dict.lab_eqpt_man.grid.get_field('manual').get_query = function(doc, cdt, cdn) {
            return {
                filters: {
                    'lab_eq': doc.name
                }
            };
        };
    }
});