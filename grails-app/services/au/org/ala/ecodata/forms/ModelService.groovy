package au.org.ala.ecodata.forms

import java.text.DateFormat
import java.text.SimpleDateFormat

class ModelService {
    static DateFormat ISO8601 = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ")

    def grailsApplication, webService, cacheService, authService

    def activitiesModel() {
        return cacheService.get('activity-model',{
            webService.getJson(grailsApplication.config.ecodata.service.url +
                '/metadata/activitiesModel')
        })
    }

    def getDataModelFromOutputName(outputName) {
        def activityName = getActivityModelName(outputName)
        return activityName ? getDataModel(activityName) : null
    }

    def getDataModel(template) {
        return cacheService.get(template + '-model',{
            webService.getJson(grailsApplication.config.ecodata.service.url +
                    "/metadata/dataModel/${template}")
        })
    }

    def getActivityModelName(outputName) {
        return activitiesModel().outputs.find({it.name == outputName})?.template
    }

    def evaluateDefaultDataForDataModel(dm) {
        def value = dm.defaultValue
        switch (dm.dataType) {
            case 'text':
                if (dm.constraints && value?.matches(/\d+/)) {
                    int index = value as Integer
                    if (index < dm.constraints.size()) {
                        value = dm.constraints[index]
                    }
                } else if(dm.name == 'recordedBy' && !value) {
                    value = "'${authService.userDetails()?.getDisplayName()}'"
                }
                break
            case 'date':
                String now = ISO8601.clone().format(new Date())
                while (value?.contains('${now}')) {
                    value = value.replace('${now}', "'${now}'")
                }
                break;
            default:
                break
        }

        return value
    }
}
