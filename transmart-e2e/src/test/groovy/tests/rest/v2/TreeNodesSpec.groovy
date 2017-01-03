package tests.rest.v2

import spock.lang.IgnoreIf
import spock.lang.Requires

import static config.Config.*

import base.RESTSpec

class TreeNodesSpec extends  RESTSpec{

    /**
     *  given: "Study SHARED_CONCEPTS_STUDY_C_PRIV and SHARED_CONCEPTS_A is loaded, and I have access"
     *  when: "I try to get the tree_nodes from all studies"
     *  then: "nodes from SHARED_CONCEPTS_STUDY_C_PRIV and SHARED_CONCEPTS_A are included"
     */
    @Requires({SHARED_CONCEPTS_RESTRICTED_LOADED && SHARED_CONCEPTS_LOADED})
    def "restricted tree_nodes are included"(){
        given: "Study SHARED_CONCEPTS_STUDY_C_PRIV and SHARED_CONCEPTS_A is loaded, and I do not have access"
        setUser(UNRESTRICTED_USERNAME, UNRESTRICTED_PASSWORD)

        when: "I try to get the tree_nodes from all studies"
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON)

        then: "only nodes from SHARED_CONCEPTS_A are returned"
        def studyA = getNodeByName(getRootNodeByName(responseData, 'Public Studies'), SHARED_CONCEPTS_A_ID)
        def studyC = getNodeByName(getRootNodeByName(responseData, 'Private Studies'), SHARED_CONCEPTS_RESTRICTED_ID)

        assert getChildrenAtributes(studyA, 'name').containsAll([SHARED_CONCEPTS_A_ID, 'Vital Signs', 'Heart Rate', 'Demography', 'Age'])
        assert getChildrenAtributes(studyC, 'name').containsAll([SHARED_CONCEPTS_RESTRICTED_ID, 'Vital Signs', 'Heart Rate', 'Demography', 'Age'])
    }



    /**
     *  given: "Study SHARED_CONCEPTS_STUDY_C_PRIV and SHARED_CONCEPTS_A is loaded, and I do not have access"
     *  when: "I try to get the tree_nodes from all studies"
     *  then: "only nodes from SHARED_CONCEPTS_A are returned"
     */
    @Requires({SHARED_CONCEPTS_RESTRICTED_LOADED && SHARED_CONCEPTS_LOADED})
    def "restricted tree_nodes are excluded"(){
        given: "Study SHARED_CONCEPTS_STUDY_C_PRIV and SHARED_CONCEPTS_A is loaded, and I do not have access"

        when: "I try to get the tree_nodes from all studies"
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON)

        then: "only nodes from SHARED_CONCEPTS_A are returned"
        def studyA = getNodeByName(getRootNodeByName(responseData, 'Public Studies'), SHARED_CONCEPTS_A_ID)
        def studyC = getNodeByName(getRootNodeByName(responseData, 'Private Studies'), SHARED_CONCEPTS_RESTRICTED_ID)

        assert getChildrenAtributes(studyA, 'name').containsAll([SHARED_CONCEPTS_A_ID, 'Vital Signs', 'Heart Rate', 'Demography', 'Age'])
        assert studyC == null
    }

    /**
     *  given: "Study SHARED_CONCEPTS is loaded"
     *  when: "I get the tree_nodes with a subNode and depth"
     *  then: "only de subNodes of that node are returned"
     */
    @Requires({SHARED_CONCEPTS_LOADED})
    def "params limit nodes returned"(){
        given: "Study SHARED_CONCEPTS is loaded"
        def path = "\\Public Studies\\SHARED_CONCEPTS_STUDY_A\\"

        when: "I get the tree_nodes with a subNode and depth"
        def queryMap = [root : path, depth : 2]
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON, queryMap)

        then: "only de subNodes of that node are returned"
        assert responseData.size() == 1
        def studyA = getRootNodeByName(responseData, SHARED_CONCEPTS_A_ID)

        assert getChildrenAtributes(studyA, 'name').containsAll([SHARED_CONCEPTS_A_ID, 'Vital Signs', 'Demography'])
    }

    /**
     *  given: "Study SHARED_CONCEPTS is loaded"
     *  when: "I get the tree_nodes with counts=true"
     *  then: "then concept nodes have observationCount and patientCount"
     */
    @Requires({SHARED_CONCEPTS_LOADED})
    def "nodes with counts true"(){
        given: "Study SHARED_CONCEPTS is loaded"

        when: "I get the tree_nodes with counts=true"
        def queryMap = ['counts' : true]
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON, queryMap)

        then: "then concept nodes have observationCount and patientCount"
        def studyA = getNodeByName(getRootNodeByName(responseData, 'Public Studies'), SHARED_CONCEPTS_A_ID)

        assert getNodeByName(studyA, "Heart Rate").observationCount == 5
        assert getNodeByName(studyA, "Heart Rate").patientCount == 4
        assert getNodeByName(studyA, "Age").observationCount == 2
        assert getNodeByName(studyA, "Age").patientCount == 2
    }

    /**
     *  given: "Study SHARED_CONCEPTS is loaded"
     *  when: "I get the tree_nodes with tags=true"
     *  then: "then concept nodes have observationCount and patientCount"
     */
    @Requires({SHARED_CONCEPTS_LOADED})
    @IgnoreIf({SUPPRESS_UNIMPLEMENTED}) //FIXME: no test set with tags
    def "nodes with tags true"(){
        given: "Study SHARED_CONCEPTS is loaded"

        when: "I get the tree_nodes with tags=true"
        def queryMap = ['tags' : true]
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON, queryMap)

        then: "then concept nodes have observationCount and patientCount"
        def studyA = getNodeByName(getRootNodeByName(responseData, 'Public Studies'), SHARED_CONCEPTS_A_ID)
        assert false : "test needs real assertions"
    }

    /**
     *  given: "Study SHARED_CONCEPTS_RESTRICTED_LOADED is loaded, and I do not have access"
     *  when: "I try to get the tree_nodes from that study"
     *  then: "I get an access error"
     */
    @Requires({SHARED_CONCEPTS_RESTRICTED_LOADED})
    def "restricted tree_nodes"() {
        given: "Study SHARED_CONCEPTS_RESTRICTED_LOADED is loaded, and I do not have access"
        def path = "\\Private Studies\\SHARED_CONCEPTS_STUDY_C_PRIV\\"

        when: "I try to get the tree_nodes from that study"
        def queryMap = [root : path, depth : 1]
        def responseData = get(PATH_TREE_NODES, contentTypeForJSON, queryMap)

        then: "I get an access error"
        assert responseData.httpStatus == 403
        assert responseData.type == 'AccessDeniedException'
        assert responseData.message == "Access denied to path: ${path}"
    }

    def getRootNodeByName(list, name){
        def root
        list.tree_nodes.each{
            if (it.name == name){
                root = it
            }
        }
        return root
    }

    def getNodeByName(root, name){
        if (root.name == name){
            return root
        }
        def result
        if (root.children){
            root.children.each{
                def node = getNodeByName(it, name)
                if (node){
                    result = node
                }
            }
        }
        return result
    }

    def getChildrenAtributes(node, attribute){
        def nodeNames = [node.get(attribute)]
        if (node.children){
            node.children.each{
                nodeNames.addAll(getChildrenAtributes(it, attribute))
            }
        }
        return nodeNames
    }
}
