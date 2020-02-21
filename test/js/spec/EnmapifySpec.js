function resolveSites() {
    return [];
}

var Biocollect = {
    "MapUtilities" : {
        "getBaseLayerAndOverlayFromMapConfiguration": function () {
            return {};
        },
        "featureToValidGeoJson": function () {
            return {
                type: "Feature",
                geometry: {},
                properties: {}
            }
        }
    }
};

fcConfig = {};
var ALA = {
    "Map": function () {
        return {
            subscribe: function () {
                
            },
            markMyLocation: function () {
                
            },
            getGeoJSON: function () {
                
            },
            registerListener: function () {
                
            },
            addButton: function () {
                
            }
        }
    }
};

function Emitter (viewModel) {
    viewModel.emit = function () {

    };
}

describe("Enmapify Spec", function () {

    var mockElement = null;
    var options = null;
    beforeEach(function() {
        options = {
            viewModel: {mapElementId: "map"}
            , container: {"Test": "ghh"}
            , name: "Test"
            , edit: true
            , readonly: false
            , markerOrShapeNotBoth: true
            , proxyFeatureUrl: ''
            , spatialGeoserverUrl: ''
            , updateSiteUrl: ''
            , listSitesUrl: ''
            , getSiteUrl: ''
            , uniqueNameUrl: ''
            , activityLevelData: {
                pActivity : {
                    name: 'Test',
                    projectId: 'abc',
                    projectActivityId: 'def',
                    defaultZoomArea: 'aaa',
                    sites: [{
                        siteId: "ghh",
                        extent: {
                            geometry: {
                                type: "point",
                                coordinates: [1,1]
                            }
                        }
                    }],
                    allowPolygons: true,
                    allowPoints: true,
                    allowLine: true,
                    selectFromSitesOnly: false,
                    surveySiteOption: 'sitecreate',
                    addCreatedSiteToListOfSelectedSites: undefined
                },
                project: {
                    projectId: 'abc',
                    sites: [
                        {
                            siteId: "ghh",
                            extent: {
                                geometry: {

                                }
                            }
                        }
                    ]
                },
                siteId: 'ghh',
                activity: {
                    siteId: 'ghh'
                }
            }
            , hideSiteSelection: false
            , hideMyLocation: false
            , context: {}
        };
        mockElement = document.createElement('div');
        mockElement.setAttribute('id','map' );
    });

    it("when config is to pick from a list of pre-defined sites, then map config should not show drawing controls", function() {
        options.activityLevelData.pActivity.allowPolygons = false;
        options.activityLevelData.pActivity.allowLine = false;
        options.activityLevelData.pActivity.allowPoints = false;
        options.activityLevelData.pActivity.surveySiteOption = 'sitepick';
        options.activityLevelData.pActivity.addCreatedSiteToListOfSelectedSites = true;

        var result = enmapify(options);
        expect(result.mapOptions.drawOptions.polygon).toBe(false);
        expect(result.mapOptions.drawOptions.marker).toBe(false);
        expect(result.mapOptions.drawOptions.polyline).toBe(false);
        expect(result.mapOptions.drawOptions.rectangle).toBe(false);
        expect(result.mapOptions.drawOptions.circle).toBe(false);
        expect(result.mapOptions.drawOptions.edit).toBe(false);
    });

    it("when config is to allow user to create site and not to pick from pre-defined list, then map config should show drawing controls", function() {
        options.activityLevelData.pActivity.allowPolygons = true;
        options.activityLevelData.pActivity.allowPoints = true;
        options.activityLevelData.pActivity.allowLine = false;
        options.activityLevelData.pActivity.surveySiteOption = 'sitecreate';
        options.activityLevelData.pActivity.sites = [];
        options.activityLevelData.pActivity.addCreatedSiteToListOfSelectedSites = false;

        var result = enmapify(options);
        expect(result.mapOptions.drawOptions.polygon).toEqual(jasmine.any(Object));
        expect(result.mapOptions.drawOptions.marker).toBe(true);
        expect(result.mapOptions.drawOptions.polyline).toBe(false);
        expect(result.mapOptions.drawOptions.rectangle).toBe(true);
        expect(result.mapOptions.drawOptions.circle).toBe(true);
        expect(result.mapOptions.drawOptions.edit).toBe(true);

        options.activityLevelData.pActivity.allowPolygons = false;
        options.activityLevelData.pActivity.allowPoints = false;
        options.activityLevelData.pActivity.allowLine = true;
        options.activityLevelData.pActivity.surveySiteOption = 'sitecreate';
        options.activityLevelData.pActivity.sites = [];
        options.activityLevelData.pActivity.addCreatedSiteToListOfSelectedSites = false;

        result = enmapify(options);
        expect(result.mapOptions.drawOptions.polygon).toEqual(false);
        expect(result.mapOptions.drawOptions.marker).toBe(false);
        expect(result.mapOptions.drawOptions.polyline).toBe(true);
        expect(result.mapOptions.drawOptions.rectangle).toBe(false);
        expect(result.mapOptions.drawOptions.circle).toBe(false);
        expect(result.mapOptions.drawOptions.edit).toBe(true);

    });

    it("when config is to allow user to create site and to pick from pre-defined list, then map config should show drawing controls", function() {
        options.activityLevelData.pActivity.allowPolygons = true;
        options.activityLevelData.pActivity.allowPoints = true;
        options.activityLevelData.pActivity.allowLine = true;
        options.activityLevelData.pActivity.selectFromSitesOnly = true;
        options.activityLevelData.pActivity.surveySiteOption = 'sitepickcreate';
        options.activityLevelData.pActivity.addCreatedSiteToListOfSelectedSites = true;

        var result = enmapify(options);
        expect(result.mapOptions.drawOptions.polygon).toEqual(jasmine.any(Object));
        expect(result.mapOptions.drawOptions.marker).toBe(true);
        expect(result.mapOptions.drawOptions.polyline).toBe(true);
        expect(result.mapOptions.drawOptions.rectangle).toBe(true);
        expect(result.mapOptions.drawOptions.circle).toBe(true);
        expect(result.mapOptions.drawOptions.edit).toBe(true);
    });

    it("site selection should be visible or invisible according to the number of sites selected", function () {
        options.activityLevelData.pActivity.surveySiteOption = 'sitepick';
        options.activityLevelData.pActivity.sites = ['abc'];

        var result = enmapify(options);
        expect(result.hideSiteSelection()).toEqual(true);

        options.activityLevelData.pActivity.surveySiteOption = 'sitecreate';
        options.activityLevelData.pActivity.sites = ['abc'];

        result = enmapify(options);
        expect(result.hideSiteSelection()).toEqual(false);
    });

    it("map should validate if site id is set", function () {
        options.activityLevelData.activity.siteId = "ghh";
        var result = enmapify(options);
        result.viewModel.loadActivitySite();
        expect(result.checkMapInfo().validation).toEqual(true);

        options.activityLevelData.activity.siteId = "";
        var result = enmapify(options);
        result.viewModel.loadActivitySite();
        expect(result.checkMapInfo().validation).toEqual(false);
    })
});