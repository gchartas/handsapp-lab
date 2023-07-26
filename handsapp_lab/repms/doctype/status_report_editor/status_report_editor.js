// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Status Report Editor', {
    refresh: function(frm) {
        task_filtering(frm);
    },
    
    type: function(frm){
        if (frm.doc.st_rep_date){
            set_dates(frm);
        }
    },
    st_rep_date: function(frm){
        if (frm.doc.type){
            set_dates(frm);
        }
    },
    before_submit: function(frm){
        // Check if 'sig' field is empty
        if (!frm.doc.author_sig) {
            // Hide 'sig' field
            frm.toggle_display('author_sig', false);
            frm.set_df_property('author_sig', 'print_hide', 1);
        } else {
            // Show 'sig' field
            frm.toggle_display('author_sig', true);
            frm.set_df_property('author_sig', 'print_hide', 0);
        }
        if (!frm.doc.reviewer_sig){
            frm.toggle_display('reviewer_sig', false);
            frm.set_df_property('reviewer_sig', 'print_hide', 1);
        } else {
            frm.toggle_display('reviewer_sig', true);
            frm.set_df_property('reviewer_sig', 'print_hide', 0);
        }
    }
});

var task_filtering = function(frm){
    frm.fields_dict['completed_tasks'].grid.get_field('task').get_query = function(doc, cdt, cdn) {
        let selected_tasks = [];
        $.each(frm.doc.completed_tasks || [], function(i, d) {
            if(d.task) {
                selected_tasks.push(d.task);
            }
        });
        return {
            filters: {
                'status': 'Completed',
                'completed_by': doc.report_user,
                'completed_on': ['>=', doc.from_date, '<=', doc.to_date],
                'name': ['not in', selected_tasks]
            }
        };
    };
    frm.fields_dict['in_progress_tasks'].grid.get_field('task').get_query = function(doc, cdt, cdn) {
        let selected_tasks2 = [];
        $.each(frm.doc.in_progress_tasks || [], function(i, d) {
            if(d.task) {
                selected_tasks2.push(d.task);
            }
        });
        return {
            filters: {
                'status': 'Working',
                //'assigned_to': doc.report_user,
                //'completed_on': ['>=', doc.from_date, '<=', doc.to_date]
                'name': ['not in', selected_tasks2]
            }
        };
    };
    frm.fields_dict['upcoming_tasks'].grid.get_field('task').get_query = function(doc, cdt, cdn) {
        let selected_tasks2 = [];
        $.each(frm.doc.upcoming_tasks || [], function(i, d) {
            if(d.task) {
                selected_tasks3.push(d.task);
            }
        });
        return {
            filters: {
                'status': 'Open',
                //'assigned_to': doc.report_user,
                //'completed_on': ['>=', doc.from_date, '<=', doc.to_date]
            }
        };
    };
    
};

var set_dates = function(frm){
    switch (frm.doc.type) {
        case 'Daily':
            frm.set_value('from_date', frm.doc.st_rep_date);
            frm.set_value('to_date', frm.doc.st_rep_date);
            frm.set_df_property('from_date', 'read_only', 1);
            frm.set_df_property('to_date', 'read_only', 1);
            break;
        case 'Weekly':
            // Subtract 7 days from report_date for 'from_date'
            let wfrDate = frappe.datetime.add_days(frm.doc.st_rep_date, -7);
            frm.set_value('from_date', wfrDate );
            frm.set_value('to_date', frm.doc.st_rep_date);
            frm.set_df_property('from_date', 'read_only', 1);
            frm.set_df_property('to_date', 'read_only', 1);
            break;
        case 'Monthly':
            // Go to the First of the Month
            let toDate = new Date(frm.doc.st_rep_date);
            let frDate = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
            frm.set_value('to_date', toDate);
            frm.set_value('from_date', frDate);
            frm.set_df_property('from_date', 'read_only', 1);
            frm.set_df_property('to_date', 'read_only', 1);
            break;        
        case 'Custom':
            frm.set_df_property('from_date', 'read_only', 0);
            frm.set_df_property('to_date', 'read_only', 0);
            break;
    }
};