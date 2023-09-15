frappe.listview_settings['Laboratory Analysis'] = {
    filters: [
        ["analysis_status","!=","Completed"],
        ["analysis_status","!=","Failed"]
    ]
};

// Analysis Status