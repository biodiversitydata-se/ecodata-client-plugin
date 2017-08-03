package au.org.ala.ecodata.forms

/**
 * Supported constraints that can be applied to data model items.
 */

enum ConstraintType {
    VISIBLE("visible", true),
    ENABLE("enable", true),
    DISABLE("disable", true),
    CONDITIONAL_VALIDATION("conditionalValidation", false)

    String binding
    boolean isBoolean

    private ConstraintType(String binding, boolean isBoolean) {
        this.binding = binding
        this.isBoolean = isBoolean
    }
}
