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


        then:
        page.findFieldByModelName("textField").getAt(0).value() == "value1"
        page.findFieldByModelName("textField").getAt(1).value() == "value1"

        page.model.data.textField == "value1"
    }
}
