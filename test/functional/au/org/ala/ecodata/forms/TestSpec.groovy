package au.org.ala.ecodata.forms

import geb.spock.GebReportingSpec
import pages.PreviewPage

class TestSpec extends GebReportingSpec {

    def "test this!"() {
        when:
        to PreviewPage

        then:
        title == "Preview Test Output"
        page.model != null

        when:
        page.findFieldByModelName("textField").value("value1")
        page.commitEdits()


        then:
        page.findFieldByModelName("textField").getAt(0).value() == "value1"
        page.findFieldByModelName("textField").getAt(1).value() == "value1"

        page.model.data.textField == "value1"
    }


    def "number fields should allow decimals by default"() {
        when:
        to PreviewPage

        then:
        title == "Preview Test Output"
        page.model != null

        when:
        page.findFieldByModelName("numberField").value("1.03")


        then:
        page.findFieldByModelName("numberField").getAt(0).value() == "1.03"
        page.commitEdits()

        page.model.data.numberField == "1.03"

        and: "The HTML5 validation psuedo class has not been applied"
        // Note the :invalid selector won't work with the HTMLUnit driver.
        $(":invalid").size() == 0
    }

    def "prepopulation can be configured as a URL"() {
        when:
        to ([name:'prepopFromURLExample'], PreviewPage)

        then:
        title == "Preview Prepop from URL example"

        and: "the prepopulation has populated the fields on the page"
        page.findFieldByModelName("item1").getAt(0).value() == "1"
        page.findFieldByModelName("item2").getAt(0).value() == "2"

    }

}
