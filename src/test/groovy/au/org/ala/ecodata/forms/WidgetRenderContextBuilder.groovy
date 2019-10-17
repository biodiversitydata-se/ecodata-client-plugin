package au.org.ala.ecodata.forms

import org.grails.web.json.JSONObject

/**
 * Helper class for tests involving the WidgetRenderContext.
 */
class WidgetRenderContextBuilder {

    JSONObject model
    Map dataModel = [:]
    String context = ""

    Databindings bindings = null
    AttributeMap attributeMap = null
    AttributeMap labelAttributes = null
    def g = null
    def tagAttrs = null


    WidgetRenderContextBuilder model(Map model) {
        this.model = new JSONObject(model)
        this.dataModel.name = model.source
        this
    }
    WidgetRenderContextBuilder context(String context) {
        this.context = context
        this
    }
    WidgetRenderContextBuilder validationString(String validationString) {
        this.context = context
        this.dataModel.validate = validationString
        this
    }


    WidgetRenderContext build() {
        new WidgetRenderContext(model, dataModel, context, bindings, attributeMap, labelAttributes, g, tagAttrs, true)
    }

}
