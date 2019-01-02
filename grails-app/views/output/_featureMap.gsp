<div class="feature-map">
    <div class="map-container">
        <m:map id="map-holder" width="100%"></m:map>
    </div>

    <div class="sites-list-sidebar">
        <div class="accordion-group">
            <div class="sites-list-heading">
                <div class="site-label">
                    <label class="site-category-heading">Site/s for this service</label>

                    <div class="btn-container">
                        <button class="btn" data-bind="click:$root.defaultZoom"><i class="fa fa-search"></i>
                        </button>
                        <button class="btn" data-bind="click:$root.editSites"><i class="fa fa-edit"></i></button>
                    </div>
                </div>
            </div>


            <ul class="sites-category unstyled accordion-inner">
                <li data-bind="if:editableSites().length == 0">No sites have been defined</li>
                <!-- ko foreach:editableSites -->
                <li class="clearfix site-label"
                    data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                    <label><span data-bind="text:properties.name || 'Unnamed site'"></span>
                    </label>

                    <div class="btn-container">
                        <button class="btn" data-bind="click:$root.deleteFeature"><i
                                class="fa fa-remove"></i>
                        </button>
                        <button class="btn" data-bind="click:$root.zoomToFeature"><i
                                class="fa fa-search"></i>
                        </button>
                    </div>

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

                    <div class="site-label">
                        <label class="site-category-heading" data-bind="text:category"></label>

                        <div class="btn-container">
                            <button class="btn" data-bind="click:$root.zoomToCategorySites"><i
                                    class="fa fa-search"></i></button>
                        </div>
                    </div>
                </div>

                <div data-bind="attr:{id:'sites-category-'+$index()}" class="accordion-body collapse in">
                    <div class="accordion-inner">
                        <ul class="sites-category unstyled" data-bind="foreach:features">
                            <li class="clearfix site-label"
                                data-bind="event:{mouseover:$root.highlightFeature, mouseout:$root.unhighlightFeature}">
                                <label><span
                                        data-bind="text:properties.name || 'Unnamed site'"></span></label>

                                <div class="btn-container">
                                    <button class="btn" data-bind="click:$root.copyFeature, enable:$root.copyEnabled"
                                            title="Copy (and edit) this site"><i class="fa fa-copy"></i>
                                    </button>
                                    <button class="btn" data-bind="click:$root.zoomToFeature"
                                            title="Zoom to this site"><i class="fa fa-search"></i>
                                    </button>
                                </div>

                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <!-- /ko -->

        </div>
    </div>
</div>