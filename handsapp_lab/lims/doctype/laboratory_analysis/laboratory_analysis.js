// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Analysis', {
    onload: function (frm) {
        toggle_process_section(frm);
    },
    refresh: function (frm) {
        frm.add_custom_button('Fetch Data', function () {
            clear_and_fetch(frm);
        }, __('Actions'));
        frm.add_custom_button('View Protocol', function () {
            view_protocol(frm);
        }, __('Actions'));
        frm.add_custom_button('Calculate TSS', function () {
            tss_calculations(frm);
        }, __('Calculations'));
        frm.add_custom_button('Calculate MLSS', function () {
            mlss_calculations(frm);
        }, __('Calculations'));
        frm.add_custom_button('Calculate MLVSS', function () {
            mlvss_calculations(frm);
        }, __('Calculations'));
        frm.add_custom_button('Calculate SVI', function () {
            svi_calculations(frm);
        }, __('Calculations'));
        frm.add_custom_button('Calculate BOD', function () {
            bod_calculations(frm);
        }, __('Calculations'));
        frm.add_custom_button('Calculate TKN', function () {
            tkn_calculations(frm);
        }, __('Calculations'));

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
        $(frm.fields_dict['laboratory_protocol'].label_area).click(function () {
            view_protocol(frm);
        });
    },
    laboratory_protocol: function (frm) {
        clear_and_fetch(frm);
    },
    analysis_start: function (frm) {
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
    before_submit: function (frm) {
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
            dialog.fields_dict.status_buttons.$wrapper.on('click', '.status-btn', function () {
                let status = $(this).data('status');
                set_status_and_save(status);
            });
            dialog.show();
        } else {
            if (frm.doc.laboratory_team.length === 0) {
                frappe.throw(__('Please add at least one team member in the Laboratory Team table before submitting'));
            }
        }
    }
});

var clear_and_fetch = function (frm) {
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
            callback: function (r) {
                if (r.message) {
                    // copy process steps from Laboratory Protocol to Laboratory Analysis
                    r.message.procedure.forEach(function (row) {
                        let child_row = frappe.model.add_child(frm.doc, "Process", "process");
                        child_row.description = row.description;
                        child_row.action_var = row.action_var;
                        child_row.uom = row.uom;
                        // add other fields as necessary
                    });
                    // copy outputs from Laboratory Protocol to Laboratory Analysis
                    r.message.output.forEach(function (row) {
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

function tss_calculations(frm) {
    // Object to store weights and volumes
    let weights = {};
    let vs;

    // Iterate over the child table entries
    frm.doc.process.forEach(function (entry) {
        // Extract and store weights based on the action_var
        if (entry.action_var && entry.action_var.includes('w1') || entry.action_var.includes('w2')) {
            weights[entry.action_var] = entry.quantity;
        }
        // Assuming Vs is also in the child table, otherwise adjust accordingly
        if (entry.action_var === 'vs') {
            vs = entry.quantity;
        }
    });

    // Check if Vs is not undefined or zero to avoid division by zero
    if (vs === undefined || vs === 0) {
        frappe.msgprint(__('Vs must be defined and non-zero.'));
        return;
    }

    // Function to calculate TSS and add a new row
    const calculate_and_add_row = (w1, w2, index) => {
        let tss = ((w2 - w1) / vs) * 1000000; // Convert to mg/L
        let child = frm.add_child('process');
        child.description = `TSS-${index}`;
        child.action_var = `TSS-${index}`;
        child.quantity = tss;
        child.uom = 'mg/L';
        return tss;
    };

    // Variables for average and standard deviation calculation
    let tss_values = [];
    let total_tss = 0;

    // Calculate TSS for each set of weights
    for (let i = 1; i <= 3; i++) {
        let w1 = weights[`w1-${i}`];
        let w2 = weights[`w2-${i}`];

        // Ensure both weights are present
        if (w1 !== undefined && w2 !== undefined) {
            let tss = calculate_and_add_row(w1, w2, i);
            tss_values.push(tss);
            total_tss += tss;
        }
    }

    // Only proceed if there are TSS values
    if (tss_values.length) {
        // Calculate average TSS
        let average_tss = total_tss / tss_values.length;
        frm.add_child('process', {
            description: 'TSS-Average',
            action_var: 'TSS-bar',
            quantity: average_tss,
            uom: 'mg/L'
        });

        // Calculate standard deviation
        let variance = tss_values.reduce((acc, val) => acc + Math.pow(val - average_tss, 2), 0) / tss_values.length;
        let std_deviation = Math.sqrt(variance);

        frm.add_child('process', {
            description: 'TSS-Standard Deviation',
            action_var: 'TSS-SD',
            quantity: std_deviation,
            uom: 'mg/L'
        });
    }

    // Refresh the child table to show new rows
    frm.refresh_field('process');

}

function mlss_calculations(frm) {
    // Object to store weights
    let weights = {};
    let vs; // Volume in mL

    // Iterate over the child table entries
    frm.doc.process.forEach(function (entry) {
        // Extract and store weights based on the action_var
        if (entry.action_var && (entry.action_var.includes('w1') || entry.action_var.includes('w2'))) {
            weights[entry.action_var] = entry.quantity;
        }
        // Check for the volume field 'vs'
        if (entry.action_var === 'vs') {
            vs = entry.quantity;
        }
    });

    // Check if Vs is not undefined or zero to avoid division by zero
    if (vs === undefined || vs === 0) {
        frappe.msgprint(__('vs must be defined and non-zero.'));
        return;
    }

    // Function to calculate MLSS and add a new row
    const calculate_and_add_row = (w1, w2, index) => {
        let mlss = ((w2 - w1) / vs) * 1000000; // Result is in mg/mL
        let child = frm.add_child('process');
        child.description = `MLSS-${index}`;
        child.action_var = `MLSS-${index}`;
        child.quantity = mlss;
        child.uom = 'mg/L';
        return mlss;
    };

    // Variables for average and standard deviation calculation
    let mlss_values = [];
    let total_mlss = 0;

    // Calculate MLSS for each set of weights
    for (let i = 1; i <= 3; i++) {
        let w1 = weights[`w1-${i}`];
        let w2 = weights[`w2-${i}`];

        // Ensure both weights are present
        if (w1 !== undefined && w2 !== undefined) {
            let mlss = calculate_and_add_row(w1, w2, i);
            mlss_values.push(mlss);
            total_mlss += mlss;
        }
    }

    // Only proceed if there are MLSS values
    if (mlss_values.length) {
        // Calculate average MLSS
        let average_mlss = total_mlss / mlss_values.length;
        frm.add_child('process', {
            description: 'MLSS-Average',
            action_var: 'MLSS-bar',
            quantity: average_mlss,
            uom: 'mg/L'
        });

        // Calculate standard deviation
        let variance = mlss_values.reduce((acc, val) => acc + Math.pow(val - average_mlss, 2), 0) / mlss_values.length;
        let std_deviation = Math.sqrt(variance);

        frm.add_child('process', {
            description: 'MLSS-Standard Deviation',
            action_var: 'MLSS-sd',
            quantity: std_deviation,
            uom: 'mg/L'
        });
    }

    // Refresh the child table to show new rows
    frm.refresh_field('process');
}

function mlvss_calculations(frm) {
    // Object to store weights
    let weights = {};
    let vs; // Volume in mL

    // Iterate over the child table entries
    frm.doc.process.forEach(function (entry) {
        // Extract and store weights based on the action_var
        if (entry.action_var && (entry.action_var.includes('w2') || entry.action_var.includes('w3'))) {
            weights[entry.action_var] = entry.quantity;
        }
        // Check for the volume field 'vs'
        if (entry.action_var === 'vs') {
            vs = entry.quantity;
        }
    });

    // Check if vs is not undefined or zero to avoid division by zero
    if (vs === undefined || vs === 0) {
        frappe.msgprint(__('vs must be defined and non-zero.'));
        return;
    }

    // Function to calculate MLVSS and add a new row
    const calculate_and_add_row = (w2, w3, index) => {
        let mlvss = ((w2 - w3) / vs) * 1000000; // Result is in mg/mL
        let child = frm.add_child('process');
        child.description = `MLVSS-${index}`;
        child.action_var = `MLVSS-${index}`;
        child.quantity = mlvss;
        child.uom = 'mg/L';
        return mlvss;
    };

    // Variables for average and standard deviation calculation
    let mlvss_values = [];
    let total_mlvss = 0;

    // Calculate MLVSS for each set of weights
    for (let i = 1; i <= 3; i++) {
        let w2 = weights[`w2-${i}`];
        let w3 = weights[`w3-${i}`];

        // Ensure both weights are present
        if (w2 !== undefined && w3 !== undefined) {
            let mlvss = calculate_and_add_row(w2, w3, i);
            mlvss_values.push(mlvss);
            total_mlvss += mlvss;
        }
    }

    // Only proceed if there are MLVSS values
    if (mlvss_values.length) {
        // Calculate average MLVSS
        let average_mlvss = total_mlvss / mlvss_values.length;
        frm.add_child('process', {
            description: 'MLVSS-Average',
            action_var: 'MLVSS-bar',
            quantity: average_mlvss,
            uom: 'mg/L'
        });

        // Calculate standard deviation
        let variance = mlvss_values.reduce((acc, val) => acc + Math.pow(val - average_mlvss, 2), 0) / mlvss_values.length;
        let std_deviation = Math.sqrt(variance);

        frm.add_child('process', {
            description: 'MLVSS-Standard Deviation',
            action_var: 'MLVSS-sd',
            quantity: std_deviation,
            uom: 'mg/L'
        });
    }

    // Refresh the child table to show new rows
    frm.refresh_field('process');
}
function bod_calculations(frm) {
    let bod_values = [];
    // Iterate over the child table entries to collect BOD values
    frm.doc.process.forEach(function (entry) {
        // Assuming the action_var is set to 'BOD' for the entries we are interested in
        if (entry.action_var && entry.action_var.startsWith('BOD')) {
            bod_values.push(entry.quantity);
        }
    });

    // Only proceed if there are enough BOD values
    if (bod_values.length === 3) {
        // Calculate average BOD
        let total_bod = bod_values.reduce((a, b) => a + b, 0);
        let average_bod = total_bod / bod_values.length;
        frm.add_child('process', {
            description: 'BOD<sub>5</sub>-Average',
            action_var: 'BOD<sub>5</sub>-bar',
            quantity: average_bod,
            uom: 'mg/L'
        });

        // Calculate standard deviation
        let variance = bod_values.reduce((acc, val) => acc + Math.pow(val - average_bod, 2), 0) / bod_values.length;
        let std_deviation = Math.sqrt(variance);

        frm.add_child('process', {
            description: 'BOD<sub>5</sub>-Standard Deviation',
            action_var: 'BOD<sub>5</sub>-sd',
            quantity: std_deviation,
            uom: 'mg/L'
        });

        // Refresh the child table to show new rows
        frm.refresh_field('process');
    } else {
        frappe.msgprint(__('There must be exactly three BOD entries to calculate average and standard deviation.'));
    }
}

function svi_calculations(frm) {
    let ss, mlss, vs;

    // Iterate over the child table entries to find SS, MLSS, and vs
    frm.doc.process.forEach(function (entry) {
        if (entry.action_var === 'SS') {
            ss = entry.quantity; // Assuming the SS value is stored in the quantity field
        }
        if (entry.action_var === 'MLSS') {
            mlss = entry.quantity; // Assuming the MLSS value is stored in the quantity field
        }
        if (entry.action_var === 'vs') {
            vs = entry.quantity; // Assuming the vs value is stored in the quantity field
        }
    });

    // Check if SS, MLSS, and vs are not undefined or zero to avoid division by zero
    if (ss === undefined || mlss === undefined || vs === undefined || ss === 0 || mlss === 0 || vs === 0) {
        frappe.msgprint(__('SS, MLSS, and vs must be defined and non-zero.'));
        return;
    }

    // Calculate SVI
    let svi = 1000 * (ss / vs) / mlss; // Result is in mL/g

    // Add a new row to the child table for SVI
    let child = frm.add_child('process');
    child.description = 'SVI';
    child.action_var = 'SVI';
    child.quantity = svi;
    child.uom = 'mL/g';

    // Refresh the child table to show the new SVI row
    frm.refresh_field('process');
}

function tkn_calculations(frm) {
    let total_nitrogen, no3, no2;

    // Iterate over the child table entries to find Total Nitrogen, [NO3], and [NO2]
    frm.doc.process.forEach(function (entry) {
        if (entry.action_var === 'TN<sub>b</sub>') {
            total_nitrogen = entry.quantity; // Assuming the Total Nitrogen value is stored in the quantity field
        }
        if (entry.action_var === '[NO<sub>3</sub>]') {
            no3 = entry.quantity; // Assuming the [NO3] value is stored in the quantity field
        }
        if (entry.action_var === '[NO<sub>2</sub>]') {
            no2 = entry.quantity; // Assuming the [NO2] value is stored in the quantity field
        }
    });

    // Check if Total Nitrogen, [NO3], and [NO2] are not undefined
    if (total_nitrogen === undefined || no3 === undefined || no2 === undefined) {
        frappe.msgprint(__('Total Nitrogen, [NO3], and [NO2] must be defined.'));
        return;
    }

    // Calculate TKN
    let tkn = total_nitrogen - (no3 + no2); // Result is in mg/L

    // Add a new row to the child table for TKN
    let child = frm.add_child('process');
    child.description = 'TKN';
    child.action_var = 'TKN';
    child.quantity = tkn;
    child.uom = 'mg/L';

    // Refresh the child table to show the new TKN row
    frm.refresh_field('process');
}
