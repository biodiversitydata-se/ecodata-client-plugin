package au.org.ala.ecodata.forms

import grails.converters.JSON

class PreviewController {

    private static String EXAMPLE_MODEL = 'example.json'
    private static String EXAMPLE_MODELS_PATH = '/example_models/'

    def index() {

        String modelName = params.name ?: EXAMPLE_MODEL

        [model:getExample(modelName), view:'preview']

    }

    def model() {
        Map model = request.JSON

        if (!model) {
            respond status:400
        }

        [model:model, view:'preview']
    }


    private Map getExample(String name) {
        String path = EXAMPLE_MODELS_PATH + name
        JSON.parse(getClass().getResourceAsStream(path), 'UTF-8')
    }
}
