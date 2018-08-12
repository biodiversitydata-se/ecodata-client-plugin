class UrlMappings {

	static mappings = {
        "/$controller/$action?/$id?(.$format)?"{
            constraints {
                // apply constraints here
            }
        }

        "/" {
            controller = 'preview'
            action = [GET: 'index', POST: 'model']
        }

        "/preview" {
            controller = 'preview'
            action = [GET: 'index', POST: 'model']
        }

        "/"(view:"/index")
        "500"(view:'/error')
	}
}
