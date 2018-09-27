package au.org.ala.ecodata.forms

import spock.lang.Specification


class ValidationHelperSpec extends Specification {

    ValidationHelper validationHelper = new ValidationHelper()

    private Map model(String validationString) {

        [
            viewModel:[source:"test"],
            dataModel:[name:"test", validate: validationString]
        ]

    }

    def "the presence of the value required in the validation attribute marks the model a required field"(String validationString, boolean required) {
        when:
        Map model = model(validationString)

        then:
        validationHelper.isRequired(model.dataModel, model.viewModel, true) == required

        where:
        validationString            | required
        "required"                  | true
        "required,max[100]"         | true
        "min[0],required,max[100]"  | true
        "min[0],required"           | true
        ""                          | false
        "min[0]"                    | false
    }

    def "validation strings with parameters can be parsed"(String validationRule, String rule, String value) {

        when:
        Map parsedRule = validationHelper.parseRule(validationRule)

        then:
        parsedRule.rule == rule
        parsedRule.value == value

        where:
        validationRule   | rule       | value
        "maxSize[100]"   | "maxSize"  | "100"
        "required"       | "required" | null
        "custom[number]" | "custom"   | "number"

    }


    def "a map of all validation rules can be returned from the validation string"() {

        setup:
        Map model = model("min[0],required,max[100]")

        when:
        Map rules = validationHelper.validationRules(model.dataModel, model.viewModel, true)

        then:
        rules.size() == 3
        rules.containsKey("required") == true
        rules['min'] == '0'
        rules['max'] == '100'


    }

}
