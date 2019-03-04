package pages
import geb.Page
import geb.navigator.Navigator
import grails.converters.JSON

class PreviewPage extends Page {
    static url = "preview"

    static at = { title.startsWith("Preview") }

    static content = {
        featureMapDialog { module FeatureMapDialog }
    }

    Map getModel() {
        waitFor{js.modelReady == true}
        String json = js.exec("return model.modelAsJSON();")

        JSON.parse(json)
    }

    Navigator findFieldByModelName(String name) {
        $("[data-bind*="+name+"]")
    }

    Navigator findFeatureMapButtonByModelName(String name) {
        $("[params*="+name+"]").find("button")
    }

    void commitEdits() {
        // Tab out of current edit so the model updates.
        $("h3").first().click()
    }

}
