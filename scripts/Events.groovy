eventCompileEnd = {
    def assetPipelineConfigHolder = classLoader.loadClass('asset.pipeline.AssetPipelineConfigHolder')
    String pluginPath = ecodataClientPluginPluginDir.canonicalPath
    def templateFileAssetResolver = classLoader.loadClass('au.org.ala.ecodata.forms.TemplateFileAssetResolver').newInstance('templates', "${pluginPath}/grails-app/assets/components", false, '/compile/ecodata-templates.js', '/template')

    File file = new File("${pluginPath}/grails-app/assets/components/compile/ecodata-templates.js")
    templateFileAssetResolver.generateTemplateFile(file)

    assetPipelineConfigHolder.resolvers.add(0, templateFileAssetResolver)
}