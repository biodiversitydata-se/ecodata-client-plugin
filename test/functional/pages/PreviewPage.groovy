package pages
import geb.Page
import geb.navigator.Navigator
import grails.converters.JSON

class PreviewPage extends Page {
    static url = "preview"

    static at = {
        waitFor{js.modelReady == true}
        title.startsWith("Preview")
    }

    static content = {
        featureMapDialog { module FeatureMapDialog }
    }

    Map getModel() {
        waitFor{js.modelReady == true}
        String json = js.exec("return model.modelAsJSON();")

        JSON.parse(json)
    }

    Navigator findFieldByModelName(String name) {
        Navigator fields = $("input[data-bind*="+name+"]")
        if (fields.size() == 0) {
            fields = $("select[data-bind*="+name+"]")
        }
        if (fields.size() == 0) {
            fields = $("[data-bind*="+name+"]")
        }
        fields

    }

    Navigator findFeatureMapButtonByModelName(String name) {
        $("[params*="+name+"]").find("button")
    }

    void commitEdits() {
        // Tab out of current edit so the model updates.
        $("h3").first().click()
    }

}
