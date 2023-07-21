// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Equipment Maintenance', {
	validate:function(frm){
	    var days = 0;
	    var d = flt(cur_frm.doc.maintenance_frequency_no);
	    switch (frm.doc.maintenance_frequency){
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
	    cur_frm.set_value("mnt_next", frappe.datetime.add_days(cur_frm.doc.mnt_date, days));
	}
});