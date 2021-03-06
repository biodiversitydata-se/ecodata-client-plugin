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

    void "number types support a configurable number of decimal places"() {
        setup:
        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'number',name:'item1']

        when: "no decimal places is specified"
        tagLib.numberViewModel(ctx)

        then: "the default is 2"
        actualOut.toString().trim() == "data.item1 = ko.observable().extend({numericString:2});"

        when: "a number of decimal places is specified"
        ctx.dataModel.decimalPlaces = 3
        actualOut = new StringWriter()
        ctx.out = new PrintWriter(actualOut)
        tagLib.numberViewModel(ctx)

        then:
        actualOut.toString().trim() == "data.item1 = ko.observable().extend({numericString:3});"

    }

    void "the existence of an expression based default value should result in the use of the writableComputed extender"() {
        setup:
        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'text',name:'item1',defaultValue:[expression:"3*4"]]

        when:
        String extenders = tagLib.extenderJS(ctx)

        then:
        extenders == ".extend({writableComputed:{expression:'3*4', context:data, decimalPlaces:undefined}})"
    }

    void "default values derived from an expression should respect the target observable decimalPlaces configuration"() {
        setup:
        ctx.attrs = [:]
        ctx.propertyPath = 'data'
        ctx.dataModel = [dataType:'number', decimalPlaces: 4, name:'item1',defaultValue:[expression:"3*4"]]

        when:
        String extenders = tagLib.extenderJS(ctx)

        then:
        extenders == ".extend({writableComputed:{expression:'3*4', context:data, decimalPlaces:4}})"
    }

    def "computed values containing expressions are rendered correctly"() {
        setup:
        Map dataModel = [type:'number', name:'test', dataType:'number', computed:[expression:'test1+1']]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "data.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', data, 2); });",
                actualOut.toString())
    }

    def "computed values with expressions are rendered correctly"() {
        setup:
        Map dataModel = [type:'number', name:'test', dataType:'number', computed:[expression:'test1+1']]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "data.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', data, 2); });",
                actualOut.toString())
    }

    def "computed values allow the number of decimal places in the result to be specified"() {
        setup:
        Map dataModel = [type:'number', name:'test', dataType:'number', computed:[expression:'test1+1', rounding:3]]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "data.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', data, 3); });",
                actualOut.toString())
    }

    def "computed values will use the dataModel decimal places for the result if rounding is not specified"() {
        setup:
        Map dataModel = [type:'number', name:'test', dataType:'number', decimalPlaces: 4, computed:[expression:'test1+1']]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "data.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', data, 4); });",
                actualOut.toString())
    }

    def "computed values inside tables/lists with expressions are rendered correctly"() {
        setup:
        Map dataModel = [dataType:'list', name:'list', columns:[[name:'test', dataType:'number', computed:[expression:'test1+1']]]]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        ctx = ctx.createChildContext()
        ctx.propertyPath = 'self'
        ctx.dataModel = dataModel.columns[0]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "self.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', self, 2); });",
                actualOut.toString())
    }

    def "computed values with behaviours are rendered correctly"() {
        setup:
        Map computedValidation = [type:'conditional_validation', condition:'test1 == 1', value:[validate:'required', message:'test message']]
        Map dataModel = [type:'number', name:'test', dataType:'number', computed:[expression:'test1+1'], behaviour:[computedValidation]]
        ctx.dataModel = dataModel
        ctx.propertyPath = 'data'
        ctx.attrs = [:]

        when:
        tagLib.computedModel(ctx)

        then:

        compareWithoutWhiteSpace(
                "data.test = ko.computed(function() { return ecodata.forms.expressionEvaluator.evaluate('test1+1', data, 2); });"+
                "data.test = data.test.extend({metadata:{metadata:self.dataModel['test'],context:self.\$context,config:config}});",
                actualOut.toString())
    }


    private void compareWithoutWhiteSpace(String expected, String actual) {
        assert expected.replaceAll(/\s/, "") == actual.replaceAll(/\s/, "")
    }
}
