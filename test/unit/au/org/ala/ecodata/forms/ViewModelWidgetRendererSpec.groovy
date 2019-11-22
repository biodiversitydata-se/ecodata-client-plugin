package au.org.ala.ecodata.forms

import grails.test.mixin.Mock
import grails.test.mixin.TestMixin
import grails.test.mixin.support.GrailsUnitTestMixin
import org.codehaus.groovy.grails.plugins.codecs.HTMLCodec
import org.codehaus.groovy.grails.plugins.web.taglib.RenderTagLib
import org.codehaus.groovy.grails.web.taglib.NamespacedTagDispatcher
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

    def "the image view type accepts a parameter to chose the view template"() {
        setup:
        ctx = ctxBuilder().model([source:'myImage', type:'image', displayOptions:[metadataAlwaysVisible:true]]).build()
        ctx.g = Mock(NamespacedTagDispatcher)

        when:
        viewModelWidgetRenderer.renderImage(ctx)

        then:
        1 * ctx.g.methodMissing("render", {it[0].template == '/output/imageDataTypeViewModelWithMetadataTemplate' && it[0].model.name == 'myImage'})

        when:
        ctx.model.displayOptions = null
        viewModelWidgetRenderer.renderImage(ctx)

        then:
        1 * ctx.g.methodMissing("render", {it[0].template == '/output/imageDataTypeViewModelTemplate' && it[0].model.name == 'myImage'})
    }

    WidgetRenderContextBuilder ctxBuilder() {
        new WidgetRenderContextBuilder()
    }
}
