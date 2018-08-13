class UrlMappings {

	static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }
        "/preview" {
            controller = 'preview'
            action = [GET: 'index', POST: 'model']
        }
        "/" {
            controller = 'preview'
            action = [GET: 'index', POST: 'model']
        }
        "500"(view:'/error')
	}
}
