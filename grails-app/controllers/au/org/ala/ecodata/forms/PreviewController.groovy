package au.org.ala.ecodata.forms

import grails.converters.JSON
import grails.util.Environment
import org.apache.commons.io.FilenameUtils

class PreviewController {

    private static String EXAMPLE_MODEL = 'example.json'
    private static String EXAMPLE_MODELS_PATH = '/example_models/'
    private static String EXAMPLE_DATA_PATH = '/example_data/'


    def index() {

        String modelName = params.name ?: EXAMPLE_MODEL
        Map model = getExample(modelName)
        Map data = getData(modelName)
        render ([model:[model:model, data:data, title:model.modelName, examples:allExamples()], view:'index'])

    }

    def model() {
        Map model = request.JSON

        if (!model) {
            respond status:400
        }

        render ([model:[model:model, title:model.modelName], view:'index'])
    }

    def imagePreview(String id) {
        String ext = FilenameUtils.getExtension(id)

        InputStream imageIn = getClass().getResourceAsStream(EXAMPLE_DATA_PATH+id)
        if (imageIn) {
            response.contentType = 'image/'+ext
            response.outputStream << imageIn
            response.outputStream.flush()
        }
        else {
            response.status = 404
        }
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
        loadFile(EXAMPLE_MODELS_PATH, name)
    }

    private getData(String name) {
        loadFile(EXAMPLE_DATA_PATH, name)
    }

    private Map loadFile(String path, String name) {
        if (!name.endsWith('.json')) {
            name += '.json'
        }

        String relativePath = path + name

        InputStream fileIn = null
        // Allow easy reloading in development environments.
        if (Environment.current == Environment.DEVELOPMENT) {
            File file = new File("./grails-app/conf"+relativePath)
            if (file.exists()) {
                fileIn = new FileInputStream(file)
            }
        }
        else {
            fileIn = getClass().getResourceAsStream(relativePath)
        }
        Map result = [:]
        if (fileIn != null) {
            result = JSON.parse(fileIn, 'UTF-8')
        }
        result

    }

    /**
     * Echos the request parameters back to the client.
     */
    def prepopulate() {
        respond params
    }
}
