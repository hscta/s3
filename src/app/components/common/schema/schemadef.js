/**
 * Created by smiddela on 07/09/16.
 */


// ["permid", 'SETTINGS_TAG', {"schema":"schema"}]
var response = [
    ["perm1", "SETTINGS_TAG_1", {
        // output => <input type="number">
        "key1": {"type": ["int"], "displayname": "Display Name1", "displaydesc":"This will come in the hint", 
        "select": [0, 1, [1,3,9,27,81]], "default":[3], "editable":true},
        
        "keyobj": {"type":[{"level2key1":{"type":"int", "displayname":"Level 2 Key", "default":10, "editable":true}}],
        "displayname":"Level 2 Keys Array", "default":[{"level2key1":100}, {"level2key1":200}], "checkfun":{"type":"udf",
        "func":'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema){
            return {"status":"FAILURE", "errmsg":"I haven't yet checked it"};}'}},

        // output => <input type="text">
        "key2": {"type": "string", "displayname": "Display Name2", "select": null},

        // output => List of integers in items with Add button
        "key3": {"type": "[int]", "displayname": "Display Name3", "select": false, "items": [1, 2, 3, 4]},

        // output => List of strings in items with Add button
        "key4": {"type": "[string]", "displayname": "Display Name4", "select": false, "items": ['a', 'b', 'c']},

        // output => List of integers in items with checkboxes (no items are selected at this point in time)
        "key5": {"type": "[int]", "displayname": "Display Name5", "select": true, "items": [1, 2, 3]},

        // output => List of strings in items with checkboxes (no items are selected at this point in time)
        "key6": {"type": "[string]", "displayname": "Display Name6", "select": true, "items": ['a', 'b', 'c', 'd']},
    }],
    ["perm2", "SETTINGS_TAG_2", {"key1": "blah1", "key2": "blah2"}]
];
