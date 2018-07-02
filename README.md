## date-ranges-selector

A jQuery plugin to create and manage date ranges.
Written by [Albert Gonzalez](http://albertgonzalez.coffee) and released under [the Unlicense](http://unlicense.org/).

[See it in action!](http://albertgonzalez.coffee/projects/date-ranges-selector/)

### Install

Download the *.js* and *.css* files or install them using **npm**:

```markdown
npm install date-ranges-selector
```

### Starting

```markdown
$(element).dateRangesSelector({options});
```

Available options:

* new_date_range_text : Default text for the starting button
* main_class_prefix : Css class for the plugin main container
* max_date : Max date value. Default: "+1Y"
* date_format : Something like "D, dd/mm/yy". Used by the datepickers
* selector : If true (enabled by default), adds an aditional selector that will be attached to every range)
* selector_name : "appear" by default. The "name" of the selector (if provided
* selector_options : Array of options to be shown in the selector. Each element is another array "text"-"value". Default: [ ["Display", "1"], ["Don't display", "0"] ]
* use_timezone_offset : If true (enabled by default) uses timezone offsets when fetching dates

Now you're ready!

### Methods

Add a new range:

```markdown
$(element).datesRangesSelector("addDateRange", {options});
```

Available options:

* date_begin : Optional date_begin value in unixtime to set the first date of the new added element.
* date_end : Optional date_end value in unixtime to set the second date of the new added element.
* selector : Optional selector value (if selector is enabled)

Remove an existing range: 

```markdown
$(element).datesRangesSelector("removeDateRange", [position (begins with 1)]);
```

Remove ALL ranges:

```markdown
Remove ALL ranges: $(element).datesRangesSelector("removeAllDateRanges");
```

Get all non-empty ranges:

```markdown
$(element).datesRangesSelector("getDateRanges", {options});
```

Available options:

* only_non_empty : If true (enabled by default) will only return full populated ranges. Otherwise will return the empty ones too.

Visually disable the plugin (the GET method won't return anything, but still can add elements via methods):

```markdown
$(element).datesRangesSelector("disable");
```

Visually enable the plugin:

```markdown
$(element).datesRangesSelector("enable");
```

### Events

The events are triggered when adding or removing elements:

```markdown
$(element).on('datesRangesSelector.rangeAdded', function(event, date_begin, date_end, selector) {
  console.log('Added range with values ' + date_begin + ', ' + date_end + ', ' + selector + '. Those values can be undefined if the range is added without default values');
});

$(element).on('datesRangesSelector.rangeRemoved', function(event, position) {
  console.log('Range removed at position ' + position);
});

$(element).on('datesRangesSelector.allRangesRemoved', function(event, position) {
  console.log('ALL ranges removed');
});

$(element).on('datesRangesSelector.becameFull', function(event, date_begin, date_end, selector) {
  console.log('I was empty, but after that, I have at least one new element');
});

$(element).on('datesRangesSelector.becameEmpty', function(event) {
  console.log('I wasn't empty (with at least one element) but now I amb after that last operation');
});

```