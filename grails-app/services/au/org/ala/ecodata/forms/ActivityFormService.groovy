package au.org.ala.ecodata.forms

import org.codehaus.groovy.grails.web.json.JSONArray
import org.codehaus.groovy.grails.web.json.JSONElement
import org.codehaus.groovy.grails.web.json.JSONObject

/**
 * Responsible for retrieving ActivityForms from ecodata.
 */
class ActivityFormService {

    static final String ACTIVITY_FORM_PATH = '/activityForm'
    def webService
    def grailsApplication

    /**
     * Returns the activity form identified by name and version.  If version is ommitted the most recent
     * published version will be returned.
     */
    def findActivityForm(String name, Integer version = null) {

        String url = grailsApplication.config.ecodata.service.url +
                ACTIVITY_FORM_PATH+'?name='+URLEncoder.encode(name, 'UTF-8')
        if (version) {
            url += '&formVersion='+version
        }
        webService.getJson(url)
    }

    /**
     * This is a compatibility API to return activity form information in the same format as
     * returned by the MetadataService.getActivityMetadata
     * This is to allow for a incremental transition to the new API.
     * @param name
     * @param version
     * @return
     */
    Map getActivityAndOutputMetadata(String name, Integer version = null) {
        Map activityForm = findActivityForm(name, version)
        List formSections = activityForm.sections

        Map model = [:]
        model.metaModel = new JSONObject(activityForm)
        model.metaModel.remove('sections')
        model.metaModel.outputs = new JSONArray(formSections.collect{it.name})
        model.metaModel.outputConfig = new JSONArray(formSections.collect{new JSONObject(outputName:it.name, optional:it.optional, collapsedByDefault:it.collapsedByDefault, optionalQuestionText:it.optionalQuestionText)})

        // the array of output models
        model.outputModels = formSections.collectEntries { [ it.name, it.template] }

        model
    }
}
