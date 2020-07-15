import {Element} from './ui-dom.js';
describe('ui-dom', () => {
	
	const capture = function(value){
		capture.value = value;
	};		
	
	describe('Element', () => {
		describe('text()', () => {
			it('text is read from underlying DOM element', () => {
				const dom = {};
				const element = new Element(dom);
				dom.innerText="test";
				expect(element.text()).toEqual("test");
			});
			it('text returns undefined if no text content is available', () => {
				const dom = {};
				const element = new Element(dom);
				expect(element.text()).nothing();
			});
			it('text is updated if a new text is specified', () => {
				const dom = {};
				const element = new Element(dom);
				element.text("test")
				expect(element.text()).toEqual("test");
				expect(dom.innerText).toEqual("test");
			});
		});
		
		describe('html()', () => {
			it('html is read from underlying DOM element', () => {
				const dom = {};
				const element = new Element(dom);
				dom.innerHTML="test";
				expect(element.html()).toEqual("test");
			});
			it('html is undefined, if no HTML content is available', () => {
				const dom = {};
				const element = new Element(dom);
				expect(element.html()).nothing();
			});
			it('html is updated, if a new html is specified', () => {
				const dom = {};
				const element = new Element(dom);
				element.html("test")
				expect(element.html()).toEqual("test");
				expect(dom.innerHTML).toEqual("test");
			});
			it('html is added to DOM', () => {
				const dom = {};
				const element = new Element(dom);
				element.html("<span>test</span>")
				expect(element.html()).toEqual("<span>test</span>");
				expect(dom.innerHTML).toEqual("<span>test</span>");
			});
		});
		
		describe('CSS management', () => {
			it('can add CSS style class', () => {
				const dom = {
					classList: { add : function(){}}
				};
				spyOn(dom.classList,"add");
				const element = new Element(dom);
				element.css.add("test");
				expect(dom.classList.add).toHaveBeenCalledWith("test");
			});
			it('can add CSS style classes', () => {
				const dom = {
					classList: { add : function(){}}
				};
				spyOn(dom.classList,"add");
				const element = new Element(dom);
				element.css.add("unit","test");
				expect(dom.classList.add).toHaveBeenCalledWith("unit");
				expect(dom.classList.add).toHaveBeenCalledWith("test");
			});
			it('can remove CSS style class', () => {
				var dom = {
					classList: { remove : function(){}}
				};
				spyOn(dom.classList,"remove");
				var element = new Element(dom);
				element.css.remove("test");
				expect(dom.classList.remove).toHaveBeenCalledWith("test");
			});
			it('can remove CSS style classes', () => {
				const dom = {
					classList: { remove : function(){}}
				};
				spyOn(dom.classList,"remove");
				const element = new Element(dom);
				element.css.remove("unit","test");
				expect(dom.classList.remove).toHaveBeenCalledWith("unit");
				expect(dom.classList.remove).toHaveBeenCalledWith("test");
			});
			it('can check for CSS style classes', () => {
				const dom = {
					classList: { contains : function(){}}
				};
				spyOn(dom.classList,"contains").and.returnValue(true);
				const element = new Element(dom);
				element.css.contains("test");
				expect(element.css.contains("test")).toBeTruthy();
				expect(dom.classList.contains).toHaveBeenCalledWith("test");
			});
		});
	});
});
