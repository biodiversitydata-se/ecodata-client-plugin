describe("Feature Map Spec", function () {

    beforeAll(function () {
        window.ALA = {
            Map : function () {
                var self = this;
                self.getMapImpl = function() {
                    return {
                        eachLayer: function(){},
                        on:function(){}
                    };
                }
                self.drawnItems = {
                    on : function() {return{}}
                }
            }
        };

        window.L = {
            Google: function(){}
        }
    });
    it("can initialise with a mock map", function() {
        var map = ecodata.forms.maps.featureMap({displayScale:false});
    });
});