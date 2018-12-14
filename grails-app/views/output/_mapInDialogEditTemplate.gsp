<!-- ko stopBinding: true -->
<div id="map-modal" class="modal modal-fullscreen hide fade large">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>

        <h3>Mapping Site Activities <span data-bind="text:heading"></span></h3>
    </div>

    <div class="modal-body" style="position:relative;">

        <div style="margin-right:20em;">
            <m:map id="map-popup" width="100%"></m:map>
        </div>

        <div class="accordion" style="position:absolute; right:10px; top:15px; width: 20em;">

            <div class="accordion-group">
                <div class="accordion-heading">
                    <a class="accordion-toggle" data-toggle="collapse" href="#collapseDrawnSites">
                        This service
                    </a>
                </div>

                <div id="collapseDrawnSites" class="accordion-body collapse in">
                    <ul class="unstyled accordion-inner">
                        <li data-bind="if:editableSites().length == 0">None defined</li>
                        <!-- ko foreach:editableSites -->
                        <li data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                            <label><span data-bind="text:properties.name || 'Unnamed site'"></span></label>
                            <button class="btn" data-bind="click:$root.deleteFeature"><i class="fa fa-remove"></i>
                            </button>
                            <button class="btn" data-bind="click:$root.zoomToFeature"><i class="fa fa-search"></i>
                            </button>

                        </li>
                        <!-- /ko -->
                    </ul>

                </div>

            </div>
            <!-- ko foreach: categories -->
            <div class="accordion-group">
                <div class="accordion-heading">
                    <a class="accordion-toggle" data-toggle="collapse" href="#collapseOne"
                       data-bind="attr:{href:'#sites-category-'+$index()}">
                        <span data-bind="text:category"></span>
                    </a>
                </div>

                <div data-bind="attr:{id:'sites-category-'+$index()}" class="accordion-body collapse in">
                    <div class="accordion-inner">
                        <ul class="unstyled" data-bind="foreach:features">
                            <li data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                                <label><span data-bind="text:properties.name || 'Unnamed site'"></span></label>
                                <button class="btn" data-bind="click:$root.copyFeature"><i class="fa fa-edit"></i>
                                </button>
                                <button class="btn" data-bind="click:$root.zoomToFeature"><i class="fa fa-search"></i>
                                </button>

                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- /ko -->

        </div>
    </div>


    <div class="modal-footer">
        <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</a>
        <a href="#" class="btn btn-primary" data-bind="click:ok" data-dismiss="modal" aria-hidden="true">Ok</a>
    </div>
</div>
<!-- /ko -->