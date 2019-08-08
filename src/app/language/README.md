Translation key naming convention:
<area>.<section>.<name>_(action|heading|label|text|<status>)

<area> refers to top level areas of a store, or a major component. i.e.: checkout, cart etc...
<section> refers to sub-sections of the area. i.e.: address, customer etc...
          "common" section contains generic strings that can be shared. It also contains strings that can't be categorised.
<name> refers to names representing various words and phrases. i.e.: address_line_1
       It should end with suffixes (listed above) to further clarify its intended usage.
       action - for buttons and links
       heading - for headings and titles
       label - for form labels
       text - for paragraphs, sentences and short phrases. It should be the default suffix.
       <status> - for status text, i.e.: error, warning, success.

address.address_line_1_label
address.address_line_1_required_error
address.confirm_address_action
customer.create_account_success
customer.customer_heading
customer.create_account_text
