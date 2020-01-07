package au.org.ala.ecodata.forms

import geb.spock.GebReportingSpec
import pages.PreviewPage

class ImageTypeSpec extends GebReportingSpec {

    def "The default behaviour of the view mode of the image view type is to show metadata on hover"() {
        when:
        to ([name:'images', mode:'view'], PreviewPage)

        then:
        title == "Preview Images Example"

        when: "We hover over the photo"
        interact {
            moveToElement($('[data-bind*=images2]'))
        }

        then: "A popover is displayed containing the photo metadata"
        waitFor {
            $('.popover').displayed
        }
        and: "the photo metadata is displayed correctly"
        $(".popover span[data-bind*=name]").text() == "Test image 2"
        $(".popover span[data-bind*=attribution]").text() == "Test attribution 2"
        $(".popover span[data-bind*=notes]").text() == "Test notes 2"

    }
}
