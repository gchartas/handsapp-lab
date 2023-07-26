frappe.ui.form.on('Library Management', {
	onload:function(frm){
	    relevant_section(frm);
	},
	doc_type:function(frm){
	    relevant_section(frm);
	},
	author:function(frm){
	    // Triggered when an author is added or removed in the multiselect field
	    concatenate_authors(frm);
	},
	refresh:function(frm){
	    frm.add_custom_button(__('Generate IEEE Citation'), function() {
	        generateIeeeCitation(frm.doc);
        });
	},
	before_save:function(frm){
	    generateIeeeCitation(frm.doc);
	}
});

var concatenate_authors = function(frm){
    // Get the selected author names
    var authorNames = [];
    frm.doc.author.forEach(function(author) {
        authorNames.push(author.author);
    });
    // Set the concatenated author names in a separate field
    frm.set_value('concatenated_authors', authorNames.join(', '));
};

var relevant_section = function(frm){
    // Hide all sections
    frm.toggle_display(['standard_section', 'book_section', 'report_section', 'legislation_section', 'paper_section','court_decision_section', 'government_body_decision_section', 'regional_public_sector_section'], false);
    // Show section based on selected document type
    switch (frm.doc.doc_type){
        case 'Standard':
            frm.toggle_display('standard_section', true);
            break;
        case 'Book':
            frm.toggle_display('book_section', true);
            break;
        case 'Report':
            frm.toggle_display('report_section', true);
            break;
        case 'Legislation':
            frm.toggle_display('legislation_section', true);
            break;
        case 'Research Paper':
            frm.toggle_display('paper_section', true);
            break;
        case 'Court Decision':
            frm.toggle_display('court_decision_section', true);
            break;
        case 'Government Body Decision':
            frm.toggle_display('government_body_decision_section', true);
            break;
    }
};
function generateIeeeCitation(doc) {
    var citation = "";

    // Generate citation based on document type
    switch (doc.doc_type) {
        case 'Standard':
            citation = generateCitationLine(["<i>"+doc.title+"</i>", doc.standard_number, moment(doc.posting_date).format("YYYY") ]);
            break;
        case 'Book':
            citation = generateCitationLine([doc.concatenated_authors, "<i>"+doc.title+"</i>", doc.edition, doc.city_country, doc.publisher, moment(doc.posting_date).format("YYYY")]);
            break;
        case 'Report':
            citation = generateCitationLine([doc.concatenated_authors, "<i>"+doc.title+"</i>", doc.r_no, doc.inst_org]);
            break;
        case 'Legislation':
            citation = generateCitationLine([doc.official_gazette, moment(doc.posting_date).format("DD.MM.YYYY"), doc.law_number, "<i>"+doc.title+"</i>", doc.reference_number, doc.m_a ]);
            break;
        case 'Research Paper':
            citation = generateCitationLine([doc.concatenated_authors, "<i>"+doc.title+"</i>", doc.c_jn, doc.volumeissue, doc.page_numbers, moment(doc.posting_date).format("MMM YYYY") ]);
            break;
        case 'Court Decision':
            citation = generateCitationLine([doc.case_name, doc.case_number, doc.court_name, moment(doc.decision_date).format("YYYY") ]);
            break;
        case 'Government Body Decision':
            citation = generateCitationLine([doc.jurisdiction, "<i>"+doc.title+"</i>", doc.docket_number, moment(doc.posting_date).format("YYYY")]);
            break;
    }

    //frappe.msgprint(citation);
    frappe.model.set_value(doc.doctype, doc.name, 'citation', citation);
}
function generateCitationLine(fields) {
    var filteredFields = fields.filter(field => field !== undefined && field !== null && field !== "");

    return filteredFields.join(", ");
}
