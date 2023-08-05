// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Laboratory Protocol', {
    set_dates: function(frm) {
        // Set the publish_date to today
        frm.set_value('publish_date', frappe.datetime.now_date());
    },
    publish_date: function(frm){
        var p_date = new Date(frm.doc.publish_date);
        var tyfpd = new Date(p_date.setFullYear(p_date.getFullYear() + 3));
        frm.set_value('review_date', tyfpd);
    },
    validate: function(frm) {
        //alert('Poutanes FTW');
        let total_time = 0.0;
        $.each(frm.doc.input || [], function(i, d) {
            if(d.duration) { // Check if time is not null or undefined
                //alert(d.duration);
                total_time += d.duration; // Ensuring the time is treated as a float number
            }
        });
        //alert(total_time);
        frm.set_value('total_time', total_time);
    }
});