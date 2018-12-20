<!-- ko stopBinding: true -->
<div id="map-modal" class="modal modal-fullscreen hide fade large">
    <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>

        <h3>Mapping Site Activities</h3>
    </div>

    <div class="modal-body" style="position:relative;">

        <g:render template="/output/featureMap"/>
    </div>


    <div class="modal-footer">
        <button class="btn" data-dismiss="modal" aria-hidden="true">Cancel</button>
        <button class="btn btn-primary" aria-hidden="true">Ok</button>
    </div>
</div>
<!-- /ko -->