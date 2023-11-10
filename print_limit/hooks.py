from . import __version__ as app_version

app_name = "print_limit"
app_title = "Print Limit"
app_publisher = "Zaviago.ltd"
app_description = "Limit the number of times a Role OR a user can perint a document."
app_email = "john@zaviago.com"
app_license = "MIT"

# Includes in <head>
# ------------------

# include js, css files in header of desk.html
# app_include_css = "/assets/print_limit/css/print_limit.css"
app_include_js = ["/assets/print_limit/js/frappe/form/toolbar.js"]

# include js, css files in header of web template
# web_include_css = "/assets/print_limit/css/print_limit.css"
# web_include_js = "/assets/print_limit/js/print_limit.js"

# include custom scss in every website theme (without file extension ".scss")
# website_theme_scss = "print_limit/public/scss/website"

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

# Jinja
# ----------

# add methods and filters to jinja environment
# jinja = {
#	"methods": "print_limit.utils.jinja_methods",
#	"filters": "print_limit.utils.jinja_filters"
# }

# Installation
# ------------

# before_install = "print_limit.install.before_install"
# after_install = "print_limit.install.after_install"

# Uninstallation
# ------------

# before_uninstall = "print_limit.uninstall.before_uninstall"
# after_uninstall = "print_limit.uninstall.after_uninstall"

# Desk Notifications
# ------------------
# See frappe.core.notifications.get_notification_config

# notification_config = "print_limit.notifications.get_notification_config"

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

# Scheduled Tasks
# ---------------

# scheduler_events = {
#	"all": [
#		"print_limit.tasks.all"
#	],
#	"daily": [
#		"print_limit.tasks.daily"
#	],
#	"hourly": [
#		"print_limit.tasks.hourly"
#	],
#	"weekly": [
#		"print_limit.tasks.weekly"
#	],
#	"monthly": [
#		"print_limit.tasks.monthly"
#	],
# }

# Testing
# -------

# before_tests = "print_limit.install.before_tests"

# Overriding Methods
# ------------------------------
#
override_whitelisted_methods = {
	"frappe.printing.page.print.print.get_print_settings_to_show": "print_limit.print_limit.page.print.print.get_print_settings_to_show",
	"print_limit.has_print_attempts": "print_limit.print_limit.doctype.print_limit.print_limit.has_print_attempts"
}
#
# each overriding function accepts a `data` argument;
# generated from the base implementation of the doctype dashboard,
# along with any modifications made in other Frappe apps
# override_doctype_dashboards = {
#	"Task": "print_limit.task.get_dashboard_data"
# }

# exempt linked doctypes from being automatically cancelled
#
# auto_cancel_exempted_doctypes = ["Auto Repeat"]

# Ignore links to specified DocTypes when deleting documents
# -----------------------------------------------------------

ignore_links_on_delete = ["DocType"]

# Request Events
# ----------------
# before_request = ["print_limit.utils.before_request"]
# after_request = ["print_limit.utils.after_request"]

# Job Events
# ----------
# before_job = ["print_limit.utils.before_job"]
# after_job = ["print_limit.utils.after_job"]

# User Data Protection
# --------------------

# user_data_fields = [
#	{
#		"doctype": "{doctype_1}",
#		"filter_by": "{filter_by}",
#		"redact_fields": ["{field_1}", "{field_2}"],
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_2}",
#		"filter_by": "{filter_by}",
#		"partial": 1,
#	},
#	{
#		"doctype": "{doctype_3}",
#		"strict": False,
#	},
#	{
#		"doctype": "{doctype_4}"
#	}
# ]

# Authentication and authorization
# --------------------------------

# auth_hooks = [
#	"print_limit.auth.validate"
# ]
