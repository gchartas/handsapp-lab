// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Analysis', {
    onload: function(frm){
        toggle_process_section(frm);
    },
    refresh: function(frm){
        frm.add_custom_button('Fetch Data', function() {
            clear_and_fetch(frm);
        }, __('Actions'));
        frm.add_custom_button('View Protocol', function() {
            view_protocol(frm);
        }, __('Actions'));

        // Add a custom class to style the label
        $(frm.fields_dict['laboratory_protocol'].label_area).addClass('custom-lab-protocol-label');

        // Add CSS to style the custom class (you can also add this to your CSS file)
        const custom_css = `
            <style>
                .custom-lab-protocol-label {
                    font-weight: bold;
                    color: blue;
                    text-decoration: underline;
                    cursor: pointer;
                }
            </style>
        `;

        $('head').append(custom_css);

        // Attach a click event to the label
        $(frm.fields_dict['laboratory_protocol'].label_area).click(function() {
            view_protocol(frm);
        });
    },
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
                        child_row.smpl_anal_parameter = row.smpl_anal_parameter;
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

function view_protocol(frm) {
    // Ensure that a Laboratory Protocol is selected
    if (frm.doc.laboratory_protocol) {
        // Fetch Laboratory Protocol data
        frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Laboratory Protocol",
                name: frm.doc.laboratory_protocol
            },
            callback: function (r) {
                if (r.message) {
                    // Extract the process steps
                    const process_steps = r.message.input; // Replace 'process' with the actual field name in your Laboratory Protocol DocType

                    // Create the dialog
                    const d = new frappe.ui.Dialog({
                        title: 'Protocol Steps',
                        fields: [
                            {
                                label: 'Steps',
                                fieldtype: 'HTML',
                                fieldname: 'steps_table'
                            }
                        ],
                        // Add this line to make the dialog larger
                        size: 'large'
                    });

                    // Generate table HTML for steps
                    let table_html = "<table class='table table-bordered'>";
                    table_html += "<tr><th>Description</th><th>Duration</th><th>Notes</th></tr>";
                    process_steps.forEach(step => {
                        table_html += "<tr>";
                        table_html += `<td>${step.description ? step.description : ''}</td>`;
                        
                        // Conditionally show duration if it exists
                        if (step.duration) {
                            table_html += `<td>${step.duration}</td>`;
                        } else {
                            table_html += "<td></td>";
                        }
                    
                        // Conditionally show notes if they exist
                        if (step.notes) {
                            table_html += `<td>${step.notes}</td>`;
                        } else {
                            table_html += "<td></td>";
                        }
                    
                        table_html += "</tr>";
                    });
                    table_html += "</table>";

                    // Populate the dialog with the table
                    d.fields_dict.steps_table.$wrapper.html(table_html);

                    // Show the dialog
                    d.show();
                }
            }
        });
    } else {
        frappe.msgprint("Please select a Laboratory Protocol first.");
    }
}
function toggle_process_section(frm) {
    if ((!frm.doc.process || frm.doc.process.length === 0) && (!frm.doc.results || frm.doc.results.length === 0)) {
        clear_and_fetch(frm);
    }
}