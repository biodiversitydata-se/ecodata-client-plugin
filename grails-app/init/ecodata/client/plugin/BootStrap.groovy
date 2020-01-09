package ecodata.client.plugin

import asset.pipeline.AssetPipelineConfigHolder
import au.org.ala.ecodata.forms.TemplateFileAssetResolver

class BootStrap {

    def init = { servletContext ->
        String pluginPath = '.'
        def templateFileAssetResolver = new TemplateFileAssetResolver('templates', "${pluginPath}/grails-app/assets/components", false, '/compile/ecodata-templates.js', '/template')
        AssetPipelineConfigHolder.resolvers.add(0, templateFileAssetResolver)
    }
    def destroy = {
    }
}
