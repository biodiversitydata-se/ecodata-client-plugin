package au.org.ala.ecodata.forms

import grails.test.mixin.TestFor
import spock.lang.Specification
@TestFor(ModelJSTagLib)
class ModelJSTagLibSpec extends Specification {

    StringWriter actualOut
    ModelJSTagLib.JSModelRenderContext ctx
    ModelService modelService = Mock(ModelService)

    def setup() {
        ctx = new ModelJSTagLib.JSModelRenderContext(tagLib)
        ctx.attrs = [:]
        actualOut = new StringWriter()
        ctx.out = new PrintWriter(actualOut)
        tagLib.out = actualOut
        tagLib.modelService = modelService
    }

    void "the feature data type should be rendered with the feature extender"() {
        setup:

        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'feature',name:'myFeature']

        when:
        tagLib.renderDataModelItem(ctx)

        then:
        actualOut.toString().trim() == 'data.myFeature = ko.observable().extend({metadata:{metadata:self.dataModel[\'myFeature\'], context:context, config:config}}).extend({feature:config});'
    }

    void "the feature data type doesn't need any special initialisation behaviour"() {
        setup:

        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'feature',name:'myFeature']

        when:
        tagLib.renderInitialiser(ctx)

        then:
        actualOut.toString().trim() == "data['myFeature'].loadData(ecodata.forms.orDefault(data['myFeature'], undefined));"
    }
}
