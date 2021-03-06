Kanboard.App = function() {
    this.controllers = {};
};

Kanboard.App.prototype.get = function(controller) {
    return this.controllers[controller];
};

Kanboard.App.prototype.execute = function() {
    for (var className in Kanboard) {
        if (className !== "App") {
            var controller = new Kanboard[className](this);
            this.controllers[className] = controller;

            if (typeof controller.execute === "function") {
                controller.execute();
            }

            if (typeof controller.listen === "function") {
                controller.listen();
            }

            if (typeof controller.focus === "function") {
                controller.focus();
            }

            if (typeof controller.keyboardShortcuts === "function") {
                controller.keyboardShortcuts();
            }
        }
    }

    this.focus();
    this.keyboardShortcuts();
    this.datePicker();
    this.autoComplete();
    this.tagAutoComplete();
};

Kanboard.App.prototype.keyboardShortcuts = function() {
    var self = this;

    // Submit form
    Mousetrap.bindGlobal("mod+enter", function() {
        var forms = $("form");

        if (forms.length == 1) {
            forms.submit();
        } else if (forms.length > 1) {
            if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
                $(document.activeElement).parents("form").submit();
            } else if (self.get("Popover").isOpen()) {
                $("#popover-container form").submit();
            }
        }
    });

    // Close popover and dropdown
    Mousetrap.bindGlobal("esc", function() {
        if (! document.getElementById('suggest-menu')) {
            self.get("Popover").close();
            self.get("Dropdown").close();
        }
    });

    // Show keyboard shortcut
    Mousetrap.bind("?", function() {
        self.get("Popover").open($("body").data("keyboard-shortcut-url"));
    });
};

Kanboard.App.prototype.focus = function() {
    // Auto-select input fields
    $(document).on('focus', '.auto-select', function() {
        $(this).select();
    });

    // Workaround for chrome
    $(document).on('mouseup', '.auto-select', function(e) {
        e.preventDefault();
    });
};

Kanboard.App.prototype.datePicker = function() {
    var bodyElement = $("body");
    var dateFormat = bodyElement.data("js-date-format");
    var timeFormat = bodyElement.data("js-time-format");
    var lang = bodyElement.data("js-lang");

    $.datepicker.setDefaults($.datepicker.regional[lang]);
    $.timepicker.setDefaults($.timepicker.regional[lang]);

    // Datepicker
    $(".form-date").datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: dateFormat,
        constrainInput: false
    });

    // Datetime picker
    $(".form-datetime").datetimepicker({
        dateFormat: dateFormat,
        timeFormat: timeFormat,
        constrainInput: false
    });
};

Kanboard.App.prototype.tagAutoComplete = function() {
    $(".tag-autocomplete").select2({
        tags: true
    });
};

Kanboard.App.prototype.autoComplete = function() {
    $(".autocomplete").each(function() {
        var input = $(this);
        var field = input.data("dst-field");
        var extraField = input.data("dst-extra-field");

        if ($('#form-' + field).val() === '') {
            input.parent().find("button[type=submit]").attr('disabled','disabled');
        }

        input.autocomplete({
            source: input.data("search-url"),
            minLength: 1,
            select: function(event, ui) {
                $("input[name=" + field + "]").val(ui.item.id);

                if (extraField) {
                    $("input[name=" + extraField + "]").val(ui.item[extraField]);
                }

                input.parent().find("button[type=submit]").removeAttr('disabled');
            }
        });
    });
};

Kanboard.App.prototype.hasId = function(id) {
    return !!document.getElementById(id);
};

Kanboard.App.prototype.showLoadingIcon = function() {
    $("body").append('<span id="app-loading-icon">&nbsp;<i class="fa fa-spinner fa-spin"></i></span>');
};

Kanboard.App.prototype.hideLoadingIcon = function() {
    $("#app-loading-icon").remove();
};

Kanboard.App.prototype.isVisible = function() {
    var property = "";

    if (typeof document.hidden !== "undefined") {
        property = "visibilityState";
    } else if (typeof document.mozHidden !== "undefined") {
        property = "mozVisibilityState";
    } else if (typeof document.msHidden !== "undefined") {
        property = "msVisibilityState";
    } else if (typeof document.webkitHidden !== "undefined") {
        property = "webkitVisibilityState";
    }

    if (property !== "") {
        return document[property] == "visible";
    }

    return true;
};
