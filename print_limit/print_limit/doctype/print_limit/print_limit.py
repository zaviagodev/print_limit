# Copyright (c) 2023, Zaviago.ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class PrintLimit(Document):
	pass

@frappe.whitelist()
def has_print_attempts(doctype, docname):
	if not frappe.db.exists("Print Limit", doctype):
		return True
	
	printCount = frappe.db.count("Access Log", {
		"method": "Print",
		"export_from": doctype,
		"reference_document": docname,
		"user": frappe.session.user,
	})

	printLimit = frappe.db.get_value("Print Limit", doctype, "limit")
	if printCount >= printLimit:
		return False
	return printLimit - printCount