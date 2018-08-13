package au.org.ala.ecodata.forms

import grails.converters.JSON

class PreviewController {

    private static String EXAMPLE_MODEL = 'example.json'
    private static String EXAMPLE_MODELS_PATH = '/example_models/'

    def index() {

        String modelName = params.name ?: EXAMPLE_MODEL
        Map model = getExample(modelName)
        render ([model:[model:model, title:model.modelName], view:'index'])

    }

    def model() {
        Map model = request.JSON

        if (!model) {
            respond status:400
        }

        render ([model:[model:model, title:model.modelName], view:'index'])
    }


    private Map getExample(String name) {
        if (!name.endsWith('.json')) {
            name += '.json'
        }

        String path = EXAMPLE_MODELS_PATH + name
        JSON.parse(getClass().getResourceAsStream(path), 'UTF-8')
    }
}
