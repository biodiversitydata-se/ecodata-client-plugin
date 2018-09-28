package au.org.ala.ecodata.forms

import groovy.xml.MarkupBuilder

/**
 * Provides utility tags used by the plugin.
 */
class HelperTagLib {
    static defaultEncodeAs = [taglib: 'none']
    static namespace = "md"

    /**
     * @attr title
     * @attr printable Is this being printed?
     * body content should contain the help text
     */
    def iconHelp = { attrs, body ->
        if (!attrs.printable) {
            MarkupBuilder mb = new MarkupBuilder(out)
            String title = message(code:attrs.titleCode, default: attrs.title)
            String helpText
            if (attrs.helpTextCode) {
                helpText = message(code:attrs.helpTextCode)
            }
            else {
                helpText = body()
            }

            Map spanAttrs = [class:'helphover', 'data-original-title':title, 'data-placement':'top', 'data-content':helpText, 'data-trigger':'click']
            if (attrs['dynamic-help']) {
                spanAttrs << ['data-bind':"attr:{'data-content':"+attrs['dynamic-help']+"}"]
            }
            if (attrs.container) {
                spanAttrs << ['data-container':attrs.container]
            }
            if (attrs.html) {
                spanAttrs << ['data-html':'true']
            }
            mb.span(spanAttrs) {
                i(class:'fa fa-question-circle') {
                    mkp.yieldUnescaped("&nbsp;")
                }
            }
        }
    }

    def toSingleWord = { attrs, body ->
        def name = attrs.name ?: body()
        out << name.replaceAll(' ','_')
    }
}
