<!-- ko stopBinding: true -->
<div id="map-modal" class="modal modal-fullscreen hide fade large">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h3>Mapping Site Activities</h3>
    </div>
    <div class="modal-body">
        <m:map id="map-popup" width="100%"></m:map>
    </div>

    <div class="modal-footer">
        <a href="#" class="btn" data-dismiss="modal" aria-hidden="true">Cancel</a>
        <a href="#" class="btn btn-primary" data-bind="click:ok" data-dismiss="modal" aria-hidden="true">Ok</a>
    </div>
</div>
<!-- /ko -->