/**
 * Created by smiddela on 07/09/16.
 */


// ["permid", 'SETTINGS_TAG', {"schema":"schema"}]
var response = [
    ["perm1", "SETTINGS_TAG_1", {
        // output => <input type="number">
        "key1": {"type": "int", "displayname": "Display Name1", "displaydesc": "This will come in the hint",
            "select": null, "editable": true, "default":[null]},


        // output => <input type="text">
        "key2": {"type": "string", "displayname": "Display Name2", "displaydesc": "This will come in the hint",
            "select": null, "editable": true, "default":[null]},


        // output => List of integers in items (Read only)
        "key3": {"type": ["int"], "displayname": "Display Name3", "displaydesc": "This will come in the hint",
            "select": [-1, -1, [1, 2, 3, 4, 5]], "editable": false, "default":[null]},


        // output => List of strings in items (Read only)
        "key4": {"type": int["string"], "displayname": "Display Name4", "displaydesc": "This will come in the hint",
            "select": [-1, -1, ['a', 'b', 'c', 'd']], "editable": false, "default":[null]},


        // output => List of integers in items with Add button
        "key5": {"type": ["int"], "displayname": "Display Name5", "displaydesc": "This will come in the hint",
            "select": [-1, -1, [1, 2, 3, 4, 5]], "editable": true, "default":[null]},


        // output => List of strings in items with Add button
        "key6": {"type": int["string"], "displayname": "Display Name6", "displaydesc": "This will come in the hint",
            "select": [-1, -1, ['a', 'b', 'c', 'd']], "editable": true, "default":[null]},



        // output => List of integers in items with checkboxes (no items are selected at this point in time)
        "key7": {"type": ["int"], "displayname": "Display Name7", "displaydesc": "This will come in the hint",
            "select": [0, 1, [1, 3, 9, 27, 81]],
            "editable": true, "default":[3]
        },


        // output => List of strings in items with checkboxes (no items are selected at this point in time)
        "key8": {"type": ["string"], "displayname": "Display Name8", "displaydesc": "This will come in the hint",
            "select": [0, 10000, ['a', 'b', 'c']],
            "editable": true, "default":["b"]
        },


        // type is object
        "key5": {
            "type": {
                "level2key1": {
                    "type": "int", "displayname": "Level2 key1", "default": 10, "editable": true
                },
                "level2key2": {
                    "type": "string", "displayname": "Level2 key2", "default": "abc", "editable": true
                }
            },
            "displayname": "Level 2 Keys Array",
            "default": {"level2key1": 100, "level2key2": 200},
            "checkfun": {
                "type": "udf",
                "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
            }
        },


        // type is [object]
        "key7": {
            "type": [{
                "level2key1": {
                    "type": "int", "displayname": "Level 2 Key", "default": 10, "editable": true
                }
            }],
            "displayname": "Level 2 Keys Array",
            "default": [{"level2key1": 100}, {"level2key1": 200}],
            "checkfun": {
                "type": "udf",
                "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
            }
        }
    }]
];
