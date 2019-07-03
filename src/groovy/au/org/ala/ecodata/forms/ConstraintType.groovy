package au.org.ala.ecodata.forms

/**
 * Supported constraints that can be applied to data model items.
 */

enum ConstraintType {
    VISIBLE("visible", true, true),
    IF("if", true, true),
    ENABLE("enable", true, false),
    ENABLE_AND_CLEAR("enableAndClear", true, false),
    DISABLE("disable", true, false),
    CONDITIONAL_VALIDATION("conditionalValidation", false, false)

    /** The knockout data binding that implements this constraint */
    String binding
    /** True if this constraint should be evaluated as a boolean */
    boolean isBoolean
    /** True if this constraint applies to a label and input field (otherwise it will just be applied to input fields) */
    boolean appliesToLabel

    private ConstraintType(String binding, boolean isBoolean, boolean appliesToLabel) {
        this.binding = binding
        this.isBoolean = isBoolean
        this.appliesToLabel = appliesToLabel
    }
}
