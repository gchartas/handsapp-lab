from . import __version__ as app_version

app_name = "handsapp_lab"
app_title = "HandSApp Laboratory"
app_publisher = "George Chartas"
app_description = "Laboratory Information Management"
app_icon = "octicon octicon-file-directory"
app_color = "blue"
app_email = "gchartas@englandgr.com"
app_license = "MIT"

# Includes in <head>
# ------------------


# include js, css files in header of desk.html
# app_include_css = "/assets/handsapp_lab/css/handsapp_lab.css"
# app_include_js = "/assets/handsapp_lab/js/handsapp_lab.js"

# app_include_js = "assets/js/handsapp_lab.min.js"

# include js, css files in header of web template
# web_include_css = "/assets/handsapp_lab/css/handsapp_lab.css"
# web_include_js = "/assets/handsapp_lab/js/handsapp_lab.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "handsapp_lab/public/scss/website"

# include js, css files in header of web form
# webform_include_js = {"doctype": "public/js/doctype.js"}
# webform_include_css = {"doctype": "public/css/doctype.css"}

# include js in page
# page_js = {"page" : "public/js/file.js"}

# include js in doctype views
# doctype_js = {"doctype" : "public/js/doctype.js"}
# doctype_list_js = {"doctype" : "public/js/doctype_list.js"}
# doctype_tree_js = {"doctype" : "public/js/doctype_tree.js"}
# doctype_calendar_js = {"doctype" : "public/js/doctype_calendar.js"}

# Home Pages
# ----------

# application home page (will override Website Settings)
# home_page = "login"

# website user home page (by Role)
# role_home_page = {
#	"Role": "home_page"
# }

# Generators
# ----------

# automatically create page for each record of this doctype
# website_generators = ["Web Page"]

# Installation
# ------------

# before_install = "handsapp_lab.install.before_install"
# after_install = "handsapp_lab.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "handsapp_lab.uninstall.before_uninstall"
# after_uninstall = "handsapp_lab.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "handsapp_lab.notifications.get_notification_config"

# Permissions
# -----------
# Permissions evaluated in scripted ways

# permission_query_conditions = {
#	"Event": "frappe.desk.doctype.event.event.get_permission_query_conditions",
# }
#
# has_permission = {
#	"Event": "frappe.desk.doctype.event.event.has_permission",
# }

# DocType Class
# ---------------
# Override standard doctype classes

# override_doctype_class = {
#	"ToDo": "custom_app.overrides.CustomToDo"
# }

# Document Events
# ---------------
# Hook on document methods and events

# doc_events = {
#	"*": {
#		"on_update": "method",
#		"on_cancel": "method",
#		"on_trash": "method"
#	}
# }

doc_events = {
    "Laboratory Equipment Calibration": {
        "on_submit": "handsapp_lab.lims.doctype.laboratory_equipment_calibration.laboratory_equipment_calibration.update_linked_equipment"
    },
    "Laboratory Equipment Maintenance": {
        "on_submit": "handsapp_lab.lims.doctype.laboratory_equipment_maintenance.laboratory_equipment_maintenance.update_linked_equipment"
    },

}


# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"handsapp_lab.tasks.all"
#	],
#	"daily": [
#		"handsapp_lab.tasks.daily"
#	],
#	"hourly": [
#		"handsapp_lab.tasks.hourly"
#	],
#	"weekly": [
#		"handsapp_lab.tasks.weekly"
#	]
#	"monthly": [
#		"handsapp_lab.tasks.monthly"
#	]
# }

# Testing
# -------

# before_tests = "handsapp_lab.install.before_tests"

# Overriding Methods
# ------------------------------
#
# override_whitelisted_methods = {
#	"frappe.desk.doctype.event.event.get_events": "handsapp_lab.event.get_events"
# }
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "handsapp_lab.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Request Events
# ----------------
# before_request = ["handsapp_lab.utils.before_request"]
# after_request = ["handsapp_lab.utils.after_request"]

# Job Events
# ----------
# before_job = ["handsapp_lab.utils.before_job"]
# after_job = ["handsapp_lab.utils.after_job"]

# User Data Protection
# --------------------

user_data_fields = [
	{
		"doctype": "{doctype_1}",
		"filter_by": "{filter_by}",
		"redact_fields": ["{field_1}", "{field_2}"],
		"partial": 1,
	},
	{
		"doctype": "{doctype_2}",
		"filter_by": "{filter_by}",
		"partial": 1,
	},
	{
		"doctype": "{doctype_3}",
		"strict": False,
	},
	{
		"doctype": "{doctype_4}"
	}
]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"handsapp_lab.auth.validate"
# ]

fixtures = ['Translation', 'Letter Head'] # Add other DocTypes if needed




