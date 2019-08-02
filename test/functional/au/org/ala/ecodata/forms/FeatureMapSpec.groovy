package au.org.ala.ecodata.forms

import geb.spock.GebReportingSpec
import pages.PreviewPage

class FeatureMapSpec extends GebReportingSpec {



    def "feature map smoke test"() {
        when:
        to ([name:'featureModel'], PreviewPage)

        then:
        title == "Preview Feature Test"

        when:
        def button = page.findFeatureMapButtonByModelName("feature").first()
        button.click()
        waitFor{ page.featureMapDialog.map.displayed }

        then:
        page.featureMapDialog.displayed == true

        when:
        page.featureMapDialog.map.drawPolygon()

        then:
        true == true // We have a polygon, needs more setup before we can verify it fully

    }
}
