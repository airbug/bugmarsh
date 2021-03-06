/*
 * Copyright (c) 2014 airbug Inc. All rights reserved.
 *
 * All software, both binary and source contained in this work is the exclusive property
 * of airbug Inc. Modification, decompilation, disassembly, or any other means of discovering
 * the source code of this software is prohibited. This work is protected under the United
 * States copyright law and other international copyright treaties and conventions.
 */


//-------------------------------------------------------------------------------
// Annotations
//-------------------------------------------------------------------------------

//@Export('bugmarsh.Marshaller')
//@Autoload

//@Require('Bug')
//@Require('Class')
//@Require('Collection')
//@Require('Exception')
//@Require('List')
//@Require('Map')
//@Require('MappedThrowable')
//@Require('Obj')
//@Require('ObjectUtil')
//@Require('Pair')
//@Require('Set')
//@Require('TypeUtil')
//@Require('bugmeta.BugMeta')


//-------------------------------------------------------------------------------
// Context
//-------------------------------------------------------------------------------

require('bugpack').context("*", function(bugpack) {

    //-------------------------------------------------------------------------------
    // BugPack
    //-------------------------------------------------------------------------------

    var Bug                 = bugpack.require('Bug');
    var Class               = bugpack.require('Class');
    var Collection          = bugpack.require('Collection');
    var Exception           = bugpack.require('Exception');
    var List                = bugpack.require('List');
    var Map                 = bugpack.require('Map');
    var MappedThrowable     = bugpack.require('MappedThrowable');
    var Obj                 = bugpack.require('Obj');
    var ObjectUtil          = bugpack.require('ObjectUtil');
    var Pair                = bugpack.require('Pair');
    var Set                 = bugpack.require('Set');
    var TypeUtil            = bugpack.require('TypeUtil');
    var ArgTag              = bugpack.require('bugioc.ArgTag');
    var ModuleTag           = bugpack.require('bugioc.ModuleTag');
    var BugMeta             = bugpack.require('bugmeta.BugMeta');


    //-------------------------------------------------------------------------------
    // Simplify References
    //-------------------------------------------------------------------------------

    var arg                 = ArgTag.arg;
    var bugmeta             = BugMeta.context();
    var module              = ModuleTag.module;


    //-------------------------------------------------------------------------------
    // Declare Class
    //-------------------------------------------------------------------------------

    /**
     * @class
     * @extends {Obj}
     */
    var Marshaller = Class.extend(Obj, {

        _name: "bugmarsh.Marshaller",


        //-------------------------------------------------------------------------------
        // Constructor
        //-------------------------------------------------------------------------------

        /**
         * @constructs
         * @param {MarshRegistry} marshRegistry
         */
        _constructor: function(marshRegistry) {

            this._super();


            //-------------------------------------------------------------------------------
            // Properties
            //-------------------------------------------------------------------------------

            /**
             * @private
             * @type {MarshRegistry}
             */
            this.marshRegistry      = marshRegistry;
        },


        //-------------------------------------------------------------------------------
        // Getters and Setters
        //-------------------------------------------------------------------------------

        /**
         * @return {MarshRegistry}
         */
        getMarshRegistry: function() {
            return this.marshRegistry;
        },


        //-------------------------------------------------------------------------------
        // Public Methods
        //-------------------------------------------------------------------------------

        /**
         * @param {*} data
         * @return {string}
         */
        marshalData: function(data) {
            var unbuiltData = this.unbuildData(data);
            return JSON.stringify(unbuiltData);
        },

        /**
         * @param {string} marshalledData
         * @return {*}
         */
        unmarshalData: function(marshalledData) {
            var unbuiltData = JSON.parse(marshalledData);
            return this.buildData(unbuiltData);
        },


        //-------------------------------------------------------------------------------
        // Protected Methods
        //-------------------------------------------------------------------------------

        /**
         * @protected
         * @param {*} unbuiltData
         * @return {*}
         */
        buildData: function(unbuiltData) {
            if (TypeUtil.isObject(unbuiltData)) {
                return this.buildDataObject(unbuiltData);
            } else if (TypeUtil.isArray(unbuiltData)) {
                return this.buildArray(unbuiltData);
            } else if (TypeUtil.isNumber(unbuiltData) || TypeUtil.isBoolean(unbuiltData) || TypeUtil.isString(unbuiltData)) {
                return unbuiltData;
            } else {
                throw new Bug("Unsupported", {}, "Unsupported data type cannot be marshalled. unbuiltData:", unbuiltData);
            }
        },

        /**
         * @protected
         * @param {Object} unbuiltData
         * @return {*}
         */
        buildDataObject: function(unbuiltData) {
            if (unbuiltData.__bugmarsh) {
                return this.buildMarshObject(unbuiltData);
            } else {
                return this.buildObject(unbuiltData);
            }
        },

        /**
         * @protected
         * @param {*} data
         * @return {*}
         */
        unbuildData: function(data) {
            if (TypeUtil.isObject(data)) {
                return this.unbuildDataObject(data);
            } else if (TypeUtil.isArray(data)) {
                return this.unbuildArray(data);
            } else if (TypeUtil.isDate(data)) {
                return this.unbuildDate(data);
            } else if (TypeUtil.isNull(data)) {
                return this.unbuildNull(data);
            } else if (TypeUtil.isUndefined(data)) {
                return this.unbuildUndefined(data);
            } else if (TypeUtil.isNumber(data) || TypeUtil.isBoolean(data) || TypeUtil.isString(data)) {
                return data;
            } else {
                throw new Bug("Unsupported", {}, "Unsupported data type cannot be marshalled. data:" + data);
            }
        },

        /**
         * @protected
         * @param {*} data
         * @return {*}
         */
        unbuildDataObject: function(data) {
            if (TypeUtil.isFunction(data.getClass) && this.marshRegistry.hasMarshForClass(data.getClass())) {
                return this.unbuildMarshObject(data);
            } else if (Class.doesExtend(data, Set)) {
                return this.unbuildSet(data);
            } else if (Class.doesExtend(data, Pair)) {
                return this.unbuildPair(data);
            } else if (Class.doesExtend(data, List)) {
                return this.unbuildList(data);
            } else if (Class.doesExtend(data, Map)) {
                return this.unbuildMap(data);
            } else if (Class.doesExtend(data, Collection)) {
                return this.unbuildCollection(data);
            } else if (Class.doesExtend(data, Exception)) {
                return this.unbuildException(data);
            } else if (Class.doesExtend(data, Bug)) {
                return this.unbuildBug(data);
            } else if (Class.doesExtend(data, MappedThrowable)) {
                return this.unbuildMappedThrowable(data);
            } else if (data instanceof Error) {
                return this.unbuildAnyError(data);
            } else {
                return this.unbuildObject(data);
            }
        },


        //-------------------------------------------------------------------------------
        // Private Methods
        //-------------------------------------------------------------------------------

        /**
         * @private
         * @param {Array.<*>} unbuiltArray
         * @return {Array.<*>}
         */
        buildArray: function(unbuiltArray) {
            var _this           = this;
            var builtArray      = [];
            unbuiltArray.forEach(function(value) {
                builtArray.push(_this.buildData(value));
            });
            return builtArray;
        },

        /**
         * @private
         * @param {*} unbuiltData
         * @return {Bug}
         */
        buildBug: function(unbuiltData) {
            var _this   = this;
            var causes  = [];
            unbuiltData.value.causes.forEach(function(cause) {
                causes.push(_this.buildData(cause));
            });
            var bug = new Bug(unbuiltData.value.type, this.buildData(unbuiltData.value.data), unbuiltData.value.message, causes);
            bug.stack = unbuiltData.value.stack;
            return bug;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: Array.<*>}} unbuiltData
         * @return {Collection}
         */
        buildCollection: function(unbuiltData) {
            var _this           = this;
            var builtCollection = new Collection();
            unbuiltData.value.forEach(function(unbuiltValue) {
                builtCollection.add(_this.buildData(unbuiltValue));
            });
            return builtCollection;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: (String|*|string)}} unbuiltData
         * @return {Date}
         */
        buildDate: function(unbuiltData) {
            return new Date(unbuiltData.value);
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: string, value: *}} unbuiltData
         * @return {Error}
         */
        buildError: function(unbuiltData) {
            var error = new Error(unbuiltData.value.message);
            error.name = unbuiltData.value.name;
            error.stack = unbuiltData.value.stack;
            return error;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: *}} unbuiltData
         * @return {Exception}
         */
        buildException: function(unbuiltData) {
            var _this   = this;
            var causes  = [];
            unbuiltData.value.causes.forEach(function(cause) {
                causes.push(_this.buildData(cause));
            });
            var exception = new Exception(unbuiltData.value.type, this.buildData(unbuiltData.value.data), unbuiltData.value.message, causes);
            exception.stack = unbuiltData.value.stack;
            return exception;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: Array.<*>}} unbuiltData
         * @return {List}
         */
        buildList: function(unbuiltData) {
            var _this           = this;
            var builtList       = new List();
            unbuiltData.value.forEach(function(unbuiltValue) {
                builtList.add(_this.buildData(unbuiltValue));
            });
            return builtList;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: string, keys: Array, values: Array}} unbuiltData
         * @return {Map}
         */
        buildMap: function(unbuiltData) {
            var _this       = this;
            var builtMap    = new Map();
            unbuiltData.keys.forEach(function(unbuiltKey, index) {
                var unbuiltValue = unbuiltData.values[index];
                builtMap.put(_this.buildData(unbuiltKey), _this.buildData(unbuiltValue));
            });
            return builtMap;
        },

        /**
         * @private
         * @param unbuiltData
         * @return {MappedThrowable}
         */
        buildMappedThrowable: function(unbuiltData) {
            var _this   = this;
            var causes  = [];
            unbuiltData.value.causes.forEach(function(cause) {
                causes.push(_this.buildData(cause));
            });
            var mappedThrowable = new MappedThrowable(unbuiltData.value.type, this.buildData(unbuiltData.value.data));
            mappedThrowable.stack = unbuiltData.value.stack;
            mappedThrowable.throwableMap = _this.buildData(unbuiltData.value.throwableMap);
            return mappedThrowable;
        },

        /**
         * @private
         * @param {*} unbuiltData
         * @return {*}
         */
        buildMarshObject: function(unbuiltData) {
            switch (unbuiltData.type) {
                case Marshaller.Types.DATE:
                    return this.buildDate(unbuiltData);
                    break;
                case Marshaller.Types.NULL:
                    return null;
                    break;
                case Marshaller.Types.UNDEFINED:
                    return undefined;
                    break;
                case "Bug":
                    return this.buildBug(unbuiltData);
                    break;
                case "Collection":
                    return this.buildCollection(unbuiltData);
                    break;
                case "Error":
                    return this.buildError(unbuiltData);
                    break;
                case "Exception":
                    return this.buildException(unbuiltData);
                    break;
                case "List":
                    return this.buildList(unbuiltData);
                    break;
                case "Map":
                    return this.buildMap(unbuiltData);
                    break;
                case "MappedThrowable":
                    return this.buildMappedThrowable(unbuiltData);
                    break;
                case "Pair":
                    return this.buildPair(unbuiltData);
                    break;
                case "Set":
                    return this.buildSet(unbuiltData);
                    break;
                default:
                    var _this           = this;
                    var marsh           = this.marshRegistry.getMarshByName(unbuiltData.type);
                    if (marsh) {
                        var marshClass          = marsh.getMarshClass();
                        var marshConstructor    = marshClass.getConstructor();
                        var builtMarsh          = new marshConstructor();
                        marsh.getMarshPropertyList().forEach(function(marshProperty) {
                            var value = _this.buildData(unbuiltData.value[marshProperty.getPropertyName()]);
                            if (marshProperty.hasSetter()) {
                                builtMarsh[marshProperty.getSetterName()](value);
                            } else {
                                builtMarsh[marshProperty.getPropertyName()] = value;
                            }
                        });
                        return builtMarsh;
                    } else {
                        throw new Bug("UnregisteredMarshType", {}, "Cannot find marsh by the type '" + unbuiltData.type + "'");
                    }

            }
        },

        /**
         * @private
         * @param unbuiltData
         */
        buildObject: function(unbuiltData) {
            var _this       = this;
            var builtData   = {};
            ObjectUtil.forIn(unbuiltData, function(key, value) {
                builtData[key] = _this.buildData(value);
            });
            return builtData;
        },

        /**
         * @private
         * @param {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: {a: *, b: *}}} unbuiltData
         * @return {Pair}
         */
        buildPair: function(unbuiltData) {
            return new Pair(unbuiltData.value.a, unbuiltData.value.b);
        },

        /**
         * @private
         * @param unbuiltData
         * @return {Set}
         */
        buildSet: function(unbuiltData) {
            var _this       = this;
            var builtData   = new Set();
            unbuiltData.value.forEach(function(value) {
                builtData.add(_this.buildData(value));
            });
            return builtData;
        },

        /**
         * @private
         * @param {Array} data
         * @return {Array}
         */
        unbuildArray: function(data) {
            var _this           = this;
            var unbuiltArray    = [];
            data.forEach(function(value) {
                unbuiltArray.push(_this.unbuildData(value));
            });
            return unbuiltArray;
        },

        /**
         * @private
         * @param {Bug} data
         * @return {{__bugmarsh: boolean, type: string, value: *}}
         */
        unbuildBug: function(data) {
            var unbuiltThrowable = this.unbuildThrowable(data);
            unbuiltThrowable.type = "Bug";
            return unbuiltThrowable;
        },

        /**
         * @private
         * @param {Collection} data
         * @return {{__bugmarsh: boolean, type: string, value: Array}}
         */
        unbuildCollection: function(data) {
            var _this               = this;
            var unbuiltCollection   = [];
            data.forEach(function(value) {
                unbuiltCollection.push(_this.unbuildData(value));
            });
            return {
                __bugmarsh: true,
                type: "Collection",
                value: unbuiltCollection
            };
        },

        /**
         * @private
         * @param {Date} data
         * @return {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: (String|*|string)}}
         */
        unbuildDate: function(data) {
            return {
                __bugmarsh: true,
                type: Marshaller.Types.DATE,
                value: data.toString()
            };
        },

        /**
         * @private
         * @param {Error} data
         */
        unbuildAnyError: function(data) {
            return this.unbuildError(data);
        },

        /**
         * @private
         * @param {Error} data
         * @return {{__bugmarsh: boolean, type: string, value: *}}
         */
        unbuildError: function(data) {
            return {
                __bugmarsh: true,
                type: "Error",
                value: {
                    message: data.message,
                    name: data.name,
                    stack: data.stack
                }
            };
        },


        /**
         * @private
         * @param {Exception} data
         * @return {{__bugmarsh: boolean, type: string, value: *}}
         */
        unbuildException: function(data) {
            var unbuiltThrowable = this.unbuildThrowable(data);
            unbuiltThrowable.type = "Exception";
            return unbuiltThrowable;
        },

        /**
         * @private
         * @param {List} data
         * @return {{__bugmarsh: boolean, type: (Marshaller.Types|string), value: (String|*|string)}}
         */
        unbuildList: function(data) {
            var _this           = this;
            var unbuiltList     = [];
            data.forEach(function(value) {
                unbuiltList.push(_this.unbuildData(value));
            });
            return {
                __bugmarsh: true,
                type: "List",
                value: unbuiltList
            };
        },

        /**
         * @private
         * @param {Map} data
         * @return {{__bugmarsh: boolean, type: string, keys: Array, values: Array}}
         */
        unbuildMap: function(data) {
            var _this           = this;
            var unbuiltKeys     = [];
            var unbuiltValues   = [];
            data.forEach(function(value, key) {
                unbuiltKeys.push(_this.unbuildData(key));
                unbuiltValues.push(_this.unbuildData(value));
            });
            return {
                __bugmarsh: true,
                type: "Map",
                keys: unbuiltKeys,
                values: unbuiltValues
            };
        },

        /**
         * @private
         * @param {MappedThrowable} mappedThrowable
         * @return {{__bugmarsh: boolean, type: string, value: *}}
         */
        unbuildMappedThrowable: function(mappedThrowable) {
            var unbuiltThrowable = this.unbuildThrowable(data);
            unbuiltThrowable.type = "MappedThrowable";
            unbuiltThrowable.value.throwableMap = this.unbuildMap(mappedThrowable.getCauseMap());
            return unbuiltThrowable;
        },

        /**
         * @private
         * @param {Obj} data
         * @return {*}
         */
        unbuildMarshObject: function(data) {
            var _this           = this;
            var marsh           = this.marshRegistry.getMarshByClass(data.getClass());
            var unbuiltMarsh    = {};
            marsh.getMarshPropertyList().forEach(function(marshProperty) {
                var value = null;
                if (marshProperty.hasGetter()) {
                    value = data[marshProperty.getGetterName()]();
                } else {
                    value = data[marshProperty.getPropertyName()];
                }
                unbuiltMarsh[marshProperty.getPropertyName()] = _this.unbuildData(value);
            });
            return {
                __bugmarsh: true,
                type: marsh.getMarshName(),
                value: unbuiltMarsh
            };
        },

        /**
         * @private
         * @param {null} data
         * @return {{__bugmarsh: boolean, type: (Marshaller.Types|string)}}
         */
        unbuildNull: function(data) {
            return {
                __bugmarsh: true,
                type: Marshaller.Types.NULL
            };
        },

        /**
         * @private
         * @param {Object} data
         * @return {Object}
         */
        unbuildObject: function(data) {
            var _this           = this;
            var unbuiltObject   = {};
            ObjectUtil.forIn(data, function(key, value) {
                unbuiltObject[key] = _this.unbuildData(value);
            });
            return unbuiltObject;
        },

        /**
         * @private
         * @param {Pair} data
         * @return {{__bugmarsh: boolean, type: string, value: {a: *, b: *}}}
         */
        unbuildPair: function(data) {
            var unbuiltPair = {
                a: this.unbuildData(data.getA()),
                b: this.unbuildData(data.getB())
            };
            return {
                __bugmarsh: true,
                type: "Pair",
                value: unbuiltPair
            };
        },

        /**
         * @private
         * @param {Set} data
         * @return {{__bugmarsh: boolean, type: string, value: Array}}
         */
        unbuildSet: function(data) {
            var _this       = this;
            var unbuiltSet  = [];
            data.forEach(function(value) {
                unbuiltSet.push(_this.unbuildData(value));
            });
            return {
                __bugmarsh: true,
                type: "Set",
                value: unbuiltSet
            };
        },

        /**
         * @private
         * @param {Throwable} data
         * @return {{__bugmarsh: boolean, type: string, value: *}}
         */
        unbuildThrowable: function(data) {
            var _this               = this;
            var unbuiltCauses       = [];
            data.getCauses().forEach(function(cause) {
                unbuiltCauses.push(_this.unbuildData(cause));
            });
            var unbuiltThrowable    = {
                causes: unbuiltCauses,
                data: _this.unbuildData(data.getData()),
                message: data.getMessage(),
                stack: data.getStack(),
                type: data.getType()
            };
            return {
                __bugmarsh: true,
                type: "Throwable",
                value: unbuiltThrowable
            };
        },

        /**
         * @private
         * @param {undefined} data
         * @return {{__bugmarsh: boolean, type: (Marshaller.Types|string)}}
         */
        unbuildUndefined: function(data) {
            return {
                __bugmarsh: true,
                type: Marshaller.Types.UNDEFINED
            };
        }
    });


    //-------------------------------------------------------------------------------
    // Static Properties
    //-------------------------------------------------------------------------------

    /**
     * @static
     * @enum {string}
     */
    Marshaller.Types = {
        ARRAY: "array",
        BOOLEAN: "boolean",
        DATE: "date",
        NULL: "null",
        NUMBER: "number",
        OBJECT: "object",
        STRING: "string",
        UNDEFINED: "undefined"
    };


    //-------------------------------------------------------------------------------
    // Export
    //-------------------------------------------------------------------------------

    bugpack.export('bugmarsh.Marshaller', Marshaller);
});
