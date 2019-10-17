package pages

import geb.Module

class FeatureMap extends Module {
    static content = {
    }

    def drawPolygon() {

        def polygonDraw = $('.leaflet-draw-draw-polygon')
        waitFor { polygonDraw.displayed }

        // Wakeup the map (leaflet_sleep will be preventing interaction otherwise
        interact {
            moveToElement($('.leaflet-map-pane'))
        }

        interact {
            moveToElement(polygonDraw)
        }

        polygonDraw.click()

        interact {
            moveByOffset(100, 100)
        }
        waitFor{$('.leaflet-draw-actions').getAt(0).displayed}

        interact {
            click()
            moveByOffset(20, 20)
            click()
            moveByOffset(-20, 20)
            click()

            moveByOffset(-20, -20)
            click()

            moveByOffset(20, -20)
            click()
            moveByOffset(20, 20)
            doubleClick()

        }
    }

    def selectExistingSite() {

    }

    def ok() {

    }

    def cancel() {

    }
}
