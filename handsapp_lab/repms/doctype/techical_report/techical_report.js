// Copyright (c) 2023, George Chartas and contributors
// For license information, please see license.txt

frappe.ui.form.on('Techical Report', {
    onload:function(frm){
        krufopoutsa(frm);
    },
	refresh: function(frm) {
        // Add a button on the form to hide empty fields
        frm.add_custom_button(__('Hide Empty Fields'), function() {
            // Iterate through all fields in the form
            krufopoutsa(frm);
            // Refresh the form to apply changes
            frm.refresh();
        });

        // Add a button on the form to show all fields
        frm.add_custom_button(__('Show All Fields'), function() {
            // Iterate through all fields in the form
            $.each(frm.fields_dict, function(fieldname, field) {
                // Show the field in the form
                frm.set_df_property(fieldname, 'hidden', 0);
                // Allow the field to be printed
                frm.set_df_property(fieldname, 'print_hide', 0);
            });
            // Refresh the form to apply changes
            frm.refresh();
        });
    }
});

var krufopoutsa = function(frm){
    if(!frm.doc.abstract){
        //alert('poutanakiaaaa');
        frm.set_df_property("abstract", 'hidden', 1);
        frm.set_df_property("abstract", 'print_hide', 1);
    }
    if(!frm.doc.introduction){
        //alert('poutanakiaaaa');
        frm.set_df_property("introduction", 'hidden', 1);
        frm.set_df_property("introduction", 'print_hide', 1);
    }
    if(!frm.doc.literature_review){
        //alert('poutanakiaaaa');
        frm.set_df_property("literature_review", 'hidden', 1);
        frm.set_df_property("literature_review", 'print_hide', 1);
    }
    if(!frm.doc.methodology){
        //alert('poutanakiaaaa');
        frm.set_df_property("methodology", 'hidden', 1);
        frm.set_df_property("methodology", 'print_hide', 1);
    }
    if(!frm.doc.results){
        //alert('poutanakiaaaa');
        frm.set_df_property("results", 'hidden', 1);
        frm.set_df_property("results", 'print_hide', 1);
    }
    if(!frm.doc.discussion){
        //alert('poutanakiaaaa');
        frm.set_df_property("discussion", 'hidden', 1);
        frm.set_df_property("discussion", 'print_hide', 1);
    }
    if(!frm.doc.conclusions){
        //alert('poutanakiaaaa');
        frm.set_df_property("conclusions", 'hidden', 1);
        frm.set_df_property("conclusions", 'print_hide', 1);
    }
};