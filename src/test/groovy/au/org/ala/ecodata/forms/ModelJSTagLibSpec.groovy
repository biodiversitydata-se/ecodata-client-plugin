package au.org.ala.ecodata.forms

//import grails.test.mixin.TestFor
import grails.testing.web.taglib.TagLibUnitTest
import spock.lang.Specification

//@TestFor(ModelJSTagLib)
class ModelJSTagLibSpec extends Specification implements TagLibUnitTest<ModelJSTagLib> {

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
        actualOut.toString().trim() == 'data.myFeature = ko.observable().extend({feature:config}).extend({metadata:{metadata:self.dataModel[\'myFeature\'], context:self.\$context, config:config}});'
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

    void "number types with expression based default values need to be initialised with undefined instead of 0"() {
        setup:
        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'number',name:'item1',defaultValue:[expression:"3*4"]]

        when:
        tagLib.renderInitialiser(ctx)

        then:
        actualOut.toString().trim() == "data['item1'](ecodata.forms.orDefault(data['item1'], undefined));"
    }

    void "the existence of an expression based default value should result in the use of the writableComputed extender"() {
        setup:
        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'text',name:'item1',defaultValue:[expression:"3*4"]]

        when:
        String extenders = tagLib.extenderJS(ctx)

        then:
        extenders == ".extend({writableComputed:{expression:'3*4', context:data}})"
    }
}
