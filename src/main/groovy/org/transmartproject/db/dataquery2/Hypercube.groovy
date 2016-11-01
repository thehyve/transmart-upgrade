package org.transmartproject.db.dataquery2

import com.google.common.collect.AbstractIterator
import com.google.common.collect.ImmutableList
import com.google.common.collect.ImmutableMap
import groovy.transform.CompileStatic
import groovy.transform.TupleConstructor
import org.hibernate.ScrollableResults
import org.hibernate.internal.StatelessSessionImpl
import org.transmartproject.core.IterableResult
import org.transmartproject.core.exceptions.InvalidArgumentsException
import org.transmartproject.db.clinical.Query
import org.transmartproject.db.i2b2data.ObservationFact
import org.transmartproject.db.util.AbstractOneTimeCallIterable

import java.util.function.Predicate
import java.util.function.UnaryOperator

import static java.util.Objects.requireNonNull

/**
 *
 */
@CompileStatic
class Hypercube extends AbstractOneTimeCallIterable<HypercubeValue> implements IterableResult<HypercubeValue> {
    /*
     * The data representation:
     *
     * For packable dimensions:
     * Dimension element keys are stored in dimensionElementIdxes. Those are mapped to the actual dimension elements
     * in dimensionElements. Each dimension has a numeric index in dimensionsIndexMap. Each ClinicalValue
     */

    StatelessSessionImpl session

    //def sort
    //def pack
    boolean autoLoadDimensions = true
    private ScrollableResults results
    final ImmutableMap<String,Integer> aliases
    final ImmutableList<Dimension> dimensions
    Query query

    // This could also be an (immutable) IndexedList<Dimension>, but we don't use the list aspects.
    final ImmutableMap<Dimension,Integer> dimensionsList =
            ImmutableMap.copyOf(dimensions.withIndex().collectEntries())

    // Map from Dimension -> dimension element keys
    // The IndexedList provides efficient O(1) indexOf/contains operations
    // Only used for packable dimensions
    Map<Dimension,IndexedList<Object>> dimensionElementKeys =
            dimensions.findAll { it.packable.packable }.collectEntries(new HashMap()) { [it, new IndexedList()] }

    // A map that stores the actual dimension elements once they are loaded
    Map<Dimension, List<Object>> dimensionElements = new HashMap()


    Hypercube(ScrollableResults results, List<Dimension> dimensions, String[] aliases,
              Query query, StatelessSessionImpl session) {
        this.results = results
        this.dimensions = ImmutableList.copyOf(dimensions)
        this.query = query
        this.session = session

        int idx = 0
        this.aliases = ImmutableMap.copyOf(aliases.collectEntries { [it, idx++] })
    }

    Iterator getIterator() {
        new ResultIterator()
    }

    // TODO: support modifier dimensions
    class ResultIterator extends AbstractIterator<HypercubeValue> {
        HypercubeValue computeNext() {
            if (!results.next()) {
                if(autoLoadDimensions) loadDimensions()
                return endOfData()
            }
            _dimensionsLoaded = false
            ProjectionMap result = new ProjectionMap(aliases, results.get())

            def value = ObservationFact.observationFactValue(
                    (String) result.valueType, (String) result.textValue, (BigDecimal) result.numberValue)

            int nDims = dimensions.size()
            // actually this array only contains indexes for packable dimensions, for nonpackable ones it contains the
            // element keys directly
            Object[] dimensionElementIdxes = new Object[nDims]
            // Save keys of dimension elements
            // Closures are not called statically afaik, even with @CompileStatic; use a plain old loop
            for(int i=0; i<nDims; i++) {
                Dimension d = dimensions[i]
                def dimElementKey = d.getElementKey(result)
                if(d.packable.packable) {
                    IndexedList<Object> elementKeys = dimensionElementKeys[d]
                    int dimElementIdx = elementKeys.indexOf(dimElementKey)
                    if(dimElementIdx == -1) {
                        dimElementIdx = elementKeys.size()
                        elementKeys.add(dimElementKey)
                    }
                    dimensionElementIdxes[i] = dimElementIdx
                } else {
                    dimensionElementIdxes[i] = dimElementKey
                }
            }

            // TODO: implement text and numeric values
            new HypercubeValue(Hypercube.this, dimensionElementIdxes, value)
        }
    }

    List<Object> dimensionElements(Dimension dim) {
        List ret = dim.resolveElements(dimensionElementKeys[dim])
        dimensionElements[dim] = ret
        return ret
    }

    static protected void checkNotPackable(Dimension dim) {
        if(!dim.packable.packable) {
            throw new UnsupportedOperationException("Cannot get dimension element for unpackable dimension "+
                    dim.class.simpleName)
        }
    }

    Object dimensionElement(Dimension dim, int idx) {
        checkNotPackable(dim)
        if(!_dimensionsLoaded) {
            loadDimensions()
        }
        return dimensionElements[dim][idx]
    }

    Object dimensionElementKey(Dimension dim, int idx) {
        checkNotPackable(dim)
        dimensionElementKeys[dim][idx]
    }

    void loadDimensions() {
        // This could be more efficient if we track which dimensions are already loaded and up to date, but as we
        // expect dimensions will only be loaded all at once once all values have been retrieved that doesn't seem
        // worth implementing.
        if(_dimensionsLoaded) return
        dimensions.each {
            dimensionElements(it)
        }
        _dimensionsLoaded = true
    }

    // dimensionsLoaded is a boolean property that indicates if all dimension elements have been loaded already.
    // Normally it is only true once the result has been fully iterated over, or if preloadDimensions == true in
    // doQuery.
    private boolean _dimensionsLoaded = false
    boolean getDimensionsLoaded() { return _dimensionsLoaded }

    void close() {
        results.close()
        session.close()
    }
}

@CompileStatic
class HypercubeValue {
    // Not all dimensions apply to all values, and the set of dimensions is extensible using modifiers.
    // We can either use a Map or methodMissing().
    private final Hypercube cube
    // dimension
    private final Object[] dimensionElementIdxes
    final def value

    HypercubeValue(Hypercube cube, Object[] dimensionElementIdxes, def value) {
        this.cube = cube
        this.dimensionElementIdxes = dimensionElementIdxes
        this.value = value
    }

    def getAt(Dimension dim) {
        getDimElement(dim)
    }

    def getDimElement(Dimension dim) {
        if(dim.packable.packable) {
            cube.dimensionElement(dim, (int) dimensionElementIdxes[cube.dimensionsList[dim]])
        } else {
            dim.resolveElement(dimensionElementIdxes[cube.dimensionsList[dim]])
        }
    }

    int getDimElementIndex(Dimension dim) {
        cube.checkNotPackable(dim)
        (int) dimensionElementIdxes[cube.dimensionsList[dim]]
    }

    def getDimKey(Dimension dim) {
        cube.dimensionElementKey(dim, (int) dimensionElementIdxes[cube.dimensionsList[dim]])
    }

    Set<Dimension> availableDimensions() {
        cube.dimensionsList.keySet()
    }
}

@CompileStatic
@TupleConstructor(includeFields=true)
class ProjectionMap extends AbstractMap<String,Object> {
    // @Delegate(includes="size, containsKey, keySet") can't delegate since these methods are already implemented on AbstractMap :(
    private final ImmutableMap<String,Integer> mapping
    private final Object[] tuple

    // This get is not entirely compliant to the Map contract as we throw on null or on a value not present in the
    // mapping
    @Override Object get(Object key) {
        Integer idx = mapping[(String) key]
        if(idx == null) throw new IllegalArgumentException("key '$key' not present in this result row: $this")
        tuple[idx]
    }

    @Override Set<Map.Entry<String,Serializable>> entrySet() {
        (Set) mapping.collect(new HashSet()) { new AbstractMap.SimpleImmutableEntry(it.key, tuple[it.value]) } as Set
    }

    @Override Object put(String key, Object val) { throw new UnsupportedOperationException() }
    @Override int size() { mapping.size() }
    @Override boolean containsKey(key) { mapping.containsKey(key) }
    @Override Set<String> keySet() { mapping.keySet() }
}

@CompileStatic
class IndexedList<E> extends ArrayList<E> {
    private HashMap<E,Integer> indexMap = new HashMap()

    private void reindex() {
        indexMap.clear()
        int idx = 0
        this.each { addToIndex(it, idx++) }
    }

    private E addToIndex(E e, int idx) {
        if(indexMap.putIfAbsent(requireNonNull(e), idx) != null) duplicateError(e)
        e
    }

    private E checkDuplicates(E e) {
        if(indexMap.containsKey(requireNonNull(e))) duplicateError(e)
        e
    }

    static private void duplicateError(E e) {
        throw new InvalidArgumentsException("IndexedList cannot contain duplicate elements, '$e' is already present.")
    }

    @Override boolean add(E e) {
        super.add(addToIndex(e, size()))
        true
    }

    @Override boolean addAll(Collection<? extends E> c) {
        c.each { add(it) }
        c.size() != 0
    }

    @Override boolean contains(Object e) {
        indexMap.containsKey(e)
    }

    @Override int indexOf(Object e) {
        if(e == null) return -1
        indexMap[(E) e] ?: -1
    }

    @Override int lastIndexOf(Object e) {
        indexOf(e)
    }

    @Override E set(int idx, E e) {
        Integer oldidx = indexMap.putIfAbsent(requireNonNull(e), idx)
        if(oldidx != null && oldidx != idx) duplicateError(e)
        E rv = super.set(idx, e)
        if(oldidx == null) indexMap.remove(rv)
        rv
    }

    @Override void add(int idx, E e) {
        super.add(idx, checkDuplicates(e))
        reindex()
    }

    @Override boolean remove(Object e) {
        boolean rv = super.remove(e)
        reindex()
        rv
    }

    @Override E remove(int idx) {
        E rv = super.remove(idx)
        reindex()
        rv
    }

    @Override void clear() {
        super.clear()
        indexMap.clear()
    }

    @Override boolean addAll(int idx, Collection<? extends E> c) {
        c.each { addToIndex(it, -1) }
        boolean rv = super.addAll(idx, c)
        reindex()
        rv
    }

    @Override boolean removeAll(Collection<?> c) {
        boolean rv = super.removeAll(c)
        reindex()
        rv
    }

    @Override boolean retainAll(Collection<?> c) {
        boolean rv = super.retainAll(c)
        reindex()
        rv
    }

    @Override boolean removeIf(Predicate<? super E> filter) {
        boolean rv = super.removeIf(filter)
        reindex()
        rv
    }

    @Override void replaceAll(UnaryOperator<E> operator) {
        indexMap.clear()
        try {
            this.eachWithIndex { E e, int idx ->
                E newval = operator.apply(e)
                addToIndex(newval, idx)
                super.set(idx, newval)
            }
        } catch(Exception ex) {
            // If there's an exception the indexMap will be inconsistent
            reindex()
            throw ex
        }
    }

    @Override void sort(Comparator<? super E> c) {
        super.sort(c)
        reindex()
    }
}
