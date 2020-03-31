/**
* date-ranges-selector
*
* Author: Albert Gonzalez - http://www.albertgonzalez.coffee
* 
* Under the UNLICENSE (http://unlicense.org/)
*
* Methods:
* Init: $(element).datesRangesSelector({options});
*	Options:
*		max_date : "+1Y",
*		new_date_range_text : "+ Add a new date range",
*		main_class_prefix : "drs",
*		date_format : "D, dd/mm/yy",
*		selector : true, (an aditional selector that will be attached to every range)
*		selector_name : "appear",
*		selector_options : [ ["Display", "1"], ["Don't display", "0"] ],
*		use_timezone_offset : true,
*		placeholder_date_begin,
*		placeholder_date_end,
*		fixed_ranges : undefined,
* Remove: $(element).datesRangesSelector("remove");
*
* Add a new range: $(element).datesRangesSelector("addDateRange", {options});
* 	Options:
*		date_begin,
*		date_end, (in unixtime, SECONDS. If set, will init the datepickers with those dates)
*		selector (the same, but with the value from the selector),
*
* Remove an existing range: $(element).datesRangesSelector("removeDateRange", [position (begins with 1)]);
* Remove ALL ranges: $(element).datesRangesSelector("removeAllDateRanges");
*
* Get all ranges: $(element).datesRangesSelector("getDateRanges");
*	Options:
*		only_non_empty: true by default. If not, will return empty ranges too
*
* Visually disable the plugin (the GET method won't return anything disabled, but still can add elements via methods): $(element).datesRangesSelector("disable");
* Visually enable the plugin: $(element).datesRangesSelector("enable");
*
* Events:
* "datesRangesSelector.rangeAdded": Triggered when adding a range. Elements passed: position for the new range, date_begin, date_end, selector value (last three params can be undefined if empty)
* "datesRangesSelector.rangeRemoved": Triggered when removing a range. Elements passed: position for the deleted range.
* "datesRangesSelector.allRangesRemoved": Triggered when removing ALL ranges. No elements passed.
* "datesRangesSelector.becameFull": Triggered when changing from no ranges to, at least, one. Elements passed: position for the new range, date_begin, date_end, selector value (last three params can be undefined if empty)
* "datesRangesSelector.becameEmpty": Triggered when changing from some ranges to no ranges. No elements passed.
*
*/

(function ($) {

	"use strict";

	$.fn.datesRangesSelector = function(action, options) {

		var response = undefined;
		var main_id = this.attr("id");

		if (!$.fn.datesRangesSelector.drs_settings) {
			$.fn.datesRangesSelector.drs_settings = [];
		}
		var drs_settings = $.fn.datesRangesSelector.drs_settings[main_id];

		if (!$.fn.datesRangesSelector.drs_enabled) {
			$.fn.datesRangesSelector.drs_enabled = [];
		}
		var drs_enabled = $.fn.datesRangesSelector.drs_enabled[main_id];

		if (action == undefined || typeof action == "object") {

			// Get the options if proceed
			if (typeof action == "object") options = action;
			var settings = $.extend({
				new_date_range_text : "+ Add a new date range",
				main_class_prefix : "drs",
				max_date: "+1Y",
				date_format : "D, dd/mm/yy",
				selector : true,
				selector_name : "appear",
				selector_options : [ ["Display", "1"], ["Don't display", "0"] ],
				use_timezone_offset : true,
				placeholder_date_begin : "Begin",
				placeholder_date_end : "End",
				initial_ranges : 0,
				disable_add_remove: false,
			}, options);
			
			$("#" + main_id).html("<button class='drs_add_new_date_range_button' type='button' onclick='jQuery(\"#" + main_id + "\").datesRangesSelector(\"addDateRange\")' >" + settings.new_date_range_text + "</button>");

			// add class
			$("#" + main_id).addClass(settings.main_class_prefix);

			// Save main settings
			$.fn.datesRangesSelector.drs_settings[main_id] = settings;

			// Save enabled / disabled status
			$.fn.datesRangesSelector.drs_enabled[main_id] = true;

			for (var i = 0; i < settings.initial_ranges; i++) {
				$("#" + main_id).datesRangesSelector("addDateRange");
			}

			response = this;

		} else if (action == "remove") {
			$("#" + main_id).empty();

			response = this;

		} else if (action == "addDateRange") {

			// options allowed: "date_begin", "date_end" (unixtime)
			var settings = $.extend({
				date_begin : undefined,
				date_end : undefined,
				selector : undefined
			}, options);

			// hide start button just in case
			$("#" + main_id).find(".drs_add_new_date_range_button").hide();

			// remove the old "+" buttons
			$("#" + main_id).find(".drs_add_date_range_button").hide();

			// get the number of current elements
			var current_elements = $("#" + main_id).find(".line").length;

			// compose the new element
			var new_element = '<div class="line" data-position="' + (current_elements + 1) + '"> \
				<div class="element"> \
					<input type="text" class="date_begin" placeholder="' + drs_settings.placeholder_date_begin + '" value="" /> \
				</div> \
				<div class="element"> \
					<input type="text" class="date_end" placeholder="' + drs_settings.placeholder_date_end + '" value="" /> \
				</div>';

			if (drs_settings.selector && drs_settings.selector_options.length > 0) {

				var selector_options = '';
				$.each(drs_settings.selector_options, function(index, value) {
					if (typeof value == "object" && value.length == 2) {
						selector_options += '<option value="' + value[1] + '">' + value[0] + '</option>';
					}
				});

				new_element += '<div class="element"> \
					<select> \
						' + selector_options + ' \
					</select> \
				</div>';
			}
			
			if (!drs_settings.disable_add_remove) {
				new_element += '<div class="element"> \
						<button class="drs_remove_date_range_button" type="button" onclick="jQuery(\'#' + main_id + '\').datesRangesSelector(\'removeDateRange\', ' + (current_elements + 1) + ')" >-</button> \
						<button class="drs_add_date_range_button" type="button" onclick="jQuery(\'#' + main_id + '\').datesRangesSelector(\'addDateRange\')" >+</button> \
					</div> \
				</div>';
			}

			// append
			$("#" + main_id).append(new_element);

			// turn the inputs into datepickers
			var datepicker_begin = $("#" + main_id).find(".date_begin").last();
			var datepicker_end = $("#" + main_id).find(".date_end").last();

			datepicker_begin.datepicker({
				//minDate: 0,
				maxDate: drs_settings.max_date,
				changeMonth: true,
				numberOfMonths: 2,
				dateFormat: drs_settings.date_format,
				onClose: function( selectedDate ) {
					datepicker_end.datepicker( "option", "minDate", selectedDate );
					datepicker_end.datepicker("show");
				}
			});

			datepicker_end.datepicker({
				//minDate: 0,
				maxDate: drs_settings.max_date,
				changeMonth: true,
				numberOfMonths: 2,
				dateFormat: drs_settings.date_format,
				onClose: function( selectedDate ) {
					
				}
			});

			// Set the values (if provided)
			if (settings.date_begin != undefined) {
				var date_begin_offset = 0;
				if (drs_settings.use_timezone_offset) {
					date_begin_offset = !isNaN(settings.date_begin) ? ((new Date(settings.date_begin * 1000).getTimezoneOffset()) * 60) : 0;
				}
				datepicker_begin.datepicker("setDate", $.datepicker.parseDate('@', (parseInt(settings.date_begin) + date_begin_offset) * 1000));
			}

			if (settings.date_end != undefined) {
				var date_end_offset = 0;
				if (drs_settings.use_timezone_offset) {
					date_end_offset = !isNaN(settings.date_end) ? ((new Date(settings.date_end * 1000).getTimezoneOffset()) * 60) : 0;
				}
				datepicker_end.datepicker("setDate", $.datepicker.parseDate('@', (parseInt(settings.date_end) + date_end_offset) * 1000));
			}

			if (drs_settings.selector && settings.selector != undefined) {
				$("#" + main_id).find("select").last().val(settings.selector);
			}

			// Check if we're disabled or not
			if (!drs_enabled) {
				$("#" + main_id).find("button,input,select").attr("disabled", true);
			}

			// Triggers
			$("#" + main_id).trigger("datesRangesSelector.rangeAdded", [current_elements + 1, settings.date_begin, settings.date_end, settings.selector]);
			if (current_elements == 0) {
				// we're creating "the first one"
				$("#" + main_id).trigger("datesRangesSelector.becameFull", [current_elements + 1, settings.date_begin, settings.date_end, settings.selector]);
			}

			response = this;

		} else if (action == "removeDateRange") {

			// options: element to remove

			if (options) {

				var element = options;

				// remove the element
				$("#" + main_id).find("[data-position=" + element + "]").remove();

				// show the last "+" button
				$("#" + main_id).find(".drs_add_date_range_button").last().show();				

				if ($("#" + main_id).find("[data-position]").length == 0) {
					// show start button if no more elements are in the list
					$("#" + main_id).find(".drs_add_new_date_range_button").show();
					var turning_empty = true
				} else {
					// recalc elements positions
					var element_position = 1;
					$.each($("#" + main_id).find("[data-position]"), function(index, value) {

						$(value).attr("data-position", element_position);
						$(value).find(".drs_remove_date_range_button").attr("onclick", "jQuery('#" + main_id + "').datesRangesSelector('removeDateRange', " + element_position + ")");

						element_position++;
					});
				}

				// Triggers
				$("#" + main_id).trigger("datesRangesSelector.rangeRemoved", [element]);
				if (turning_empty) {
					$("#" + main_id).trigger("datesRangesSelector.becameEmpty", [element]);
				}
			}

			response = this;

		} else if (action == "removeAllDateRanges") {

			if ($("#" + main_id).find("[data-position]").length > 0) {
				 // only if we have previous elements here. Otherwise it's already empty!
				var turning_empty = true;
			}

			// remove all the elements
			$("#" + main_id).find(".line").remove();
			
			// show start button
			$("#" + main_id).find(".drs_add_new_date_range_button").show();

			// Triggers
			$("#" + main_id).trigger("datesRangesSelector.allRangesRemoved", []);
			if (turning_empty) {
				$("#" + main_id).trigger("datesRangesSelector.becameEmpty", []);
			}

			response = this;

		} else if (action == "getDateRanges") {

			var settings = $.extend({
				only_non_empty : true,
			}, options);

			response = [];

			// only get if not disabled
			if (drs_enabled) {

				$.each($("#" + main_id).find(".line"), function(index, value) {

					element = {};

					var date_begin = parseInt( $.datepicker.formatDate("@", $.datepicker.parseDate(drs_settings.date_format, $(value).find(".date_begin").last().val())) );
					var date_end = parseInt( $.datepicker.formatDate("@", $.datepicker.parseDate(drs_settings.date_format, $(value).find(".date_end").last().val())) );

					var date_begin_offset = 0;
					var date_end_offset = 0;
					if (drs_settings.use_timezone_offset) {
						date_begin_offset = !isNaN(date_begin) ? ((new Date(date_begin).getTimezoneOffset()) * 60) : 0;
						date_end_offset = !isNaN(date_end) ? ((new Date(date_end).getTimezoneOffset()) * 60) : 0;
					}

					element.date_begin = (!isNaN(date_begin) ? (date_begin / 1000 - date_begin_offset) : undefined);
					element.date_end = (!isNaN(date_end) ? (date_end / 1000 - date_end_offset) : undefined);

					if (drs_settings.selector) {
						element[drs_settings.selector_name] = $(value).find("select").last().val();
					}

					if (!settings.only_non_empty || (!isNaN(date_begin) && !isNaN(date_end)) ) {
						response.push(element);
					}

				});

			}

		} else if (action == "disable") {

			$("#" + main_id).find("button,input,select").attr("disabled", true);

			// Main flag
			$.fn.datesRangesSelector.drs_enabled[main_id] = false;

			response = this;

		} else if (action == "enable") {

			$("#" + main_id).find("button,input,select").attr("disabled", false);

			// Main flag
			$.fn.datesRangesSelector.drs_enabled[main_id] = true;

			response = this;

		}

		return response;

	}


}(jQuery));