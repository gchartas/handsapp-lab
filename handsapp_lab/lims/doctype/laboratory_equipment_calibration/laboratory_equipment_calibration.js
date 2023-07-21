// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Equipment Calibration', {
	validate: function(frm){
	    var days = 0;
	    var d = flt(cur_frm.doc.calibration_frequency_no);
	    switch (frm.doc.calibration_frequency){
	        case 'Yearly':
	            days = 365/d;
	            break;
	        case 'Monthly':
	            days = 30/d;
	            break;
	        case 'Weekly':
	            days = 7/d;
	            break;
	        case 'Daily':
	            days = 1;
	    }
	    cur_frm.set_value("next_calibration_date", frappe.datetime.add_days(cur_frm.doc.calibration_date, days));
	},
	template: function(frm){
	    // this function is called when the 'calibration_template' field value changes
	    if(cur_frm.doc.template){
	        get_from_template(frm);
	    }
	    else {
	        cur_frm.clear_table("parameters");
	        cur_frm.refresh_fields();
	    }
	},
	responsible_party:function(frm){
	    get_responsibility(frm);
	}
});

var get_from_template = function(frm){
    frappe.call({
        "method":"frappe.client.get",
        args:{
            doctype:"Lab Equipment Calibration Template",
            name: frm.doc.template
            
        },
        callback: function(data){
            cur_frm.clear_table("parameters");
            cur_frm.refresh_fields();
            for (var i in data.message.parameters){
                frm.add_child("parameters");
                frm.fields_dict.parameters.get_value()[i].parameter = data.message.parameters[i].parameter;
                frm.fields_dict.parameters.get_value()[i].uom = data.message.parameters[i].uom;
                frm.fields_dict.parameters.get_value()[i].expected_value = data.message.parameters[i].expected_value;
                frm.fields_dict.parameters.get_value()[i].tolerance = data.message.parameters[i].tolerance;
                
            }
        }
        
    });
    frm.refresh();
    cur_frm.save();
};
var get_responsibility = function(frm){
    if(frm.doc.responsibility=="User"){
        frappe.call({
            "method": "frappe.client.get",
            args: {
                doctype: "User",
                name: frm.doc.responsible_party
            },
            callback:function (data) {
                var childTable = frm.add_child('signee_details');
                childTable.role = data.message.role_profile_name;
                childTable.full_name = data.message.full_name;
                
                frm.refresh_field('signee_details');
            }
        });
        frm.refresh();
    } else if(frm.doc.responsibility=="Supplier"){
        frm.toggle_display(['inhouse_calibration_section', 'signatures_section', 'document_details_section'], false);
    }
};

frappe.ui.form.on('Laboratory Equipment Calibration Parameters', {
	value_1: function(frm,cdt,cdn){
	    updateParameterStatus(frm,cdt,cdn);
	},
	value_2: function(frm,cdt,cdn){
	    updateParameterStatus(frm,cdt,cdn);
	},
	value_3: function(frm,cdt,cdn){
	    updateParameterStatus(frm,cdt,cdn);
	}
});
function updateParameterStatus(frm, cdt, cdn) {
    const row = locals[cdt][cdn];
    const absolute_difference_1 = Math.abs(row.value_1 - row.expected_value);
    const absolute_difference_2 = Math.abs(row.value_2 - row.expected_value);
    const absolute_difference_3 = Math.abs(row.value_3 - row.expected_value);
    const max_difference = Math.max(absolute_difference_1, absolute_difference_2, absolute_difference_3);
    if (max_difference <= row.tolerance) {
        frappe.model.set_value(cdt, cdn, 'status', 'Pass');
    } else{
        frappe.model.set_value(cdt, cdn, 'status', 'Fail');
    }
    // Check overall calibration status when any field in the child table is changed
    const all_pass = frm.doc.parameters.every(parameter => parameter.status === 'Pass');
    frm.doc.calibration_status = all_pass ? 'Calibrated' : 'Out of Service';
    frm.refresh_field('calibration_status');
}
