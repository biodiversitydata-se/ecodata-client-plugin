package au.org.ala.ecodata.forms

import geb.spock.GebReportingSpec
import pages.PreviewPage

class TableFooterSpec extends GebReportingSpec {

    def "Table footers can be displayed"() {
        when:
        to ([name:'tableFooterExample', data:'table-data'], PreviewPage)

        then:
        title == "Preview Table footer example"
        page.model != null

        and: "The total in the table footer has the correct value"
        page.findFieldByModelName("totalValue3").text() == "3.00"

    }

    def "Table footers can be displayed in view mode"() {
        when:
        to ([name:'tableFooterExample', mode:'view', data:'table-data'], PreviewPage)

        then:
        title == "Preview Table footer example"

        and: "The total in the table footer has the correct value"
        page.findFieldByModelName("totalValue3").text() == "3.00"

    }




}
