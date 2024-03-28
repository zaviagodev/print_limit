(() => {
  // ../print_limit/print_limit/public/js/frappe/form/toolbar.js
  frappe.ui.form.Toolbar = class CustomToolbar {
    constructor(opts) {
      $.extend(this, opts);
      this.refresh();
      this.add_update_button_on_dirty();
      this.setup_editable_title();
    }
    async refresh() {
      if (!(window.location.pathname.startsWith("/app/data-import") || window.location.pathname.startsWith("/app/data-export") || window.location.pathname.startsWith("/app/customize-form"))) {
        await this.has_print_attempts(this.frm.doctype, this.frm.docname);
      }
      this.make_menu();
      this.make_viewers();
      this.set_title();
      this.page.clear_user_actions();
      this.show_title_as_dirty();
      this.set_primary_action();
      if (this.frm.meta.hide_toolbar) {
        this.page.hide_menu();
      } else {
        if (this.frm.doc.__islocal) {
          this.page.hide_menu();
          this.print_icon && this.print_icon.addClass("hide");
        } else {
          this.page.show_menu();
          this.print_icon && this.print_icon.removeClass("hide");
        }
      }
    }
    set_title() {
      if (this.frm.is_new()) {
        var title = __("New {0}", [__(this.frm.meta.name)]);
      } else if (this.frm.meta.title_field) {
        let title_field = (this.frm.doc[this.frm.meta.title_field] || "").toString().trim();
        var title = strip_html(title_field || this.frm.docname);
        if (this.frm.doc.__islocal || title === this.frm.docname || this.frm.meta.autoname === "hash") {
          this.page.set_title_sub("");
        } else {
          this.page.set_title_sub(this.frm.docname);
          this.page.$sub_title_area.css("cursor", "copy");
          this.page.$sub_title_area.on("click", (event) => {
            event.stopImmediatePropagation();
            frappe.utils.copy_to_clipboard(this.frm.docname);
          });
        }
      } else {
        var title = this.frm.docname;
      }
      var me = this;
      title = __(title);
      this.page.set_title(title);
      if (this.frm.meta.title_field) {
        frappe.utils.set_title(title + " - " + this.frm.docname);
      }
      this.page.$title_area.toggleClass(
        "editable-title",
        !!(this.is_title_editable() || this.can_rename())
      );
      this.set_indicator();
    }
    is_title_editable() {
      let title_field = this.frm.meta.title_field;
      let doc_field = this.frm.get_docfield(title_field);
      if (title_field && this.frm.perm[0].write && !this.frm.doc.__islocal && doc_field.fieldtype === "Data" && !doc_field.read_only) {
        return true;
      } else {
        return false;
      }
    }
    can_rename() {
      return this.frm.perm[0].write && this.frm.meta.allow_rename && !this.frm.doc.__islocal;
    }
    show_unchanged_document_alert() {
      frappe.show_alert({
        indicator: "info",
        message: __("Unchanged")
      });
    }
    rename_document_title(input_name, input_title, merge = false) {
      let confirm_message = null;
      const docname = this.frm.doc.name;
      const title_field = this.frm.meta.title_field || "";
      const doctype = this.frm.doctype;
      if (input_name) {
        const warning = __("This cannot be undone");
        const message = __("Are you sure you want to merge {0} with {1}?", [
          docname.bold(),
          input_name.bold()
        ]);
        confirm_message = `${message}<br><b>${warning}<b>`;
      }
      let rename_document = () => {
        return frappe.xcall("frappe.model.rename_doc.update_document_title", {
          doctype,
          docname,
          name: input_name,
          title: input_title,
          enqueue: true,
          merge,
          freeze: true,
          freeze_message: __("Updating related fields...")
        }).then((new_docname) => {
          const reload_form = (input_name2) => {
            $(document).trigger("rename", [doctype, docname, input_name2]);
            if (locals[doctype] && locals[doctype][docname])
              delete locals[doctype][docname];
            this.frm.reload_doc();
          };
          if (input_name && new_docname == docname) {
            frappe.socketio.doc_subscribe(doctype, input_name);
            frappe.realtime.on("doc_update", (data) => {
              if (data.doctype == doctype && data.name == input_name) {
                reload_form(input_name);
                frappe.show_alert({
                  message: __("Document renamed from {0} to {1}", [
                    docname.bold(),
                    input_name.bold()
                  ]),
                  indicator: "success"
                });
              }
            });
            frappe.show_alert(
              __("Document renaming from {0} to {1} has been queued", [
                docname.bold(),
                input_name.bold()
              ])
            );
          }
          if (input_name && (new_docname || input_name) != docname) {
            reload_form(new_docname || input_name);
          }
        });
      };
      return new Promise((resolve, reject) => {
        if (input_title === this.frm.doc[title_field] && input_name === docname) {
          this.show_unchanged_document_alert();
          resolve();
        } else if (merge) {
          frappe.confirm(
            confirm_message,
            () => {
              rename_document().then(resolve).catch(reject);
            },
            reject
          );
        } else {
          rename_document().then(resolve).catch(reject);
        }
      });
    }
    setup_editable_title() {
      let me = this;
      this.page.$title_area.find(".title-text").on("click", () => {
        let fields = [];
        let docname = me.frm.doc.name;
        let title_field = me.frm.meta.title_field || "";
        if (me.is_title_editable()) {
          let title_field_label = me.frm.get_docfield(title_field).label;
          fields.push({
            label: __("New {0}", [__(title_field_label)]),
            fieldname: "title",
            fieldtype: "Data",
            reqd: 1,
            default: me.frm.doc[title_field]
          });
        }
        if (me.can_rename()) {
          let label = __("New Name");
          if (me.frm.meta.autoname && me.frm.meta.autoname.startsWith("field:")) {
            let fieldname = me.frm.meta.autoname.split(":")[1];
            label = __("New {0}", [me.frm.get_docfield(fieldname).label]);
          }
          fields.push(
            ...[
              {
                label,
                fieldname: "name",
                fieldtype: "Data",
                reqd: 1,
                default: docname
              },
              {
                label: __("Merge with existing"),
                fieldname: "merge",
                fieldtype: "Check",
                default: 0
              }
            ]
          );
        }
        if (fields.length > 0) {
          let d = new frappe.ui.Dialog({
            title: __("Rename"),
            fields
          });
          d.show();
          d.set_primary_action(__("Rename"), (values) => {
            d.disable_primary_action();
            d.hide();
            this.rename_document_title(values.name, values.title, values.merge).then(() => {
              d.hide();
            }).catch(() => {
              d.enable_primary_action();
            });
          });
        }
      });
    }
    get_dropdown_menu(label) {
      return this.page.add_dropdown(label);
    }
    set_indicator() {
      var indicator = frappe.get_indicator(this.frm.doc);
      if (this.frm.save_disabled && indicator && [__("Saved"), __("Not Saved")].includes(indicator[0])) {
        return;
      }
      if (indicator) {
        this.page.set_indicator(indicator[0], indicator[1]);
      } else {
        this.page.clear_indicator();
      }
    }
    make_menu() {
      this.page.clear_icons();
      this.page.clear_menu();
      if (frappe.boot.desk_settings.form_sidebar) {
        this.make_navigation();
        this.make_menu_items();
      }
    }
    make_viewers() {
      if (this.frm.viewers) {
        return;
      }
      this.frm.viewers = new frappe.ui.form.FormViewers({
        frm: this.frm,
        parent: $('<div class="form-viewers d-flex"></div>').prependTo(
          this.frm.page.page_actions
        )
      });
    }
    make_navigation() {
      if (!this.frm.is_new() && !this.frm.meta.issingle) {
        this.page.add_action_icon(
          "left",
          () => {
            this.frm.navigate_records(1);
          },
          "prev-doc",
          __("Previous Document")
        );
        this.page.add_action_icon(
          "right",
          () => {
            this.frm.navigate_records(0);
          },
          "next-doc",
          __("Next Document")
        );
      }
    }
    async has_print_attempts(doctype, docname) {
      return frappe.call({
        method: "print_limit.has_print_attempts",
        args: {
          doctype,
          docname
        }
      }).then((r) => {
        this.print_attempts = r.message;
      });
    }
    make_menu_items() {
      const me = this;
      const p = this.frm.perm[0];
      const docstatus = cint(this.frm.doc.docstatus);
      const is_submittable = frappe.model.is_submittable(this.frm.doc.doctype);
      const print_settings = frappe.model.get_doc(":Print Settings", "Print Settings");
      const allow_print_for_draft = cint(print_settings.allow_print_for_draft);
      const allow_print_for_cancelled = cint(print_settings.allow_print_for_cancelled);
      if (!is_submittable || docstatus == 1 || allow_print_for_cancelled && docstatus == 2 || allow_print_for_draft && docstatus == 0) {
        if (frappe.model.can_print(null, me.frm) && !this.frm.meta.issingle) {
          this.has_print_attempts(this.frm.doctype, this.frm.docname).then(() => {
            console.log("then print_attempts", this.print_attempts);
          });
          console.log("print_attempts", this.print_attempts);
          if (this.print_attempts) {
            this.page.add_menu_item(
              __("Print"),
              function() {
                me.frm.print_doc();
              },
              true
            );
            this.print_icon = this.page.add_action_icon(
              "printer",
              function() {
                me.frm.print_doc();
              },
              "",
              __("Print")
            );
          }
        }
      }
      if (frappe.model.can_email(null, me.frm) && me.frm.doc.docstatus < 2) {
        this.page.add_menu_item(
          __("Email"),
          function() {
            me.frm.email_doc();
          },
          true,
          {
            shortcut: "Ctrl+E",
            condition: () => !this.frm.is_new()
          }
        );
      }
      this.page.add_menu_item(
        __("Jump to field"),
        function() {
          me.show_jump_to_field_dialog();
        },
        true,
        "Ctrl+J"
      );
      if (!me.frm.meta.issingle) {
        this.page.add_menu_item(
          __("Links"),
          function() {
            me.show_linked_with();
          },
          true
        );
      }
      if (in_list(frappe.boot.user.can_create, me.frm.doctype) && !me.frm.meta.allow_copy) {
        this.page.add_menu_item(
          __("Duplicate"),
          function() {
            me.frm.copy_doc();
          },
          true
        );
      }
      this.page.add_menu_item(
        __("Copy to Clipboard"),
        function() {
          frappe.utils.copy_to_clipboard(JSON.stringify(me.frm.doc));
        },
        true
      );
      if (this.can_rename()) {
        this.page.add_menu_item(
          __("Rename"),
          function() {
            me.frm.rename_doc();
          },
          true
        );
      }
      this.page.add_menu_item(
        __("Reload"),
        function() {
          me.frm.reload_doc();
        },
        true
      );
      if (cint(me.frm.doc.docstatus) != 1 && !me.frm.doc.__islocal && frappe.model.can_delete(me.frm.doctype)) {
        this.page.add_menu_item(
          __("Delete"),
          function() {
            me.frm.savetrash();
          },
          true,
          {
            shortcut: "Shift+Ctrl+D",
            condition: () => !this.frm.is_new()
          }
        );
      }
      this.make_customize_buttons();
      if (this.can_repeat()) {
        this.page.add_menu_item(
          __("Repeat"),
          function() {
            frappe.utils.new_auto_repeat_prompt(me.frm);
          },
          true
        );
      }
      if (p[CREATE] && !this.frm.meta.issingle && !this.frm.meta.in_create) {
        this.page.add_menu_item(
          __("New {0}", [__(me.frm.doctype)]),
          function() {
            frappe.new_doc(me.frm.doctype, true);
          },
          true,
          {
            shortcut: "Ctrl+B",
            condition: () => !this.frm.is_new()
          }
        );
      }
    }
    make_customize_buttons() {
      let is_doctype_form = this.frm.doctype === "DocType";
      if (frappe.model.can_create("Custom Field") && frappe.model.can_create("Property Setter")) {
        let doctype = is_doctype_form ? this.frm.docname : this.frm.doctype;
        let is_doctype_custom = is_doctype_form ? this.frm.doc.custom : false;
        if (doctype != "DocType" && !is_doctype_custom && this.frm.meta.issingle === 0) {
          this.page.add_menu_item(
            __("Customize"),
            () => {
              if (this.frm.meta && this.frm.meta.custom) {
                frappe.set_route("Form", "DocType", doctype);
              } else {
                frappe.set_route("Form", "Customize Form", {
                  doc_type: doctype
                });
              }
            },
            true
          );
        }
      }
      if (frappe.model.can_create("DocType")) {
        if (frappe.boot.developer_mode === 1 && !is_doctype_form) {
          this.page.add_menu_item(
            __("Edit DocType"),
            () => {
              frappe.set_route("Form", "DocType", this.frm.doctype);
            },
            true
          );
        }
      }
    }
    can_repeat() {
      return this.frm.meta.allow_auto_repeat && !this.frm.is_new() && !this.frm.doc.auto_repeat;
    }
    can_save() {
      return this.get_docstatus() === 0;
    }
    can_submit() {
      return this.get_docstatus() === 0 && !this.frm.doc.__islocal && !this.frm.doc.__unsaved && this.frm.perm[0].submit && !this.has_workflow();
    }
    can_update() {
      return this.get_docstatus() === 1 && !this.frm.doc.__islocal && this.frm.perm[0].submit && this.frm.doc.__unsaved;
    }
    can_cancel() {
      return this.get_docstatus() === 1 && this.frm.perm[0].cancel && !this.read_only;
    }
    can_amend() {
      return this.get_docstatus() === 2 && this.frm.perm[0].amend && !this.read_only;
    }
    has_workflow() {
      if (this._has_workflow === void 0)
        this._has_workflow = frappe.get_list("Workflow", {
          document_type: this.frm.doctype
        }).length;
      return this._has_workflow;
    }
    get_docstatus() {
      return cint(this.frm.doc.docstatus);
    }
    show_linked_with() {
      if (!this.frm.linked_with) {
        this.frm.linked_with = new frappe.ui.form.LinkedWith({
          frm: this.frm
        });
      }
      this.frm.linked_with.show();
    }
    set_primary_action(dirty) {
      if (!dirty) {
        this.page.clear_user_actions();
      }
      var status = this.get_action_status();
      if (status) {
        if (status !== this.current_status && status === "Amend") {
          let doc = this.frm.doc;
          frappe.xcall("frappe.client.is_document_amended", {
            doctype: doc.doctype,
            docname: doc.name
          }).then((is_amended) => {
            if (is_amended) {
              this.page.clear_actions();
              return;
            }
            this.set_page_actions(status);
          });
        } else {
          this.set_page_actions(status);
        }
      } else {
        this.page.clear_actions();
        this.current_status = null;
      }
    }
    get_action_status() {
      var status = null;
      if (this.frm.page.current_view_name === "print" || this.frm.hidden) {
        status = "Edit";
      } else if (this.can_submit()) {
        status = "Submit";
      } else if (this.can_save()) {
        if (!this.frm.save_disabled) {
          if (this.has_workflow() ? this.frm.doc.__unsaved : true) {
            status = "Save";
          }
        }
      } else if (this.can_update()) {
        status = "Update";
      } else if (this.can_cancel()) {
        status = "Cancel";
      } else if (this.can_amend()) {
        status = "Amend";
      }
      return status;
    }
    set_page_actions(status) {
      var me = this;
      this.page.clear_actions();
      if (status !== "Edit") {
        var perm_to_check = this.frm.action_perm_type_map[status];
        if (!this.frm.perm[0][perm_to_check]) {
          return;
        }
      }
      if (status === "Edit") {
        this.page.set_primary_action(
          __("Edit"),
          function() {
            me.frm.page.set_view("main");
          },
          "edit"
        );
      } else if (status === "Cancel") {
        let add_cancel_button = () => {
          this.page.set_secondary_action(__(status), function() {
            me.frm.savecancel(this);
          });
        };
        if (this.has_workflow()) {
          frappe.xcall("frappe.model.workflow.can_cancel_document", {
            doctype: this.frm.doc.doctype
          }).then((can_cancel) => {
            if (can_cancel) {
              add_cancel_button();
            }
          });
        } else {
          add_cancel_button();
        }
      } else {
        var click = {
          Save: function() {
            return me.frm.save("Save", null, this);
          },
          Submit: function() {
            return me.frm.savesubmit(this);
          },
          Update: function() {
            return me.frm.save("Update", null, this);
          },
          Amend: function() {
            return me.frm.amend_doc();
          }
        }[status];
        var icon = {
          Update: "edit"
        }[status];
        this.page.set_primary_action(__(status), click, icon);
      }
      this.current_status = status;
    }
    add_update_button_on_dirty() {
      var me = this;
      $(this.frm.wrapper).on("dirty", function() {
        me.show_title_as_dirty();
        me.frm.page.clear_actions_menu();
        if (!me.frm.save_disabled) {
          me.set_primary_action(true);
        }
      });
    }
    show_title_as_dirty() {
      if (this.frm.save_disabled && !this.frm.set_dirty)
        return;
      if (this.frm.is_dirty()) {
        this.page.set_indicator(__("Not Saved"), "orange");
      }
      $(this.frm.wrapper).attr("data-state", this.frm.is_dirty() ? "dirty" : "clean");
    }
    show_jump_to_field_dialog() {
      let visible_fields_filter = (f) => !["Section Break", "Column Break", "Tab Break"].includes(f.df.fieldtype) && !f.df.hidden && f.disp_status !== "None";
      let fields = this.frm.fields.filter(visible_fields_filter).map((f) => ({ label: __(f.df.label), value: f.df.fieldname }));
      let dialog = new frappe.ui.Dialog({
        title: __("Jump to field"),
        fields: [
          {
            fieldtype: "Autocomplete",
            fieldname: "fieldname",
            label: __("Select Field"),
            options: fields,
            reqd: 1
          }
        ],
        primary_action_label: __("Go"),
        primary_action: ({ fieldname }) => {
          dialog.hide();
          this.frm.scroll_to_field(fieldname);
        },
        animate: false
      });
      dialog.show();
    }
  };
})();
//# sourceMappingURL=custom-desk.bundle.WQHTG5GE.js.map