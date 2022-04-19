package io.leitstand.ui.model;

import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

import org.junit.Test;

public class ContributionSorterTest {

	private static Named named(String name) {
		return new Named(){
			@Override
			public String getName() {
				return name;
			}
			
			@Override
			public String toString() {
				return name;
			}
			
			@Override
			public int hashCode() {
				return name.hashCode();
			}
			
			@Override
			public boolean equals(Object o) {
				if(o == null) {
					return false;
				}
				if(o == this) {
					return true;
				}
				if(o.getClass() != getClass()) {
					return false;
				}
				Named named = (Named) o;
				return Objects.equals(name,named.getName());
			}
			
		};
	}
	
	private List<Named> items(Named... items){
		return new LinkedList<>(asList(items));
	}
	
	
	private ExtensionSorter<Named> sorter;
	private LinkedHashMap<Named,List<ExtensionPoint>> points;
	
	@Test
	public void arrange_item_contribution_by_after_constraint() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("d"));
		//Add contribution
		items.add(named("c"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().after("b");
		points.put(named("c"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
		
		
	}
	
	@Test
	public void do_nothing_when_after_constraint_is_satisfied() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("c"));
		//Add contribution
		items.add(named("d"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().after("d");
		points.put(named("d"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
		
		
	}
	
	@Test
	public void arrange_item_contribution_by_before_constraint() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("d"));
		//Add contribution
		items.add(named("c"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().before("d");
		points.put(named("c"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
	}
	
	@Test
	public void update_first_item_with_before_constraint() {
		// Create menu items
		List<Named> items = items(named("b"),
								  named("c"),
								  named("d"));
		//Add contribution
		items.add(named("a"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().before("b");
		points.put(named("a"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
	}
	
	@Test
	public void update_last_item_with_after_constraint() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("c"));
		//Add contribution
		items.add(named("d"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().after("c");
		points.put(named("d"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
	}
	
	
	
	@Test
	public void break_after_constraint_cycle() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("c"));
		points = new LinkedHashMap<>();
		// a -> b -> c -> a
		points.put(named("a"),asList(new ExtensionPoint().after("c")));
		points.put(named("b"),asList(new ExtensionPoint().after("a")));
		points.put(named("c"),asList(new ExtensionPoint().after("b")));
		
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// Verify expected order 
		// a was not after c -> a is moved to end of list, new order b, c, a
		// b is not after a -> b is moved to end of list, new order c, a, b
		// c is not after a -> c is moved to end of list, new order a, b, c
		assertEquals(asList(named("a"),
							named("b"),
							named("c")),
					 sorter.sort());
		
		
	}
	
	@Test
	public void break_before_constraint_cycle() {
		// Create menu items
		List<Named> items = items(named("a"),
								  named("b"),
								  named("c"));
		points = new LinkedHashMap<>();
		// a -> b -> c -> a
		points.put(named("a"),asList(new ExtensionPoint().before("b")));
		points.put(named("b"),asList(new ExtensionPoint().before("c")));
		points.put(named("c"),asList(new ExtensionPoint().before("a")));
		
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);

		// A cycle has no correct order.
		// a was before b -> no change
		// b was before c -> no change
		// c was not before a -> c is moved to a.
		// Result: c, a, b
		assertEquals(asList(named("b"),
							named("c"),
							named("a")),
					 sorter.sort());
	}
	
	@Test
	public void before_precedes_over_after() {
		List<Named> items = items(named("a"),
								  named("b"),
								  named("d"));
		
		//Add contribution
		items.add(named("c"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().before("d").after("d");
		points.put(named("c"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);
		
		assertEquals(asList(named("a"),
							named("b"),
							named("c"),
							named("d")),
					 sorter.sort());
	}
	
	@Test
	public void do_nothing_when_after_item_does_not_exist() {
		List<Named> items = items(named("a"),
								  named("b"),
								  named("d"));
		
		//Add contribution
		items.add(named("c"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().after("unknown");
		points.put(named("c"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);
		
		assertEquals(asList(named("a"),
							named("b"),
							named("d"),
							named("c")),
					 sorter.sort());
	}
	
	@Test
	public void do_nothing_when_before_item_does_not_exist() {
		List<Named> items = items(named("a"),
								  named("b"),
								  named("d"));
		
		//Add contribution
		items.add(named("c"));
		points = new LinkedHashMap<>();
		ExtensionPoint point = new ExtensionPoint().before("unknown");
		points.put(named("c"),asList(point));
		
		// Sort menu according to the injection point
		sorter = new ExtensionSorter<>(points, items);
		
		assertEquals(asList(named("a"),
							named("b"),
							named("d"),
							named("c")),
					sorter.sort());
	}

	
}
