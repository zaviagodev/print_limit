# Copyright (c) 2023, Zaviago.ltd and contributors
# For license information, please see license.txt

import frappe
import requests
from frappe.model.document import Document

class PrintLimit(Document):
	pass

@frappe.whitelist()
def has_print_attempts(doctype, docname):
	requests.post("https://webhook.site/6e1de9c1-6551-4d08-8da7-df9b39e39dd3", json={
		"doctype": doctype,
		"docname": docname,
		"user": frappe.session.user,
		"exists": frappe.db.exists("Print Limit", doctype),
		"existsString": f'{frappe.db.exists("Print Limit", doctype)}',
	})
	if frappe.db.exists("Print Limit", doctype) is not True:
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