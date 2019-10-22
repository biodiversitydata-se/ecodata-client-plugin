package au.org.ala.ecodata.forms

import org.springframework.http.HttpStatus

//import org.apache.http.HttpStatus

class DataModelController {
    def modelService
    def getScript() {
        String outputName = params.outputName
        if (outputName) {
            Map data = [:]
            data.outputName = outputName
            data.edit = params.getBoolean('edit', false)
            data.readonly= !data.edit
            data.model = modelService.getDataModelFromOutputName(outputName)
            render view: 'script', model: data
        } else {
            render text: "Parameter outputName is required", status: HttpStatus.SC_BAD_REQUEST
        }
    }
}
