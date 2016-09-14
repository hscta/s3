/**
 * Created by smiddela on 07/09/16.
 */

(function () {
    'use strict';

    angular.module('uiplatform')
        .service('schemaService', schemaService);

    function schemaService($log) {
        var vm = this;
        $log.log("schemaService");


        // ["permid", 'SETTINGS_TAG', {"schema":"schema"}]
        var schemaDef = [
            ["perm1", "SETTINGS_TAG_1", {
                // output => <input type="number">
                "key1": {
                    "type": "number", "displayname": "Display Name1", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": null
                },


                // output => <input type="text">
                "key2": {
                    "type": "text", "displayname": "Display Name2", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": 10
                },


                // output => List of numbers in items (Read only)
                "key3": {
                    "type": ["number"], "displayname": "Display Name3", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": [1, 2, 3, 4, 5]
                },


                // output => List of strings in items (Read only)
                "key4": {
                    "type": ["text"], "displayname": "Display Name4", "displaydesc": "This will come in the hint",
                    "select": null, "editable": false, "default": ['a', 'b', 'c', 'd']
                },


                // output => List of numbers in items with Add button (Add/Remove anything)
                "key5": {
                    "type": ["number"], "displayname": "Display Name3", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": [1, 2, 3, 4, 5]
                },


                // output => List of strings in items with Add button (Add/Remove anything)
                "key6": {
                    "type": ["text"], "displayname": "Display Name4", "displaydesc": "This will come in the hint",
                    "select": null, "editable": true, "default": ['a', 'b', 'c', 'd']
                },


                // output => List of numbers in items with checkboxes (no items are selected at this point in time)
                "key7": {
                    "type": ["number"], "displayname": "Display Name7", "displaydesc": "This will come in the hint",
                    "select": [0, 1, [1, 3, 9, 27, 81, 243]],
                    "editable": true, "default": [3]
                },


                // output => List of strings in items with checkboxes (no items are selected at this point in time)
                "key8": {
                    "type": ["text"], "displayname": "Display Name8", "displaydesc": "This will come in the hint",
                    "select": [0, 10000, ['a', 'b', 'c']],
                    "editable": true, "default": ["a", "c"]
                },


                // type is object
                "key9": {
                    "type": {
                        "level2key1": {
                            "type": "number", "displayname": "Level2 key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "text", "displayname": "Level2 key2", "default": "abc", "editable": true
                        }
                    },
                    "displayname": "Key9 Level 2 Keys Array",
                    "select": null,
                    "editable": false,
                    "default": {"level2key1": 100, "level2key2": "200"},
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },

                // type is [object]
                "key10": {
                    "type": [{
                        "level2key1": {
                            "type": "number", "displayname": "Level 2 Key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "text", "displayname": "Level 2 Key2", "default": "10", "editable": true
                        }
                    }],
                    "displayname": "Key10 Level 2 Keys Array",
                    "select": null,
                    "editable": false,
                    "default": [{"level2key1": 100, "level2key2": "100"}],
                    // [{"level2key1": 100, "level2key2": "100"},
                    // {"level2key1": 200, "level2key2": "200"},
                    // {"level2key1": 300, "level2key2": "300"}],
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },


                "key11": {
                    "type": {
                        "level2key1": {
                            "type": "number", "displayname": "Level2 key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "text", "displayname": "Level2 key2", "default": "abc", "editable": true
                        },
                        "level2key3": {
                            "type": {
                                "level3key1": {
                                    "type": "number", "displayname": "Level 3 Key1", "default": 10, "editable": true
                                },
                                "level3key2": {
                                    "type": "text", "displayname": "Level 3 Key2", "default": "10", "editable": true
                                }
                            },
                            "displayname": "Key11 Level 3 Keys Array",
                            "select": null,
                            "editable": false,
                            "default": {"level3key1": 100, "level3key2": "200"},
                        }
                    },
                    "displayname": "Key11 Level 2 Keys Array",
                    "select": null,
                    "editable": false,
                    "default": {
                        "level2key1": 100,
                        "level2key2": "200",
                        "level2key3": {"level3key1": 400, "level3key2": "500"}
                    },
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },


                "key12": {
                    "type": {
                        "level2key1": {
                            "type": "number", "displayname": "Level2 key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "text", "displayname": "Level2 key2", "default": "abc", "editable": true
                        },
                        "level2key3": {
                            "type": {
                                "level3key1": {
                                    "type": "number", "displayname": "Level 3 Key1", "default": 10, "editable": true
                                },
                                "level3key2": {
                                    "type": "text", "displayname": "Level 3 Key2", "default": "10", "editable": true
                                },
                                "level3key3": {
                                    "type": [{
                                        "level4key1": {
                                            "type": "number",
                                            "displayname": "Level 4 Key1",
                                            "default": 10,
                                            "editable": true
                                        },
                                        "level4key2": {
                                            "type": "text",
                                            "displayname": "Level 4 Key2",
                                            "default": "10",
                                            "editable": true
                                        }
                                    }],
                                    "displayname": "Key12 Level 4 Keys Array",
                                    "select": null,
                                    "editable": false,
                                    "default": [{"level4key1": 100, "level4key2": "100"}],
                                    "checkfun": {
                                        "type": "udf",
                                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                                    }
                                },
                            },
                            "displayname": "Key12 Level 3 Keys Array",
                            "select": null,
                            "editable": false,
                            "default": {"level3key1": 100, "level3key2": "200"},
                        }
                    },
                    "displayname": "Key12 Level 2 Keys Array",
                    "select": null,
                    "editable": false,
                    "default": {"level2key1": 100, "level2key2": "200"},
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                },


                "key13": {
                    "type": {
                        "level2key1": {
                            "type": "number", "displayname": "Level2 key1", "default": 10, "editable": true
                        },
                        "level2key2": {
                            "type": "text", "displayname": "Level2 key2", "default": "abc", "editable": true
                        },
                        "level2key3": {
                            "type": {
                                "level3key1": {
                                    "type": ["number"],
                                    "displayname": "Level3 key1",
                                    "displaydesc": "This will come in the hint",
                                    "select": [0, 1, [1, 3, 9, 27, 81]],
                                    "editable": true,
                                    "default": [3]
                                },
                                "level3key2": {
                                    "type": ["text"],
                                    "displayname": "Level3 key2",
                                    "displaydesc": "This will come in the hint",
                                    "select": null,
                                    "editable": true,
                                    "default": ['a', 'b', 'c', 'd']
                                },
                                "level3key3": {
                                    "type": ["number"],
                                    "displayname": "Level3 key3",
                                    "displaydesc": "This will come in the hint",
                                    "select": null,
                                    "editable": false,
                                    "default": [1, 2, 3, 4, 5]
                                }
                            },
                            "displayname": "Level2 key2", "default": {"key1": {}, "key2": {}, "key3": {}}
                        },
                        "level2key4": {
                            "type": "text", "displayname": "Level2 key2", "default": "abc", "editable": true
                        }
                    },
                    "displayname": "Key13 Level 2 Keys Array",
                    "select": null,
                    "editable": false,
                    "default": {"level2key1": 100, "level2key2": "200"},
                    "checkfun": {
                        "type": "udf",
                        "func": 'function(inpdataofthisfield, overalldataofthisjson, schemaforthisfield, overallschema)' +
                        '{return {"status":"FAILURE", "errmsg":"I havent yet checked it"}}'
                    }
                }
            }]
        ];


        var schemaData;
        schemaData = [
            ["perm1", "SETTINGS_TAG_1", {
                "key1": 10,
                "key2": "Ten",
                "key3": [111, 222, 333, 444, 555, 666, 777, 888, 999],
                "key4": ['aaa', 'bbb', 'ccc'],
                "key5": [101, 102, 103],
                "key6": ['aaa', 'bbb', 'ccc'],
                "key7": [1, 3, 9],
                "key8": ['c', 'a'],
                "key9": {"level2key1": "India", "level2key2": "New Delhi"},
                "key10": [{
                    "level2key1": "passenger",
                    "level2key2": 7
                }, {
                    "level2key1": "goods",
                    "level2key2": "8 tonnes"
                }, {
                    "level2key1": "electric",
                    "level2key2": "container"
                }],
                "key11": {
                    "level2key1": 600,
                    "level2key2": "700",
                    "level2key3": {"level3key1": 800, "level3key2": "900"}
                },
                "key12": {
                    "level2key1": 600, "level2key2": "700",
                    "level2key3": {
                        "level3key1": "val1", "level3key2": "val2",
                        "level3key3": [{"level4key1": 800, "level4key2": "900"}, {
                            "level4key1": "700",
                            "level4key2": "600"
                        }, {"level4key1": 1000, "level4key2": "1000"}]
                    }
                },
                "key13": {
                    "level2key1": 600,
                    "level2key2": "700",
                    "level2key3": {"level3key1": [9, 27, 81], "level3key2": [444, 555], "level3key3": [777]},
                    "level2key4": "sometext"
                }
            }]
        ];

        var PERM = 0;
        var TAB_NAME = 1;
        var TAB_SCHEMA = 2;

        var SECTION_TYPE_INVALID = -1;
        var SECTION_TYPE_PRIMITIVE = 0;
        var SECTION_TYPE_PRIMITIVE_ARRAY = 1;
        var SECTION_TYPE_OBJECT = 2;
        var SECTION_TYPE_OBJECT_ARRAY = 3;

        var ELEMENT_TYPE_NUMBER = 'number';
        var ELEMENT_TYPE_TEXT = 'text';

        var getPrimitiveType = function (sectionType) {
            switch (sectionType) {
                case ELEMENT_TYPE_NUMBER:
                    return SECTION_TYPE_PRIMITIVE;
                case ELEMENT_TYPE_TEXT:
                    return SECTION_TYPE_PRIMITIVE;
            }

            return SECTION_TYPE_INVALID;
        };


        var getArrayType = function (sectionType) {
            if (sectionType.constructor === String && getPrimitiveType(sectionType) === SECTION_TYPE_PRIMITIVE)
                return SECTION_TYPE_PRIMITIVE_ARRAY;
            else if (sectionType.constructor === Object || sectionType.constructor === Array)
                return SECTION_TYPE_OBJECT_ARRAY;

            return SECTION_TYPE_INVALID;
        };


        var getSectionType = function (section) {
            if (section.hasOwnProperty('type')) {
                var sectionType = section.type;
                if (sectionType.constructor === String) {
                    return getPrimitiveType(sectionType);
                } else if (sectionType.constructor === Object) {
                    return SECTION_TYPE_OBJECT;
                } else if (sectionType.constructor === Array) {
                    if (sectionType.length === 1) {
                        return getArrayType(sectionType[0]);
                    }
                }
            }

            //$log.log("returning INVALID");
            return SECTION_TYPE_INVALID;
        };


        var createInputField = function (section, key) {
            if (section == null)
                return null;

            return {_schema_uidata: {field: 'icar-input', data: section, key: key}};
        };


        var createReadOnlyList = function (section, key) {

            return {_schema_uidata: {field: 'icar-readonly-list', data: section, key: key}};
        };


        var createEditableList = function (section, key) {
            return {_schema_uidata: {field: 'icar-editable-list', data: section, key: key}};
        };


        var createSelectList = function (section, key) {
            return {_schema_uidata: {field: 'icar-select-list', data: section, key: key}};
        };


        var createElement = function (section, key, sectionType) {
            switch (sectionType) {

                case SECTION_TYPE_PRIMITIVE:
                    return createInputField(section, key);
                    break;

                case SECTION_TYPE_PRIMITIVE_ARRAY:
                    if (section.select) {
                        return createSelectList(section, key);
                    } else if (section.default) {
                        if (!section.editable)
                            return createReadOnlyList(section, key);
                        else
                            return createEditableList(section, key);
                    }
                    break;

                default:
                    return '<span>Unexpected section.type</span>';
            }

        };


        var parseSection = function (section, key) {
            if (section == null || key == null) {
                return null;
            }

            var sectionType = getSectionType(section);
            if (sectionType === SECTION_TYPE_INVALID) {
                return null;
            }

            var sectionComponents;
            if (sectionType === SECTION_TYPE_PRIMITIVE) {
                sectionComponents = createElement(section, key, sectionType);
            } else if (sectionType === SECTION_TYPE_OBJECT) {
                sectionComponents = {};
                for (var subSectionKey in section.type) {
                    var subSection = section.type[subSectionKey];
                    sectionComponents[subSectionKey] = parseSection(subSection, subSectionKey, sectionType);
                }
            } else if (sectionType === SECTION_TYPE_PRIMITIVE_ARRAY || sectionType === SECTION_TYPE_OBJECT_ARRAY) {
                var tmpSection = angular.copy(section);
                tmpSection.type = section.type[0];

                var valueList = null;
                if (!section.select && section.default) {
                    valueList = section.default;
                } else if (section.select && section.select.length == 3) {
                    valueList = section.select[2];
                }

                if (valueList) {
                    if (sectionType === SECTION_TYPE_PRIMITIVE_ARRAY) {
                        sectionComponents = createElement(tmpSection, key, sectionType);
                    } else if (sectionType === SECTION_TYPE_OBJECT_ARRAY) {
                        sectionComponents = [];
                        for (var subSectionKey in valueList) {
                            sectionComponents.push(parseSection(tmpSection, subSectionKey, sectionType));
                        }
                    }
                }
            }

            //$log.log(sectionComponents);
            return sectionComponents;
        };


        var parseSchema = function (schema) {
            var uiComponents = {};
            for (var sidx in schema) {
                var tab = schema[sidx];
                var tabPerm = tab[PERM];
                var tabName = tab[TAB_NAME];
                var tabSchema = tab[TAB_SCHEMA];
                uiComponents[tabName] = {};
                for (var key in tabSchema) {
                    var section = tabSchema[key];
                    uiComponents[tabName][key] = parseSection(section, key);
                }
            }
            $log.log(uiComponents);
            return uiComponents;
        };


        var parseSchemaData = function (schema) {
            var uiComponents = {};
            for (var sidx in schema) {
                var tab = schema[sidx];
                var tabPerm = tab[PERM];
                var tabName = tab[TAB_NAME];
                var tabSchema = tab[TAB_SCHEMA];
                uiComponents[tabName] = {};
                for (var key in tabSchema) {
                    var section = tabSchema[key];
                    uiComponents[tabName][key] = section;
                }
            }
            //$log.log(uiComponents);
            return uiComponents;
        };

        var getSchema = function () {
            return parseSchema(schemaDef);
        };


        var getSchemaData = function () {
            return parseSchemaData(schemaData);
        };


        var bindDataToSchema = function (schema, data) {
            for (var idx in data) {
                var value = data[idx];

                if (value.constructor === Number || value.constructor === String) {
                    if (idx in schema) {
                        schema[idx]['_schema_uidata'].data.model = value;
                        schema[idx]['_schema_uidata'].data.default = schema[idx]['_schema_uidata'].data.model;
                    }
                }
                else if (value.constructor === Object) {
                    if (idx in schema)
                        bindDataToSchema(schema[idx], value);
                } else if (value.constructor === Array) {
                    if (value.length > 0) {
                        if (value[0].constructor === Number || value[0].constructor === String) {
                            for (var didx in value) {
                                if (idx in schema) {
                                    if (!('model' in schema[idx]['_schema_uidata'].data)) {
                                        schema[idx]['_schema_uidata'].data.model = [];
                                        schema[idx]['_schema_uidata'].data.default = schema[idx]['_schema_uidata'].data.model;
                                    }
                                    schema[idx]['_schema_uidata'].data.model.push(value[didx]);
                                }
                            }
                        } else if (value[0].constructor === Object) {
                            var objectSchema = angular.copy(schema[idx][0]);
                            schema[idx] = [];
                            for (var didx in value) {
                                var objectValue = angular.copy(objectSchema);
                                schema[idx].push(objectValue);
                            }

                            for (var didx in value) {
                                bindDataToSchema(schema[idx][didx], value[didx]);
                            }
                        }
                    }
                }
            }
        };

        return {
            //parseSchema : parseSchema,
            getSchema: getSchema,
            getSchemaData: getSchemaData,
            bindDataToSchema: bindDataToSchema
        };
    }
})();


// email/SMS alerts for leasing executives