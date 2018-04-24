# Forest Database

## Overview

This is a proposed redo of an existing website. The existing website displays data for member jurisdictions as well as for the nation to which they belong. The general term "jurisdiction" is used because nations can refer to their subunits as either "states" or "provinces".

The displayed fields can thus be categorized as either "national" or "jurisdictional". The [field definitions](config/field-defs.yml) are thus grouped by these two categories.

## Public API

JSON data is made available using the route *getData* with the following query-string options:

- **regionId**: Return results for a particular nation or jurisdiction id (e.g. 'brazil' or 'indonesia.north_kalimantan'). For a nation, all member jurisdictions are included.
- **lang**: (en|es|id|pt) for translated versions of field labels and string and text data.

## Data Types (Schema)

There are seven data types, but two of these have distinct sub types that merely add or change a key. Including the subtypes, there are a total of ten distinct data-type names.

1. **number, numberAndCurrency, and numberAndYear**: Includes a *value* property of type number (or null) and a *string* property with the formatted value (or ''). The two subtypes simply include an additional *currency* or *year* string property respectively. Note that *year* is a string. Each defaults to ''.
2. **string**: Includes a *string* property of type string.
3. **text**: Includes an *html* property of type string.
4. **select**: Includes a *value* property of type string representing the value of the selected option (or '' for no selection). An *options* array is included with each entry providing *value*, *label* and *isSelected* properties. Finally, *string* contains the label of the active option.
5. **categorical and series**: Includes a *categories* array. Each item provides *id*, *label*, *value*, *string*. *value*, *string* properties follow the **number** type as described above. The schema for these two types are currently identical; the two different type names are intended to facilitate different processing.
6. **person**: Includes the string-type properties *firstName*, *lastName*, *email*, and *companyTitle*.
7. **initiative**: Includes the string-type properties *name*, *partners*, *fundingSource*, *fundingAmount*, *initiativeType*, and *initiativeStatus*. Includes *description* with an *html* property for the content string. Also includes an *id* (UUID) to uniquely identify each initiative since initiatives are added by editors.

## TODO

-[] Change source data files to store the (string!) value of 'select' types using an 'option' property rather than a 'value' property. The issue is that 'select' types use a string for their value, but 'number' types also use a 'value' property for their numeric value. The API avoids this inconsistency by mapping to an 'option' property, but the underlying data should match the API.
