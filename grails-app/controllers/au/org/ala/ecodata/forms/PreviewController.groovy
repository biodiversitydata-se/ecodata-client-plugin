package au.org.ala.ecodata.forms

import grails.converters.JSON
import grails.util.Environment

class PreviewController {

    private static String EXAMPLE_MODEL = 'example.json'
    private static String EXAMPLE_MODELS_PATH = '/example_models/'

    def index() {

        String modelName = params.name ?: EXAMPLE_MODEL
        Map model = getExample(modelName)
        render ([model:[model:model, title:model.modelName, examples:allExamples()], view:'index'])

    }

    def model() {
        Map model = request.JSON

        if (!model) {
            respond status:400
        }

        render ([model:[model:model, title:model.modelName], view:'index'])
    }

    private List allExamples(){
        List examples = []
        URL pathUrl = getClass().getResource(EXAMPLE_MODELS_PATH)
        File path = new File(pathUrl.getFile())

        if (path.exists()) {
            for (File file : path.listFiles()) {
                Map model = getExample(file.name)

                examples << [name:file.name, title:model.title ?: model.modelName]
            }
        }
        examples
    }


    private Map getExample(String name) {
        if (!name.endsWith('.json')) {
            name += '.json'
        }

        String path = EXAMPLE_MODELS_PATH + name

        InputStream modelIn
        if (Environment.current == Environment.DEVELOPMENT) {
            File model = new File("./grails-app/conf"+path)
            modelIn = new FileInputStream(model)
        }
        else {
            modelIn = getClass().getResourceAsStream(path)
        }
        JSON.parse(modelIn, 'UTF-8')
    }

    /**
     * Echos the request parameters back to the client.
     */
    def prepopulate() {
        respond params
    }
}
