package pages
import geb.Page
import geb.navigator.Navigator
import grails.converters.JSON

class PreviewPage extends Page {
    static url = "preview"

    static at = { title.startsWith("Preview") }

    Map getModel() {
        waitFor{js.modelReady == true}
        String json = js.exec("return model.modelAsJSON();")

        JSON.parse(json)
    }

    Navigator findFieldByModelName(String name) {
        $("[data-bind*="+name+"]")
    }

}
