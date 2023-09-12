frappe.treeview_settings['CPV'] = {
    onload: function (treeview) {
        //alert("who is the man");
        treeview.get_tree_root().on('render_label', function (node) {
            let data = node.data;
            
            if (data.cpv_status == 'Active') {
                //alert("You are the man");
                $(node.$el).find('.tree-label').css('color', 'green');
            }
        });
        
    }
};
