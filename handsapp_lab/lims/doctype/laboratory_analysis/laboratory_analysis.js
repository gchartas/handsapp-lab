// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Analysis', {
	laboratory_protocol: function(frm) {
        // clear existing data in child tables
        frm.clear_table('input');
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
                        // assuming that 'input', 'process' and 'results' are child tables in both DocTypes and have similar structures
                        // copy inputs from Laboratory Protocol to Laboratory Analysis
                        r.message.input.forEach(function(row) {
                            let child_row = frappe.model.add_child(frm.doc, "Input", "input");
                            child_row.description = row.description;
                            child_row.quantity = row.quantity;
                            child_row.uom = row.uom;
                            // add other fields as necessary
                        });

                        // copy process steps from Laboratory Protocol to Laboratory Analysis
                        r.message.procedure.forEach(function(row) {
                            let child_row = frappe.model.add_child(frm.doc, "Process", "process");
                            child_row.description = row.description;
                            child_row.action_var = row.action_var;
                            child_row.uom = row.uom;
                            child_row.time = row.time;
                            // add other fields as necessary
                        });
                        // copy outputs from Laboratory Protocol to Laboratory Analysis
                        r.message.output.forEach(function(row) {
                            let child_row = frappe.model.add_child(frm.doc, "Results", "results");
                            child_row.title = row.title;
                            child_row.method = row.method;
                            child_row.uom = row.uom;
                            child_row.fieldname2 = row.fieldname2;
                            // add other fields as necessary
                        });
                        frm.refresh();
                    }
                }
            });
        }
        // if Laboratory Protocol is cleared, the child tables will be empty
    },
    analysis_start: function(frm){
        // initialize end_datetime as analysis_start
        let end_datetime = moment(frm.doc.analysis_start);
        // add time from all steps to end_datetime
        frm.doc.process.forEach(function(row) {
            // parse the 'time' field as a moment duration
            let step_duration = moment.duration(row.time);
            // add this duration to end_datetime
            end_datetime.add(step_duration);
        });
        // set end_datetime field
        frm.set_value('analysis_end', end_datetime.format('YYYY-MM-DD HH:mm:ss'));
        // change the analysis_status to "In Progress" when analysis_start is changed
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
        }
    }
});
