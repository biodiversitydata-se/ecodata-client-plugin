package au.org.ala.ecodata.forms

import org.springframework.http.HttpStatus

//import org.apache.http.HttpStatus

class DataModelController {
    def modelService
    def getScript() {
        String outputName = params.outputName
        if (outputName) {
            Map data = [:]
            data.edit = params.getBoolean('edit', false)
            data.readonly= !data.edit
            data.model = modelService.getDataModelFromOutputName(outputName)
            if (data.model) {
                data.outputName = outputName
                render view: 'script', model: data, contentType: 'application/javascript'
            } else {
                render text: "Model could not be found", status: HttpStatus.BAD_REQUEST
            }

        } else {
            render text: "Parameter outputName is required", status: HttpStatus.BAD_REQUEST
        }
    }
}
