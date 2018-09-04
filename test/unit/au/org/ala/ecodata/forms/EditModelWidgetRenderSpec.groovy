package au.org.ala.ecodata.forms

import grails.test.mixin.TestMixin
import grails.test.mixin.support.GrailsUnitTestMixin
import org.codehaus.groovy.grails.plugins.codecs.HTMLCodec
import spock.lang.Specification
import org.codehaus.groovy.grails.web.json.JSONObject

@TestMixin(GrailsUnitTestMixin)
class EditModelWidgetRenderSpec extends Specification {

    EditModelWidgetRenderer editModelWidgetRenderer
    WidgetRenderContext ctx

    def setup() {
        editModelWidgetRenderer = new EditModelWidgetRenderer()
        mockCodec(HTMLCodec)
    }

    def "the feature view model type should be rendered as a feature tag"() {
        setup:
        ctx = ctxBuilder().model([source:'myFeature', type:'feature']).build()

        when:
        editModelWidgetRenderer.renderFeature(ctx)

        then:
        ctx.writer.toString() == """<feature params="feature:myFeature, config:\$config.getConfig('feature', myFeature)"></feature>"""
    }

    def "the feature view model has a dependency on a global template, and must specifiy this"() {
        setup:
        ctx = ctxBuilder().model([source:'myFeature', type:'feature']).build()

        when:
        editModelWidgetRenderer.renderFeature(ctx)

        then:
        ctx.deferredTemplates.contains('/output/mapInDialogTemplate')
    }

    def "the number data type should include a step attribute to make decimal values valid by default"() {
        setup:
        ctx = ctxBuilder().model([source:'myNumber', type:'number']).build()

        when:
        editModelWidgetRenderer.renderNumber(ctx)

        then:
        TestUtils.compareHtml(ctx.writer, """<input type="number" step="any" data-bind="value:myNumber" class="input-small">""")
    }

    WidgetRenderContextBuilder ctxBuilder() {
        new WidgetRenderContextBuilder()
    }

    class WidgetRenderContextBuilder {

        JSONObject model
        String context = ""
        String validationAttr = ""
        Databindings bindings = null
        AttributeMap attributeMap = null
        AttributeMap labelAttributes = null
        def g = null
        def tagAttrs = null


        WidgetRenderContextBuilder model(Map model) {
            this.model = new JSONObject(model)
            this
        }
        WidgetRenderContextBuilder context(String context) {
            this.context = context
            this
        }

        WidgetRenderContext build() {
            new WidgetRenderContext(model, context, validationAttr, bindings, attributeMap, labelAttributes, g, tagAttrs)
        }

    }

}
