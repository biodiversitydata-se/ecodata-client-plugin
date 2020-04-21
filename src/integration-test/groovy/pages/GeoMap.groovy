package pages

import geb.Module

/*
 * Copyright (C) 2020 Atlas of Living Australia
 * All Rights Reserved.
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * Created by Temi on 20/4/20.
 */

class GeoMap extends Module {
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

        waitFor{$('.leaflet-draw-actions').getAt(0).displayed}

        interact {
            moveByOffset(100, 100)
            click()
        }

        interact {
            moveByOffset(200, -200)
            click()
        }

        interact {
            moveByOffset(0,100)
            click()

            moveByOffset(50,0)
            click()

            doubleClick()
        }

//        interact {
//
//        }

        waitFor { $("#locationCentroidLatitude").getAt(0).displayed }
    }

    def drawLine() {

        def lineDraw = $('.leaflet-draw-draw-polyline')
        waitFor { lineDraw.displayed }

        // Wakeup the map (leaflet_sleep will be preventing interaction otherwise
        interact {
            moveToElement($('.leaflet-map-pane'))
        }

        interact {
            moveToElement(lineDraw)
        }

        lineDraw.click()

        waitFor{$('.leaflet-draw-actions').getAt(0).displayed}

        interact {
            moveByOffset(100, 100)
            click()

            moveByOffset(30, -30)
            click()

            moveByOffset(0, 30)
            click()

            moveByOffset(-30, 0)
            click()
            click()
        }

//        waitFor { $("#locationCentroidLatitude").getAt(0).displayed }
    }

    def drawMarker() {

        def markerDraw = $('.leaflet-draw-draw-marker')
        waitFor { markerDraw.displayed }

        // Wakeup the map (leaflet_sleep will be preventing interaction otherwise
        interact {
            moveToElement($('.leaflet-map-pane'))
        }

        interact {
            moveToElement(markerDraw)
        }

        markerDraw.click()

        waitFor{$('.leaflet-draw-actions').getAt(0).displayed}

        interact {
            moveByOffset(100, 100)
            click()
        }

//        waitFor { $("#locationLatitude").getAt(0).displayed }
    }

    def selectExistingSite() {

    }

    def ok() {

    }

    def cancel() {

    }
}
