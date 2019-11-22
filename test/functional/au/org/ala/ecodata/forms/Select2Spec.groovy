package au.org.ala.ecodata.forms

import geb.spock.GebReportingSpec
import pages.PreviewPage

class Select2Spec extends GebReportingSpec {

    def "We can enter data into select2 dropdowns"() {
        when:
        to ([name:'select2Example'], PreviewPage)

        then:
        title == "Preview Select2 example"
        page.model != null

        when: "We enter data into the fields"
        page.findFieldByModelName("item1").value("value 1")
        page.findFieldByModelName("item2").value("value 2")
        page.findFieldByModelName("item3").value(["value 1", "value 3"])

        then: "The model has been updated with the selected values"
        page.model.data.item1 == "value 1"
        page.model.data.item2 == "value 2"
        page.model.data.item3 == ["value 1", "value 3"]

    }

    def "Model data is displayed in view mode for select2 view types"() {
        when:
        to ([name:'select2Example', mode:'view', data:'select2-view-data'], PreviewPage)

        then:
        title == "Preview Select2 example"

        and: "The values from the data model are displayed"
        $("span[data-bind*=item1").text() == "value 1"
        $("span[data-bind*=item2").text() == "value 2"
        $("span[data-bind*=item3").text() == "value 1, value 3"

    }
}
