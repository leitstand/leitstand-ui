import {UserContext,Location,router} from './ui-core.js';

describe("ui-core", () => {
	describe("router", () => {
		describe("navigate", () => {
			it("delegates routing to browser for external view", () => {
				var external = new Location("http://leitstand.io");
				var routed = router.navigate(external);
				expect(routed).toBeFalsy();
			});
		});
	});
	
	describe('Location', () => {
		describe('Location.href', () => {
			it("can decode view descriptor without query parameters ", () => {
				expect(Location.href({"view":"test.html"})).toEqual("test.html");
			});
			it("can decode page descriptor with single query parameters ", () => {
				const pd = {"view":"test.html",
						  "?":{"a":"b"}};
				expect(Location.href(pd)).toEqual("test.html?a=b");
			});
			it("can decode page descriptor with single query parameters ", () => {
				var pd = {"view":"test.html",
						  "?":{"a":"b",
						       "c":"d"}};
				expect(Location.href(pd)).toEqual("test.html?a=b&c=d");
			});
			it("accepts string page reference ", () => {
				expect(Location.href("test.html")).toEqual("test.html");
			});
		});
		
		describe("Location", () => {
			it("detects external view", () => {
				expect(new Location("http://www.rtbrick.com").isExternal()).toBeTruthy();
			});
			it("can decode simple location", () => {
				const location = new Location("/ui/views/module/page.html");
				expect(location.module).toEqual("module")
				expect(location.app).toBeUndefined();
				expect(location.params).toBeDefined();
				expect(location.view).toEqual("page.html");
				expect(location.isExternal()).toBeFalsy();
			});
			it("can decode location with query parameter", () => {
				const location = new Location("/ui/views/module/page.html?a=b");
				expect(location.module).toEqual("module")
				expect(location.app).toBeUndefined();
				expect(location.param("a")).toEqual("b");
				expect(location.view).toEqual("page.html");
				expect(location.isExternal()).toBeFalsy();
			});
			it("can decode location with query parameters", () => {
				const location = new Location("/ui/views/module/page.html?a=b&c=d");
				expect(location.module).toEqual("module")
				expect(location.app).toBeUndefined();
				expect(location.param("a")).toEqual("b");
				expect(location.param("c")).toEqual("d");
				expect(location.view).toEqual("page.html");
				expect(location.isExternal()).toBeFalsy();
			});
			it("can decode location with submodule", () => {
				const location = new Location("/ui/views/module/submodule/page.html");
				expect(location.module).toEqual("module")
				expect(location.app).toEqual("submodule");
				expect(location.view).toEqual("submodule/page.html");
				expect(location.isExternal()).toBeFalsy();
			});
			it("can decode location with submodule and query parameter", () => {
				const location = new Location("/ui/views/module/submodule/page.html?a=b");
				expect(location.module).toEqual("module")
				expect(location.app).toEqual("submodule");
				expect(location.param("a")).toEqual("b");
				expect(location.view).toEqual("submodule/page.html");
				expect(location.isExternal()).toBeFalsy();
			});
			it("can decode location with submodule and query parameters", () => {
				const location = new Location("/ui/views/module/submodule/page.html?a=b&c=d");
				expect(location.module).toEqual("module")
				expect(location.app).toEqual("submodule");
				expect(location.param("a")).toEqual("b");
				expect(location.param("c")).toEqual("d");
				expect(location.view).toEqual("submodule/page.html");
				expect(location.isExternal()).toBeFalsy();
				expect(location.isExternal()).toBeFalsy();
			});
		});
	});
	
	describe('UserContext', () => {
		describe('scopesIncludeOneOf', () => {
			const user = UserContext.init({'user_name':'unit_test','scopes':['foo','bar']});
			it('returns true for the empty scope', () => {
				expect(user.scopesIncludeOneOf()).toBe(true);
				expect(user.scopesIncludeOneOf([])).toBe(true);
			});
			it('returns true if specified scope matches', () => {
				expect(user.scopesIncludeOneOf('foo')).toBe(true);
				expect(user.scopesIncludeOneOf('bar')).toBe(true);
			});
			it('returns true if at least one of all specified scopes matches', () => {
				expect(user.scopesIncludeOneOf('xyz','foo')).toBe(true);
			});
			it('returns true if at least one scope in the specified scope array matches', () => {
				expect(user.scopesIncludeOneOf(['xyz','foo'])).toBe(true);
			});
			it('returns false if no scope in the specified scope array matches', () => {
				expect(user.scopesIncludeOneOf(['xyz'])).toBe(false);
			});
			it('returns false if the specified scope does not match', () => {
				expect(user.scopesIncludeOneOf('xyz')).toBe(false);
			});
			it('returns false if none of the specified scopes matches', () => {
				expect(user.scopesIncludeOneOf('xyz','abc')).toBe(false);
			});
		});
	});
});