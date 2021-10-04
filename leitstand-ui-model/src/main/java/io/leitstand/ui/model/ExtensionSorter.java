package io.leitstand.ui.model;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;

class ExtensionSorter<T extends Named> {

	private Map<T,List<ExtensionPoint>> points;
	private List<T> items;
	
	ExtensionSorter(Map<T,List<ExtensionPoint>> points, List<T> items){
		this.points = points;
		this.items = new LinkedList<>(items);
	}
	
	List<T> sort() {
		boolean swap = true;
		
		// Re-arrange menu items until no more items were swapped or the complete menu was processed.
		// The second check breaks reference loops in menu constraints.
		for(int i=1, n=items.size(); i < n && swap; i++) {
		    swap = false;
		    for(Map.Entry<T,List<ExtensionPoint>> constraint : points.entrySet()) {
		        T item = constraint.getKey();
		        for(ExtensionPoint point : constraint.getValue()) {
    		        int pos = items.indexOf(item);
    		        // Move item to satisfy after constraint
    		        int ref = indexOf(point.getAfter());
    		        if(ref  >= 0 && pos !=  ref + 1) {
    		            moveTo( pos, ref + 1);
    		            swap = true;
    		        }
		        }
		    }
		}
		
	    swap = true;
	    for(int i=1, n=items.size(); i < n && swap; i++) {
	        swap = false;
	        for(Map.Entry<T,List<ExtensionPoint>> constraint : points.entrySet()) {
	            T item = constraint.getKey();
	            for(ExtensionPoint point : constraint.getValue()) {
	                // Move item to satisfy before constraint.
	                // Before constraints precede over after constraints.
	                int pos = items.indexOf(item);
	                int ref = indexOf(point.getBefore());
	                if(ref >= 0 && pos != ref - 1) {
	                    moveTo(pos, ref);
	                    swap = true;
	                }
	            }
	        }
	    }

		return items;
	}

    private void moveTo(int pos, int ref) {
        T spare = null;
        // Add a spare itme to preserver the current index values.
        T item = items.set(pos,spare); 
        items.add(ref, item);
        items.remove(spare); // Remove the null placeholder
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
