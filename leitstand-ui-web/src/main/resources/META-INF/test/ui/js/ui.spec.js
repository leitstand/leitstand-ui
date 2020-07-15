import {Location,router} from './ui-core.js';
import {Controller} from './ui.js';
import {Element} from './ui-dom.js';
import {Json} from './client.js';

describe("Controller", () => {
	
	const capture = function(value){
		capture.value = value;
	};		
		
	describe("renderView", () => {
		it("renders the default view model if invoked without arguments", () => {
			// Create an empty dummy view model.
			const viewModel = {};
			const controller = new Controller({resource:{}});
			spyOn(controller,"getViewModel").and.returnValue(viewModel);
			spyOn(controller,"element").withArgs("menu").and.returnValue(null)
								 	   .withArgs("ui-view").and.returnValue(new Element(document.createElement("ui-view")));
			// Obtain a reference to the controller template
			const template = controller.template();
			// Spy on template html rendering method.
			spyOn(template,"html");
			spyOn(controller,"template").and.returnValue(template);
				
			// Render the controller
			controller.render();
				
			// Verify that the view model was passed to the template
			expect(controller.getViewModel).toHaveBeenCalled()
			expect(template.html).toHaveBeenCalledWith(viewModel);
		});
			
		it("renders the view model passed as argument", () => {
			// Create an empty dummy view model.
			const viewModel = {};
			const controller = new Controller({resource:{}});
			spyOn(controller,"getViewModel");
			spyOn(controller,"element").withArgs("menu").and.returnValue(null)
									   .withArgs("ui-view").and.returnValue(new Element(document.createElement("div")));
			// Obtain a reference to the controller template
			const template = controller.template();
			// Spy on template html rendering method.
			spyOn(template,"html");
			spyOn(controller,"template").and.returnValue(template);
				
			// Render the controller
			controller.render(viewModel);
				
			// Verify that the view model was passed to the template
			expect(controller.getViewModel).not.toHaveBeenCalled()
			expect(controller.template).toHaveBeenCalledWith("");
			expect(template.html).toHaveBeenCalledWith(viewModel);
		});
			
		it("renders the specified view model to the specified container element (partial controller rendering)", () => {
			// Create an empty dummy view model.
			const viewModel = {};
			const controller = new Controller({resource:{}});
			spyOn(controller,"getViewModel");
			spyOn(controller,"element").withArgs("menu").and.returnValue(null)
								       .withArgs("partial").and.returnValue(new Element(document.createElement("div")));
			// Obtain a reference to the controller template
			const template = controller.template();
			// Spy on template html rendering method.
			spyOn(template,"html");
			spyOn(controller,"template").and.returnValue(template);
				
			// Render the controller
			controller.render("partial", viewModel);
				
			// Verify that the view model was passed to the template
			expect(controller.getViewModel).not.toHaveBeenCalled();
			expect(controller.template).toHaveBeenCalledWith("partial");
			expect(template.html).toHaveBeenCalledWith(viewModel);
		});
			
		it("focus the first element with autofocus (some browsers ignore autofocus attribute)", () => {
			// Create an empty dummy view model.
			const viewModel = {};
			const controller = new Controller({resource:{}});
			spyOn(controller,"getViewModel").and.returnValue(viewModel);
				
			const container = new Element(document.createElement("div"));
			const control	  = new Element(document.createElement("input"));
				
			spyOn(controller,"element").withArgs("menu").and.returnValue(null)
								 .withArgs("ui-view").and.returnValue(container)
								 
			spyOn(container,"select").withArgs("[autofocus]").and.returnValue(control)
									 .withArgs("h2").and.returnValue(null);
			spyOn(control,"focus");
			// Obtain a reference to the controller template
			var template = controller.template();
			// Spy on template html rendering method.
			spyOn(template,"html");
			spyOn(controller,"template").and.returnValue(template);
			
			// Render the controller
			controller.render();
			
			// Verify that the view model was passed to the template
			expect(controller.getViewModel).toHaveBeenCalled();
			expect(control.focus).toHaveBeenCalled();
			expect(controller.template).toHaveBeenCalledWith("");
			expect(template.html).toHaveBeenCalledWith(viewModel);
		});
			
		it("updates view title if h2 is present", () => {
			const title = document.title;
			try{
				// Create an empty dummy view model.
				const viewModel = {};
				const controller = new Controller({resource:{}});
				spyOn(controller,"getViewModel").and.returnValue(viewModel);
				
				const container = new Element(document.createElement("div"));
				const heading   = new Element(document.createElement("h2"));
				heading.text("Unit test");
				
				spyOn(controller,"element").withArgs("menu").and.returnValue(null)
									       .withArgs("ui-view").and.returnValue(container)
									 
				spyOn(container,"select").withArgs("[autofocus]").and.returnValue(null)
										 .withArgs("h2").and.returnValue(heading);
				// Obtain a reference to the controller template
				const template = controller.template();
				// Spy on template html rendering method.
				spyOn(template,"html");
				spyOn(controller,"template").and.returnValue(template);
				
				// Render the controller
				controller.render();
				
				// Verify that the view model was passed to the template
				expect(controller.getViewModel).toHaveBeenCalled();
				expect(controller.template).toHaveBeenCalledWith("");
				expect(template.html).toHaveBeenCalledWith(viewModel);	
				expect(document.title).toEqual("Unit test");
			} finally {
				// Restore document title
				document.title = title;
			}
		});
	});
		
	describe("view model", () => {
		it("can be replaced ", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":"bar"};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel()).toEqual(viewModel);
		});
		
		it("can read property", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":"bar"};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("foo")).toEqual("bar");
		});
		
		it("can read nested property", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":{"bar":"value"}};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("foo.bar")).toEqual("value");
		});

		it("can read nested array item", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":{"bar":["value"]}};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("foo.bar[0]")).toEqual("value");
		});

		it("can read property of nested array item", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":{"bar":[{"nested":"value"}]}};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("foo.bar[0].nested")).toEqual("value");
		});
		
		it("returns undefined if nested property does not exist", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":{"bar":"value"}};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("x.y.z")).toBeUndefined();
		});
				
		it("can update view model property", () => {
			const controller = new Controller({resource:{}});
			const viewModel = {"foo":"bar"};
			controller.setViewModel(viewModel);
			expect(controller.getViewModel("foo")).toEqual("bar");
		});
		
		it("replaces the complete view model, if view model is an array", () => {
			const controller = new Controller({resource:{}});
			controller.setViewModel(["foo","bar"]);
			controller.updateViewModel(["a","b","c"]);
			expect(controller.getViewModel()).toEqual(["a","b","c"]);
		});
	});
		
	describe("navigate", () => {

		it("routes absolute path without modifying it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			controller.navigate("/ui/views/test/controller.html");
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/test/controller.html");
		});
		
		it("routes absolute path with query parameters without modifying it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			controller.navigate("/ui/views/test/controller.html?foo=bar");
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/test/controller.html?foo=bar");
		});
		
		it("routes absolute controller descriptor with query parameters without modifying it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			controller.navigate({"view":"/ui/views/test/controller.html",
						   "?":{"foo":"bar"}});
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/test/controller.html?foo=bar");
		});
		
		it("converts a relative controller to an absolute controller preserving the app folder before routing it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/module/app/view.html"));
			controller.navigate("target.html");
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/module/app/target.html");
		});
		
		it("converts a relative controller to an absolute controller before routing it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/module/view.html"));
			controller.navigate("target.html");
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/module/target.html");
		});
		
		it("converts a relative controller to an absolute controller preserving query parameters before routing it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/module/app/view.html"));
			controller.navigate("target.html?foo=bar");
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/module/app/target.html?foo=bar");
		});
		
		it("converts a relative controller descriptor to an absolute controller preserving query parameters before routing it", () => {
			const controller = new Controller({resource:{}});
			spyOn(router,"navigate").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/module/app/view.html"));
			controller.navigate({"view":"target.html",
				   		   "?":{"foo":"bar"}});				
			expect(router.navigate).toHaveBeenCalled()
			expect(capture.value.path).toEqual("/ui/views/module/app/target.html?foo=bar");
		});
		
	});
	
	describe("reload", () => {
		it("loads resource again without touching history, if called without parameters", () => {
			const resource = new Json();
			const controller = new Controller({"resource":resource});
			spyOn(resource,"load").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/unittest/view.html?foo=bar"));
			spyOn(controller,"push");
			controller.reload();
			expect(capture.value).toEqual({"foo":"bar"});
			expect(controller.push).not.toHaveBeenCalled();
		});
		
		it("loads resource again without touching history, if called with current context", () => {
			const resource = new Json();
			const controller = new Controller({"resource":resource});
			spyOn(resource,"load").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/unittest/view.html?a=b&c=d"));
			spyOn(controller,"push");
			controller.reload({"a":"b",
						 "c":"d"});
			expect(capture.value).toEqual({"a":"b","c":"d"});
			expect(controller.push).not.toHaveBeenCalled();
		});
		
		it("loads resource again and touches history, if called with different context", () => {
			const resource = new Json();
			const controller = new Controller({"resource":resource});
			spyOn(resource,"load").and.callFake(capture);
			spyOn(controller,"location").and.returnValue(new Location("/ui/views/unittest/view.html?a=b&c=d"));
			spyOn(controller,"push");
			controller.reload({"foo":"bar"});
			expect(capture.value).toEqual({"foo":"bar"});
			expect(controller.push).toHaveBeenCalledWith({"view": "/ui/views/unittest/view.html",
														  "?": {"foo":"bar"}});
		});
		
	});

});	