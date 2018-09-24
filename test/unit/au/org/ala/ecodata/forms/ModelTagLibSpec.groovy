package au.org.ala.ecodata.forms

import grails.test.mixin.TestFor
import groovy.util.slurpersupport.NodeChild
import groovy.xml.MarkupBuilder
import spock.lang.Specification

@TestFor(ModelTagLib)
class ModelTagLibSpec extends Specification {

    ModelTagLib.LayoutRenderContext ctx
    StringWriter actualOut

    StringWriter expectedOut = new StringWriter()
    MarkupBuilder mb = new MarkupBuilder(expectedOut)

    def setup() {
        ctx = new ModelTagLib.LayoutRenderContext(tagLib)
        ctx.attrs = [:]
        actualOut = new StringWriter()
        ctx.out = new PrintWriter(actualOut)
    }


    def "the view model type section renders correctly without a title"() {
        setup:
        Map model = [type:'section', items:[]]

        when:
        tagLib.section(model, ctx)

        then:
        mb.div(class:"row-fluid output-section") {
            div(class:"span12") {}
        }
        TestUtils.compareHtml(actualOut, expectedOut)
    }

    def "the view model type section supports a title attribute"() {
        setup:
        String title = 'title'
        Map model = [type:'section', title:title, items:[]]

        when:
        tagLib.section(model, ctx)

        then:
        mb.h4([:], title)
        mb.div(class:"row-fluid output-section") {
            div(class:"span12") {}
        }
        TestUtils.compareHtml(actualOut, expectedOut)
    }

    def "the view model type section supports a boxed title attribute"() {
        setup:
        String title = 'title'
        Map model = [type:'section', title:title, boxed:true, items:[]]

        when:
        tagLib.section(model, ctx)

        then:
        mb.div(class:"boxed-heading", "data-content":title) {
            div(class:'row-fluid') {
                div(class:"span12") {}
            }
        }
        TestUtils.compareHtml(actualOut, expectedOut)
    }


}
