<tr>
    <td colspan="${colCount}" style="text-align:left;">
        <button type="button" class="btn btn-small" data-bind="visible:transients.${name}Support.allowUserAddedRows, click:transients.${name}Support.addRow"><i class="icon-plus"></i> Add a row</button>
        <g:if test="${!disableTableUpload}">
            <button type="button" class="btn btn-small" data-bind="click:transients.${name}Support.showTableDataUpload"><i class="icon-upload"></i> Upload data for this table</button>
         </g:if>
    </td>
</tr>
<g:if test="${!disableTableUpload}">
<tr data-bind="visible:transients.${name}Support.tableDataUploadVisible">
    <td colspan="${colCount}">
        <g:if test="${containsSpecies}">
            <div class="text-error text-left">
                Note: Only valid exact scientific names will be matched and populated from the database (indicated by a green tick). Unmatched species will load, but will be indicated by a green <b>?</b>. Please check your uploaded data and correct as required.
            </div>
        </g:if>

        <div class="text-left" data-bind="visible:transients.${name}Support.allowUserAddedRows" style="margin:5px;">
            <input type="checkbox" data-bind="checked:transients.${name}Support.appendTableRows" style="margin-right:5px">Append uploaded data to table (unticking this checkbox will result in all table rows being replaced)
        </div>

        <div class="text-left" style="margin:5px">
            <a data-bind="click:transients.${name}Support.downloadTemplate" target="${name}TemplateDownload" class="btn">Step 1 - Download template (.xlsx)</a>
        </div>

        <div class="btn fileinput-button" style="margin-left:5px">
            <input id="${name}TableDataUpload" type="file" name="data" data-bind="fileUploadNoImage:transients.${name}Support.tableDataUploadOptions">
            Step 2 - Upload populated template
        </div>
    </td>
</tr>

<script id="${name}template-upload" type="text/x-tmpl">{% %}</script>
<script id="${name}template-download" type="text/x-tmpl">{% %}</script>
</g:if>
