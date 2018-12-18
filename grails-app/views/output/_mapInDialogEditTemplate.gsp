<!-- ko stopBinding: true -->
<!-- ko with:viewModelDelegate -->
<div id="map-modal" class="modal modal-fullscreen hide fade large">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>

        <h3>Mapping Site Activities</h3>
    </div>

    <div class="modal-body" style="position:relative;">

        <div style="margin-right:20em;">
            <m:map id="map-popup" width="100%"></m:map>
        </div>


        <div class="sites-list-sidebar">
            <div class="accordion-group">
                <div class="sites-list-heading">
                    <span class="site-category-heading">Site/s for this service</span>
                    <button class="pull-right btn" data-bind="click:$root.zoomToDrawnSites"><i class="fa fa-search"></i>
                    </button>
                    <button class="pull-right btn" data-bind="click:$root.editSites"><i class="fa fa-edit"></i></button>
                </div>


                <ul class="sites-category unstyled accordion-inner">
                    <li data-bind="if:editableSites().length == 0">No sites have been defined</li>
                    <!-- ko foreach:editableSites -->
                    <li class="clearfix site-label"
                        data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                        <label class="pull-left"><span data-bind="text:properties.name || 'Unnamed site'"></span>
                        </label>
                        <button class="pull-right btn" data-bind="click:$root.deleteFeature"><i
                                class="fa fa-remove"></i>
                        </button>
                        <button class="pull-right btn" data-bind="click:$root.zoomToFeature"><i
                                class="fa fa-search"></i>
                        </button>

                    </li>
                    <!-- /ko -->
                </ul>
            </div>

            <div class="accordion">
                <!-- ko foreach: categories -->
                <div class="accordion-group">
                    <div class="sites-list-heading">
                        <a class="accordion-toggle" data-toggle="collapse" href="#collapseOne"
                           data-bind="attr:{href:'#sites-category-'+$index()}">
                            <i class="fa fa-arrows-alt"></i>
                        </a>
                        <span class="site-category-heading" data-bind="text:category"></span>
                        <button class="pull-right btn" data-bind="click:$root.zoomToCategorySites"><i
                                class="fa fa-search"></i></button>
                    </div>

                    <div data-bind="attr:{id:'sites-category-'+$index()}" class="accordion-body collapse in">
                        <div class="accordion-inner">
                            <ul class="sites-category unstyled" data-bind="foreach:features">
                                <li class="clearfix site-label"
                                    data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                                    <label class="pull-left"><span
                                            data-bind="text:properties.name || 'Unnamed site'"></span></label>
                                    <button class="pull-right btn" data-bind="click:$root.copyFeature"
                                            title="Copy (and edit) this site"><i class="fa fa-copy"></i>
                                    </button>
                                    <button class="pull-right btn" data-bind="click:$root.zoomToFeature"
                                            title="Zoom to this site"><i class="fa fa-search"></i>
                                    </button>

                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <!-- /ko -->

            </div>
        </div>
    </div>


    <div class="modal-footer">
        <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</a>
        <a href="#" class="btn btn-primary" data-bind="click:ok" data-dismiss="modal" aria-hidden="true">Ok</a>
    </div>
</div>
<!-- /ko -->
<!-- /ko -->