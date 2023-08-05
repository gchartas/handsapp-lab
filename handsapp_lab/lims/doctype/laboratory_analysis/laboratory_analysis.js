// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Analysis', {
	laboratory_protocol: function(frm) {
        clear_and_fetch(frm);
    },
    analysis_start: function(frm){
        // Check if both analysis_start and duration are set
        if (frm.doc.analysis_start && frm.doc.duration) {
            let start = frappe.datetime.str_to_obj(frm.doc.analysis_start); // Convert to JS Date object
            let end = new Date(start.getTime() + (frm.doc.duration * 60 * 60 * 1000)); // Add duration in hours
            // Manually format date to 'YYYY-MM-DD hh:mm:ss'
            let end_formatted = end.getFullYear() + "-" 
                + ("0" + (end.getMonth() + 1)).slice(-2) + "-" 
                + ("0" + end.getDate()).slice(-2) + " " 
                + ("0" + end.getHours()).slice(-2) + ":" 
                + ("0" + end.getMinutes()).slice(-2) + ":" 
                + ("0" + end.getSeconds()).slice(-2);

            frm.set_value('analysis_end', end_formatted);
        }
        frm.set_value('analysis_status', 'In Progress');
    }, 
    before_submit: function(frm) {
        // if the status is not "Completed" or "Failed", prevent form submission and show a dialog
        if (!['Completed', 'Failed'].includes(frm.doc.analysis_status)) {
            frappe.validated = false;
            
            // construct a dialog
            let dialog = new frappe.ui.Dialog({
                title: 'Set Analysis Status',
                fields: [
                    {
                        'fieldname': 'status_buttons',
                        'fieldtype': 'HTML',
                        'options': `
                            <button class="btn btn-primary status-btn" data-status="Completed">Completed</button><br><br>
                            <button class="btn btn-primary status-btn" data-status="Failed">Failed</button>
                        `
                    }
                ]
            });
            // function to set status and save form
            function set_status_and_save(status) {
                frm.set_value('analysis_status', status);
                frm.save();
                dialog.hide();
            }
            // add click event handlers for the buttons
            dialog.fields_dict.status_buttons.$wrapper.on('click', '.status-btn', function() {
                let status = $(this).data('status');
                set_status_and_save(status);
            });
            dialog.show();
        } else{
            if (frm.doc.laboratory_team.length === 0) {
                frappe.throw(__('Please add at least one team member in the Laboratory Team table before submitting'));
            }
        }
    }
});

var clear_and_fetch = function(frm){
    // clear existing data in child tables
    frm.clear_table('process');
    frm.clear_table('results');

    if (frm.doc.laboratory_protocol) {
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Laboratory Protocol",
                name: frm.doc.laboratory_protocol
            },
            callback: function(r) {
                if (r.message) {
                    // copy process steps from Laboratory Protocol to Laboratory Analysis
                    r.message.procedure.forEach(function(row) {
                        let child_row = frappe.model.add_child(frm.doc, "Process", "process");
                        child_row.description = row.description;
                        child_row.action_var = row.action_var;
                        child_row.uom = row.uom;
                        // add other fields as necessary
                    });
                    // copy outputs from Laboratory Protocol to Laboratory Analysis
                    r.message.output.forEach(function(row) {
                        let child_row = frappe.model.add_child(frm.doc, "Results", "results");
                        child_row.title = row.title;
                        child_row.method = row.method;
                        child_row.uom = row.uom;
                        // add other fields as necessary
                    });
                    frm.refresh();
                }
            }
        });
    }
    // if Laboratory Protocol is cleared, the child tables will be empty

};
