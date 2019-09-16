package au.org.ala.ecodata.forms

import grails.test.mixin.TestMixin
import grails.test.mixin.support.GrailsUnitTestMixin
import org.codehaus.groovy.grails.plugins.codecs.HTMLCodec
import spock.lang.Specification

@TestMixin(GrailsUnitTestMixin)
class ViewModelWidgetRendererSpec extends Specification {

    ViewModelWidgetRenderer viewModelWidgetRenderer
    WidgetRenderContext ctx

    def setup() {
        viewModelWidgetRenderer = new ViewModelWidgetRenderer()
        mockCodec(HTMLCodec)
    }

    def "the readonlyText method renders text in a span"() {
        setup:
        ctx = ctxBuilder().model([source:'myText', type:'readonlyText']).build()

        when:
        viewModelWidgetRenderer.renderReadonlyText(ctx)

        then:
        TestUtils.compareHtml(ctx.writer, """<span data-bind="text:${ctx.model.source}"></span>""")

    }

    WidgetRenderContextBuilder ctxBuilder() {
        new WidgetRenderContextBuilder()
    }
}
