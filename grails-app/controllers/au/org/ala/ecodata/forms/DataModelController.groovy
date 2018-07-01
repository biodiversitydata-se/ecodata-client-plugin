package au.org.ala.ecodata.forms

import org.apache.http.HttpStatus

class DataModelController {
    def metadataService
    def getScript() {
        String outputName = params.outputName
        if (outputName) {
            Map data = [:]
            data.outputName = outputName
            data.edit = true
            data.model = metadataService.getDataModelFromOutputName(outputName)
            render view: 'script', model: data
        } else {
            render text: "Parameter outputName is required", status: HttpStatus.SC_BAD_REQUEST
        }
    }
}
