import frappe
from print_limit.www.printview import validate_print_permission


@frappe.whitelist()
def get_print_settings_to_show(doctype, docname):
	print("//////////custom print.py//////////")
	doc = frappe.get_doc(doctype, docname)
	validate_print_permission(doc)
	print_settings = frappe.get_single("Print Settings")

	if hasattr(doc, "get_print_settings"):
		fields = doc.get_print_settings() or []
	else:
		return []

	print_settings_fields = []
	for fieldname in fields:
		df = print_settings.meta.get_field(fieldname)
		if not df:
			continue
		df.default = print_settings.get(fieldname)
		print_settings_fields.append(df)

	return print_settings_fields
