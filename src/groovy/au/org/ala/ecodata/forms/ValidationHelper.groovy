package au.org.ala.ecodata.forms

import java.util.regex.Matcher
import java.util.regex.Pattern

/**
 * Helper class for taking model data validation attributes and producing html attributes for form validation.
 * Validation is currently implemented by the jquery-validation-engine.
 */
class ValidationHelper {

    public static final String MAX_SIZE = "maxSize"


    private static List CUSTOM_RULES = ['number', 'integer', 'url', 'date', 'phone']

    /** jquery-validation-engine allows parameters to be passed to validation rules in the form maxLength[100] */
    private static Pattern RULE_PATTERN = Pattern.compile(/(.*)\[(.*)\]/)

    List getValidationCriteria(dataModel, model, edit) {
        if (!edit) { return []}  // don't bother if the user can't change it

        def validationCriteria = model.validate

        if (!validationCriteria) {
            // Try the data model.
            validationCriteria = dataModel?.validate
        } // no criteria

        def criteria = []
        if (validationCriteria) {
            criteria = validationCriteria.tokenize(',')
            criteria = criteria.collect {
                def rule = it.trim()
                // Wrap these rules in "custom[]" to keep jquery-validation-engine happy and avoid having to
                // specify "custom" in the json.
                if (rule in CUSTOM_RULES) {
                    rule = "custom[${rule}]"
                }
                rule
            }
        }

        // Add implied numeric validation to numeric data types
        if (dataModel?.dataType == 'number') {
            if (!criteria.contains('custom[number]') && !criteria.contains('custom[integer]')) {
                criteria << 'custom[number]'
            }
            if (!criteria.find{it.startsWith('min')}) {
                criteria << 'min[0]'
            }
        }


        return criteria
    }

    def isRequired(dataModel, model, edit) {
        def criteria = getValidationCriteria(dataModel, model, edit)
        return criteria.contains("required")
    }

    String validationAttribute(dataModel, model, edit) {
        def criteria = getValidationCriteria(dataModel, model, edit)
        if (criteria.isEmpty()) {
            return ""
        }

        def values = []
        criteria.each {
            switch (it) {
                case 'required':
                    if (model.type == 'selectMany') {
                        values << 'minCheckbox[1]'
                    }
                    else {
                        values << it
                    }
                    break
                case 'number':
                    values << 'custom[number]'
                    break
                case it.startsWith('min:'):
                    values << it
                    break
                default:
                    values << it
            }
        }
        //log.debug " data-validation-engine='validate[${values.join(',')}]'"
        return " data-validation-engine='validate[${values.join(',')}]'"
    }

    Map validationRules(Map dataModel, Map viewModel, boolean edit) {
        List criteria = getValidationCriteria(dataModel, viewModel, edit)
        Map rules = [:]

        criteria.each { rule ->
            Map parsed = parseRule(rule)
            rules[(parsed.rule)] = parsed.value
        }
        rules
    }

    /**
     * Returns a Map of the form [rule: <rule>, value:<value>] where
     * the rule is expected to be in the form rule[value]
     */
    private Map<String, String> parseRule(String rule) {

        Map result = null
        Matcher m = RULE_PATTERN.matcher(rule)
        if (m.matches()) {
            result = [rule: m.group(1), value: m.group(2)]
        }
        else {
            result = [rule: rule, value: null]
        }
        result
    }


}
