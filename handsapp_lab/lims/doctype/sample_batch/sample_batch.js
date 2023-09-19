// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Sample Batch', {
    refresh: function(frm) {
        // Add a custom button to the form
        frm.add_custom_button('Create Laboratory Samples', function() {
			create_laboratory_samples(frm);
			frm.save()
        });
    },
	sample_batch: function(frm) {
        fetch_and_set_template_items(frm);
    }
});

function fetch_and_set_template_items(frm) {
    // Clear existing rows in the child table
    frm.clear_table('smpl_btch_items');

    // Fetch the selected Sample Batch Template details
	if(frm.doc.sample_batch){
		frappe.model.with_doc('Sample Batch Template', frm.doc.sample_batch, function() {
			let batch_template = frappe.model.get_doc('Sample Batch Template', frm.doc.sample_batch);
	
			// Loop through each item in the Sample Batch Template Item table and add to the Sample Batch's child table
			$.each(batch_template.template_item, function(index, row) {
				let d = frm.add_child('smpl_btch_items');
				d.smpl_template = row.laboratory_sample_template;
				// Add other fields if needed
			});
			frm.refresh_field('smpl_btch_items');
		});
	}
}

function create_laboratory_samples(frm) {
    let promises = [];

    $.each(frm.doc.smpl_btch_items, function(index, row) {
        if (!row.lab_sample) {
            // If the lab_sample field is empty, create a new Laboratory Sample record
            promises.push(
                frappe.call({
                    method: 'frappe.client.insert',
                    args: {
                        doc: {
                            doctype: 'Laboratory Sample',
                            date: frm.doc.smpl_date,
                            field_conditions: frm.doc.field_conditions,
                            smpl_btch: frm.doc.name,
                            template: row.smpl_template
                        }
                    }
                }).then((response) => {
                    // Use frappe.model.set_value to set the new Laboratory Sample's name in the lab_sample field
                    frappe.model.set_value(row.doctype, row.name, 'lab_sample', response.message.name);
                })
            );
        }
    });

    $.when.apply($, promises).then(function() {
        frm.refresh_field('smpl_btch_items');
		//frm.save()
        //frappe.msgprint('Laboratory Samples created successfully!');
    });
}
