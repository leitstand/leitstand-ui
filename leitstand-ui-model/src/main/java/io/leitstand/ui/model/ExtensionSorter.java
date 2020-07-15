package io.leitstand.ui.model;

import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

class ExtensionSorter<T extends Named> {

	private LinkedHashMap<T,ExtensionPoint> points;
	private List<T> items;
	
	ExtensionSorter(LinkedHashMap<T,ExtensionPoint> points, List<T> items){
		this.points = points;
		this.items = new LinkedList<>(items);
	}
	
	List<T> sort() {
		int n = items.size();
		T spare = null;
		for(Map.Entry<T,ExtensionPoint> constraint : points.entrySet()) {
			T item = constraint.getKey();
			ExtensionPoint point = constraint.getValue();
			int pos = items.indexOf(item);
			int before = indexOf(point.getBefore());
			if(before >= 0 && pos != before-1) {
				// Move item to before + 1
				item = items.set(pos,spare); // Set value to null to preserve index values
				items.add( before , item); // Inject value at current before value thereby moving before to right to satisfy before rule
				items.remove(spare); // Remove the null placeholder
			}

			int after = indexOf(point.getAfter());
			if(after  >= 0 && pos !=  after + 1) {
				// Move item to before + 1
				item = items.set(pos,spare); // Set value to null to preserve index values
				if(n > after + 1) {
					// Inject in list right after after position
					items.add(after + 1, item);
				} else {
					// Append to end of list
					items.add(item);
				}
				items.remove(spare); // Remove the null placeholder
			}
			
		}
		
		return items;
		
		
	}
		
	private int indexOf(String name) {
		if(name == null) {
			return -1;
		}
		for(int i=0; i < items.size(); i++) {
			if(items.get(i).getName().equals(name)) {
				return i;
			}
		}
		return -1;
	}
	
}
