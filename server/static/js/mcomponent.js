(function($) {
    $.fn.mcomponent = function(args) {

        var startTag = "{%";
        var endTag = "%}";
        var that = this;
        var list;
        var clipboard = {};
        var iterators = {};
        var iteratorConfigs = {};
        var result = {};
        var placeHolder = undefined;

        var executionStack = [];

        /**
         * @constructor
         */
        var InterpretationContext_ = function() {

            this.executionStack = [];
            this.globals = {};

            var that = this;

            /**
             * Looks up a property name, such as "user.name.first" on stack.
             * If undefined is found, it will keep looking, but return undefined if no value is found further up the model stack.
             * @param name
             */
            this.lookup = function(name) {
                var f = createExpressionFunction(name);

                var value = undefined;
                var foundValue = false;

                try {
                    value = this.lookupModelInStack(name);
                    foundValue = true;
                } catch (e) {
                }

                // If we found a value, return it.
                if (value !== undefined) return value;

                try {
                    value = this.runFunction(f);
                    foundValue = true;
                } catch (e) {
                }

                if (!foundValue) throw "Unable to lookup property on model stack: " + name;
                return value;
            };

            /**
             * Looks up a property name (such as "user.name.first") on the model stack.
             * If undefined is found, it will keep looking for a value, but return undefined if no value is found.
             * If nothing is found at all, it throws an exception.
             * @param name
             */
            this.lookupModelInStack = function(name) {
                var stack = interpretationContext.executionStack;
                var value = undefined;
                var foundValue = false;
                for (var i = stack.length - 1; i >= 0; i--) {
                    var model = stack[i].model;
                    try {
                        value = lookup(name, model);
                        foundValue = true;
                    } catch (e) {
                    }
                    if (value !== undefined) return value;
                }
                if (!foundValue) throw "Unable to lookup model property in model stack: " + name;
                return value;
            };

            /*
             TODO:
             1. Make sure that all tests work. Some don't for some reason.
             2. Update lookupContextInStack to use same mechanics, and update all usages to handle the exception thrown when not finding anything.
             */

            this.lookupContextInStack = function(name) {
                var stack = interpretationContext.executionStack;
                var value = undefined;
                var foundValue;
                for (var i = stack.length - 1; i >= 0; i--) {
                    var model = stack[i].context;
                    try {
                        value = lookup(name, model);
                        foundValue = true;
                    } catch (e) {
                    }
                    if (value !== undefined) return value;
                }
                if (!foundValue) throw "Unable to lookup context property in model stack: " + name;
                return value;
            };

            this.getTagApi = function() {
                var that = this;
                return {
                    lookup : function(name) {
                        try {
                            return that.lookup(name);
                        } catch (e) {
                            return undefined;
                        }
                    }
                }
            };

            this.runFunction = function(f) {
                return f.apply(this, [this.getModel(), this.getContext(), this.getGlobals(), this.getTagApi()]);
            };

            this.clear = function() {
                this.executionStack = [];
                this.globals = [];
            };

            this.getModel = function() {
                if (this.executionStack.length == 0) return undefined;
                return this.executionStack[this.executionStack.length - 1].model;
            };

            this.getContext = function() {
                if (this.executionStack.length == 0) return undefined;
                return this.executionStack[this.executionStack.length - 1].context;
            };

            this.getGlobals = function() {
                return this.globals;
            };

            this.push = function(stackItem) {
                if (stackItem === undefined) throw "Trying to push undefined to execution stack.";
                this.executionStack.push(stackItem);
                this.updateLocalState();
            };

            this.pushModel = function(model) {
                this.executionStack.push({model : model});
                this.updateLocalState();
            };

            this.pop = function() {
                if (this.executionStack.length == 0) throw "Trying to pop execution stack, but it is already empty.";
                var v = this.executionStack.pop();
                this.updateLocalState();
                return v;
            };

            this.peek = function() {
                return this.executionStack[this.executionStack - 1];
            };

            this.updateLocalState = function() {
                this.model = this.getModel();
                this.context = this.getContext();
            };
        };

        var interpretationContext = new InterpretationContext_();

        /**
         * @constructor
         */
        var IteratorContext_ = function(iterConfig, modelUsed) {

            var model = modelUsed;
            var config = iterConfig;
            var itemsShowing = iterConfig.itemsPerPage;
            var currentPage = 0;
            var showingAllItems = false;

            this.getStart = function() {
                if (config.usePages) return currentPage * config.itemsPerPage;
                else return 0;
            };

            this.getEnd = function() {
                if (config.usePages) return currentPage * config.itemsPerPage + config.itemsPerPage;
                else return itemsShowing;
            };

            this.renderUpdate = function(start, end) {
                if (!config.usePages) {
                    if (this.getStart() == 0 && this.getEnd() >= model.length) {
                        if (typeof config.allItemsAreShowingCallback === "function") {
                            config.allItemsAreShowingCallback.apply(window, []);
                        } else {
                            throw "Iterator '" + config.name + "' allItemsAreShowingCallback is not a function.";
                        }
                    } else {
                        if (typeof config.notAllItemsAreShowingCallback === "function") {
                            config.notAllItemsAreShowingCallback.apply(window, []);
                        } else {
                            throw "Iterator '" + config.name + "' notAllItemsAreShowingCallback is not a function.";
                        }
                    }
                }
            };

            var getPageCount = function() {
                return Math.ceil(model.length / config.itemsPerPage);
            };

            this.publicInterface = {
                showMoreItems : function() {
                    if (config.usePages) throw "Iterator '" + config.name + "' cannot use showMoreItems() since it is using pages. Use showNextPage() and showPrevPage() instead.";
                    itemsShowing += config.itemsPerPage;
                    if (itemsShowing >= model.length) itemsShowing = model.length;
                },
                showAllItems : function() {
                    if (config.usePages) throw "Iterator '" + config.name + "' cannot use showAllItems() since it is using pages. Use showNextPage() and showPrevPage() instead.";
                    itemsShowing = model.length;
                },
                getPageCount : function() {
                    return getPageCount();
                },
                showNextPage : function() {
                    if (!config.usePages) throw "Iterator '" + config.name + "' cannot use showNextPage() since it isn't using pages. Use showMoreItems() and showAllItems() instead.";
                    currentPage++;
                    if (currentPage >= getPageCount()) currentPage = getPageCount() - 1;
                },
                showPrevPage : function() {
                    if (!config.usePages) throw "Iterator '" + config.name + "' cannot use showPrevPage() since it isn't using pages. Use showMoreItems() and showAllItems() instead.";
                    currentPage--;
                    if (currentPage < 0) currentPage = 0;
                }
            };
        };

        var tagTypes = {
            tag_show : {
                token : "show",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var name = tagInstance.tag.parameters;
                    var v;
                    if (!name) {
                        v = interpretationContext.getModel();
                    } else {
                        v = interpretationContext.lookup(name);
                    }
                    return v !== undefined ? v : "";
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_context : {
                token : "context",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var name = tagInstance.tag.parameters;
                    var v;
                    if (!name) {
                        throw "'context' tag requires one parameter, the context property to display.";
                    } else {
                        v = interpretationContext.lookupContextInStack(name);
                    }
                    return v !== undefined ? v : "";
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_showjs : {
                token : "showjs",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var model = interpretationContext.getModel();
                    var context = interpretationContext.getContext();
                    var f = createExpressionFunction(tagInstance.tag.parameters);
                    var v = interpretationContext.runFunction(f);
                    return v !== undefined ? v : "";
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_js : {
                token : "js",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var f = createExpressionFunction(tagInstance.tag.parameters);
                    interpretationContext.runFunction(f);
                    return "";
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_setglobal : {
                token : "setglobal",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var p = getNiterParametersFromTagParameter(tagInstance.tag.parameters);
                    interpretationContext.getGlobals()[p.iterName] = interpretationContext.lookup(p.variableName);
                    return "";
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_throw : {
                token : "throw",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    throw interpretationContext.lookup(tagInstance.tag.parameters);
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_log : {
                token : "log",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    log(interpretationContext.lookup(tagInstance.tag.parameters));
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_if : {
                token : "if",
                hasBlock : true,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    // Step over each condition, find the first that is true. If none is true, use else.
                    for (var i = 0; i < tagInstance.conditions.length; i++) {
                        var r = interpretationContext.runFunction(tagInstance.conditionFunctions[i]);
                        if (r) {
                            return interpret({tree : tagInstance.contentRoots[i]});
                        }
                    }
                    if (tagInstance.elseContent) {
                        // Append else statements
                        return interpret({tree : tagInstance.elseContent});
                    } else {
                        return "";
                    }
                },
                createTagInstance : function(args) {
                    if (!args.tag.parameters) throw "If tag does not include a condition. Ex: {% if this.model.isNice %}";
                    var condition = args.tag.parameters;
                    var conditionFunction = createExpressionFunction(args.tag.parameters);
                    var c = createIfTag(args.subList, condition);

                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content,
                        condition : condition,
                        conditions : c.conditions,
                        conditionFunctions : c.conditionFunctions,
                        contentRoots : c.contentRoots,
                        elseContent : c.elseContent
                    };
                }
            },

            tag_push : {
                token : "push",
                hasBlock : true,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var name = tagInstance.tag.parameters;
                    if (!name) throw "'push' tag has no parameter. First parameter should be property to push.";
                    var model = interpretationContext.lookup(name);
                    if (model) {
                        interpretationContext.pushModel(model);
                        var result = interpret({tree : tagInstance.content});
                        interpretationContext.pop();
                        return result;
                    } else {
                        throw "Trying to push '" + name + "' but there is no such property in the model stack.";
                    }
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_copy : {
                token : "copy",
                hasBlock : true,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var name = tagInstance.tag.parameters;
                    if (!name) name = "default";
                    clipboard[name] = tagInstance.content;
                    return interpret({tree : clipboard[name]});
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_paste : {
                token : "paste",
                hasBlock : false,
                processTagInstance : function(tagInstance, interpretationContext, args) {
                    var name = tagInstance.tag.parameters;
                    if (!name) name = "default";
                    return interpret({tree : clipboard[name]});
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_iter : {
                token : "iter",
                hasBlock : true,
                processTagInstance : function(tagInstance, interpretationContext) {
                    return tagTypes.tag_niter.processTagInstance(tagInstance, interpretationContext);
                },
                createTagInstance : function(args) {
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            },

            tag_niter : {
                token : "niter",
                hasBlock : true,
                processTagInstance : function(tagInstance, interpretationContext) {
                    var isNiter = tagInstance.tagName == "niter";
                    var iterContext;
                    var niterParameters;

                    var name = tagInstance.tag.parameters;

                    if (isNiter) {
                        niterParameters = getNiterParametersFromTagParameter(tagInstance.tag.parameters);
                        name = niterParameters.variableName;
                    }

                    var list;
                    if (!name) {
                        list = interpretationContext.getModel();
                        name = "current model";
                    } else {
                        list = interpretationContext.lookup(name);
                    }

                    if (isNiter) {
                        iterContext = ensureIterator(niterParameters.iterName, list);
                    }

                    if (list == undefined) throw "Trying to use '" + name + "' as model for iterator, but there is no such property in the model stack.";
                    if (!$.isArray(list)) throw "'" + tagInstance.tagName + "' tag parameter '" + name + "' is not a list.";

                    var start = iterContext ? iterContext.getStart() : 0;
                    var end = iterContext ? Math.min(iterContext.getEnd(), list.length) : list.length;

                    var result = "";
                    for (var i = start; i < end; i++) {
                        var model = list[i];
                        interpretationContext.push({
                            model : model,
                            context : {
                                index : i,
                                size : list.length,
                                isFirst : (i == 0),
                                isLast : (i == list.length - 1),
                                isEven : (i % 2 == 0),
                                isOdd : !(i % 2 == 0),
                                parity : (i % 2 == 0) ? "even" : "odd"
                            }
                        });
                        result += interpret({tree : tagInstance.content});
                        interpretationContext.pop();
                    }
                    if (isNiter && iterContext) {
                        iterContext.renderUpdate(start, end);
                    }
                    return result;

                },
                createTagInstance : function(args) {
                    // Cannot lookup iterConfig here, it might change after view has been rendered.
                    return {
                        tagName : this.token,
                        tag : args.tag,
                        content : args.content
                    };
                }
            }
        };

        var view = {
            html : undefined,
            tree : {},
            list : []
        };

        var createExpressionFunction = function(exp) {
            return new Function("model", "context", "globals", "api", "return " + exp);
        };

        args = $.extend({
            viewHtml : undefined,
            viewFromComponent : undefined,
            model : undefined,
            clipboard : {},
            iter : {},
            maxTagCount : 1000,
            placeHolder : undefined,
            placeHolderId : undefined,
            containerType : "div",
            clearPlaceHolderBeforeRender : true
        }, args);

        var init = function() {
            if (args.placeHolder) {
                placeHolder = args.placeHolder;
            } else if (args.placeHolderId) {
                placeHolder = document.getElementById(args.placeHolderId);
                if (!placeHolder) throw "Unable to find placeholder in DOM with id=" + args.placeHolderId;
            }
            if (that.length) {
                var node = that[0];
                if (node.tagName == "SCRIPT") {
                    _setViewWithHtml($(node).html());
                } else {
                    throw "Source element is not a script tag.";
                }
            } else if (args.viewHtml) {
                _setViewWithHtml(args.viewHtml);
            } else if (args.viewFromComponent) {
                _setViewFromComponent(args.viewFromComponent);
            }
            if (args.model) {
                _setModel(args.model);
            }
            for (var id in args.clipboard) {
                var html = args.clipboard[id];
                var r = buildList(html);
                if (r.error) {
                    throw "Failed to add clipboard with id='" + id + "':" + r.message;
                } else {
                    clipboard[id] = buildTree(r.list)
                }
            }
            for (var iterId in args.iter) {
                iteratorConfigs[iterId] = $.extend({
                    usePages : false,
                    itemsPerPage : 10,
                    allItemsAreShowingCallback : function() {
                    },
                    notAllItemsAreShowingCallback : function() {
                    }
                }, args.iter[iterId]);
            }
        };

        var _setModel = function(model) {
            clearIterators(); // If we change model, all iterators are reset.
            interpretationContext.clear();
            interpretationContext.pushModel(model);
        };

        var _getModel = function() {
            return interpretationContext.getModel();
        };

        var ensureIterator = function(iteratorName, model) {
            if (!iterators[iteratorName]) {
                buildIterator(iteratorName, model);
            }
            return iterators[iteratorName];
        };

        var clearIterators = function() {
            iterators = {};
        };

        var buildIterator = function(iteratorName, model) {
            if (iteratorConfigs[iteratorName]) {
                iteratorConfigs[iteratorName].name = iteratorName;
                iterators[iteratorName] = new IteratorContext_(iteratorConfigs[iteratorName], model);
            } else {
                // We require the configuration to exist to reduce amount of errors.
                throw "Trying to build iterator, but no iterator configuration with name '" + iteratorName + "' exists.";
            }
        };

        var compileList = function() {
            var r = buildList(view.html);
            if (r.error) {
                throw r.message;
            } else {
                view.list = r.list;
            }
        };

        var compileView = function() {
            var r = buildList(view.html);
            if (r.error) {
                throw r.message;
            } else {
                view.list = r.list;
                view.tree = buildTree(view.list);
            }
        };

        var _setViewWithHtml = function(html) {
            var v = getView();
            v.html = html;
            if (html) {
                compileView();
            } else {
                v.list = [];
                v.tree = {};
            }
        };

        var _setViewFromComponent = function(component) {
            view = component._getView();
        };

        var getView = function() {
            return view;
        };

        /**
         * Builds a list of elements from a view.
         * Even elements are HTML, odd elements are tags.
         */
        var buildList = function(viewHtml) {
            var list = [];
            for (var i = 0; i < args.maxTagCount; i++) {
                var startIndex = viewHtml.indexOf(startTag);

                if (startIndex < 0) {
                    // No tags left, just add rest as HTML.
                    if (viewHtml) list.push({html : viewHtml});
                    break;
                } else if (startIndex > 0) {
                    // There was HTML in front of tag, adding it.
                    var html = viewHtml.substring(0, startIndex);
                    if (html) list.push({html : html});
                }

                var endIndex = viewHtml.indexOf(endTag);

                if (endIndex < 0) {
                    return {error : true, message : "Missing end tag."};
                } else if (endIndex < startIndex) {
                    return {error : true, message : "Too many end tags."};
                }

                var tagContent = viewHtml.substring(startIndex + startTag.length, endIndex).trim();

                list.push(createTagObject(tagContent));

                viewHtml = viewHtml.substring(endIndex + endTag.length);

            }
            return {
                error : false,
                list : list
            };
        };

        var buildTree = function(list) {
            var root = [];
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                if (item.html) {
                    root.push(item);
                } else {
                    var tagType = getTagType(item.tagName);
                    var endIndex, subList, endIndexTag;
                    if (tagType && tagType.token == tagTypes.tag_if.token) {
                        // Special case for if, to support elseif and else
                        // Find block, build tree out of it

                        try {
                            endIndexTag = findBlockEnd(list, i, {});
                        } catch (e) {
                            throw e;
                        }
                        subList = list.slice(i + 1, endIndexTag.index);
                        root.push(tagType.createTagInstance({
                            tag : item,
                            subList : subList,
                            content : buildTree(subList)
                        }));
                        i = endIndexTag.index;

                    } else if (tagType && tagType.hasBlock) {
                        // Find block, build tree out of it
                        try {
                            endIndex = findBlockEnd(list, i, {}).index;
                        } catch (e) {
                            throw e;
                        }
                        subList = list.slice(i + 1, endIndex);
                        root.push(tagType.createTagInstance({
                            tag : item,
                            content : buildTree(subList)
                        }));
                        i = endIndex;

                    } else if (tagType) {
                        // not hasBlock.
                        root.push(tagType.createTagInstance({
                            tag : item
                        }));
                    } else {
                        // Is not a system tag
                        root.push(item);
                        //throw "No such tag type: " + item.tagName;
                    }
                }
            }
            return root;
        };

        /**
         * Creates if tag using list that is the content between "if" and "endif".
         * Can contain "else" and "elseif". Can also contain inner if cases.
         * Needs firstCondition since we don't get first if case.
         * @param list
         */
        var createIfTag = function(list, firstCondition) {
            var conditions = [];
            var contentRoots = [];
            var elseContent = [];
            var ifCounter = 0;
            var lastFoundTagName = "if";
            var currentCondition = firstCondition;
            var hasElse = false;

            var startIndex = 0;

            for (var i = 0; i < list.length; i++) {
                var isOnLastItem = i == list.length - 1;
                var item = list[i];

                // HERE!
                /**
                 * When we find an if, run createIfTag recursively and push the result! No need to use ifCounter. Doesn't work anyway, since it doesn't take care of inner if cases properly.
                 * NO! Run buildTree()
                 */
                if (item.tagName == "if") ifCounter++;
                else if (item.tagName == "endif") ifCounter--;

                if (ifCounter == 0 && (isOnLastItem || item.tagName == "else" || item.tagName == "elseif")) {

                    if (lastFoundTagName == "else" && !isOnLastItem) throw "Found 'else' or 'elseif' tag after 'else' tag.";

                    var endIndex = i + (isOnLastItem ? 1 : 0);
                    var subList = list.slice(startIndex, endIndex);
                    var node = buildTree(subList);

                    if (lastFoundTagName == "else") {
                        if (isOnLastItem) {
                            elseContent = node;
                        } else {
                            throw "If case miss match.";
                        }
                    } else {
                        conditions.push(currentCondition);
                        contentRoots.push(node);
                    }

                    currentCondition = item.parameters;

                    lastFoundTagName = item.tagName;
                    if (lastFoundTagName == "else") hasElse = true;

                    startIndex = i + 1;
                } else if (ifCounter != 0 && isOnLastItem) { // Is on last element
                    throw "Not matching if, elseif, else.";
                }
            }

            var conditionFunctions = [];
            for (i = 0; i < conditions.length; i++) {
                var con = conditions[i];
                conditionFunctions.push(createExpressionFunction(con));
            }

            return {
                conditions : conditions,
                conditionFunctions : conditionFunctions,
                contentRoots : contentRoots,
                elseContent : elseContent
            };
        };

        var getTagType = function(token) {
            return tagTypes["tag_" + token];
        };

        var findBlockEnd = function(list, i, args) {
            args = $.extend(
                {
                    endTags : [], // If set, standard "end*" will be overridden.
                    startIndex : i // The index to start searching. If undefined, starts at i.
                }, args);
            if (!$.isArray(args.endTags)) {
                throw "Argument endTags to findBlockEnd() must be a list.";
            }
            var endTags = args.endTags; // If one of these is found at level 0, the end is found!
            var startItem = list[i];
            if (startItem.html) {
                throw "The tag that is opening the block is a HTML element and not a tag.";
            }
            if (list.length < 2) {
                throw "Missing end tag for the '" + startItem.tagName + "' tag.";
            }

            if (args.startIndex !== undefined) i = args.startIndex;
            var startTagType = getTagType(startItem.tagName);
            if (startTagType && !startTagType.hasBlock) throw "Looking for end tag, but start tag does not open block.";
            if (startTagType) {
                var stack = [startItem];
                for (i++; i < list.length; i++) {
                    var item = list[i];
                    if (item.tagName) {
                        // Is a tag, otherwise it is just HTML which we ignore.
                        if (endTags && endTags.length && listContains(endTags, item.tagName)) {
                            // Is "else" or "elseif"
                            if (stack.length == 1) { // 1 since we have "if" on stack.
                                return {
                                    index : i,
                                    endTag : item.tagName
                                };
                            }
                        } else if (item.tagName.substring(0, 3) == "end") {
                            // Is end* tag
                            var tagName = item.tagName.substring(3, item.length);
                            if (stack[stack.length - 1].tagName == tagName) {
                                stack.pop();
                                if (stack.length == 0) {
                                    return {
                                        index : i,
                                        endTag : item.tagName
                                    };
                                }
                            } else {
                                throw "Found closing tag '" + tagName + "' without starting tag.";
                            }
                        } else {
                            // Something other than end*
                            var tagType = getTagType(item.tagName);
                            if (tagType && tagType.hasBlock) {
                                // Is starting new block, push it!
                                stack.push(item);
                            }
                        }
                    }
                }
            }
            throw "Found no closing tag to '" + startItem.tag + "'.";
        };

        var getNiterParametersFromTagParameter = function(tagParameter) {
            var iterName = undefined;
            var variableName = undefined;
            if (tagParameter.indexOf(" ") >= 0) {
                iterName = tagParameter.substring(0, tagParameter.indexOf(" "));
                variableName = tagParameter.substring(tagParameter.indexOf(" ") + 1, tagParameter.length);
            } else {
                iterName = tagParameter;
            }
            return {
                iterName : iterName ? iterName : undefined,
                variableName : variableName ? variableName : undefined
            }
        };

        var createTagObject = function(tagContent) {
            return {
                tag : tagContent,
                tagName : getTagNameFromTag(tagContent),
                parameters : getTagParameters(tagContent)
            };
        };

        var getTagNameFromTag = function(tag) {
            var i = tag.indexOf(" ");
            if (i < 0) return tag;
            else return tag.substring(0, i);
        };

        var getTagParameters = function(tag) {
            var i = tag.indexOf(" ");
            if (i < 0) return "";
            else return tag.substring(i + 1, tag.length);
        };

        var interpret = function(args) {
            args = $.extend({
                tree : []
            }, args);

            var result = "";

            for (var i = 0; i < args.tree.length; i++) {
                var item = args.tree[i];
                if (item.html) {
                    result += item.html;
                } else {
                    var tagType = getTagType(item.tagName);
                    if (tagType) {
                        result += tagType.processTagInstance(item, interpretationContext);
                    } else {
                        result += processOutputTag(item);
                    }
                }
            }

            return result;
        };

        /**
         * Resolves a property on a model. Name can be a path, such as "user.name.first".
         * The property can be null or undefined, but parent objects may not be.
         * @param name
         * @param model
         */
        var lookup = function(name, model) {
            return lookupInObject(name, model, name, "", model);
        };

        /**
         * Resolves a property on a model. Name can be a path, such as "user.name.first".
         * The property can be null or undefined, but parent objects may not be. This method resolves recursively.
         * @param name
         * @param model
         * @param startName
         * @param fullName
         * @param startModel
         */
        var lookupInObject = function(name, model, startName, fullName, startModel) {

            var msg;

            if (model === undefined || model === null) {
                var modelStr = fullName ? "'" + fullName + "'" : "the model";
                msg = "Trying to lookup property '" + startName + "', but " + modelStr + " is undefined.";
                throw msg;
            }

            var s = name.split(".");

            var value = undefined;

            if (s.length == 1) {
                value = model[name];
            } else {
                var first = s[0];
                s.splice(0, 1);
                var rest = s.join(".");
                value = lookupInObject(rest, model[first], startName, fullName ? fullName + "." + first : first, startModel);
            }
            return value;
        };

        var processOutputTag = function(tag) {
            return interpretationContext.lookup(tag.tag);
        };

        var listContains = function(list, value) {
            for (var i = 0; i < list.length; i++) {
                var b = list[i] == value;
                if (b) {
                    return true;
                }
            }
            return false;
        };

        init();

        return {

            setModel : function(model) {
                _setModel(model);
            },

            getModel : function() {
                return _getModel();
            },

            setViewWithHtml : function(html) {
                _setViewWithHtml(html);
            },

            setViewFromComponent : function(component) {
                _setViewFromComponent(component);
            },

            getIterator : function(iteratorName) {
                var i = iterators[iteratorName];
                return i ? i.publicInterface : undefined;
            },

            render : function() {
                result.html = interpret({tree : getView().tree});
                result.node = document.createElement(args.containerType);
                result.node.innerHTML = result.html;
                if (args.clearPlaceHolderBeforeRender) $(placeHolder).html("");
                if (placeHolder) {
                    placeHolder.appendChild(result.node);
                }
                return result;
            },

            getResult : function() {
                return result;
            },

            _getNiterParametersFromTagParameter : function(name) {
                return getNiterParametersFromTagParameter(name);
            },

            _getContainerType : function() {
                return args.containerType;
            },

            _getClipboard : function(name) {
                return clipboard[name];
            },

            _pushModel : function(model) {
                interpretationContext.pushModel(model);
                return true;
            },

            _assertLookup : function(name, model) {
                return lookup(name, model);
            },

            _assertGetTagParameters : function(tagContent) {
                return getTagParameters(tagContent);
            },

            _getExecutionStackSize : function() {
                return interpretationContext.executionStack.length;
            },

            _assertListSize : function(i) {
                if (getView().list.length == i) return true;
                else {
                    throw "List size check failed. Expected:" + i + ", but got:" + getView().list.length;
                }
            },

            _assertListItemHasHtml : function(i, html) {
                var item = getView().list[i];
                if (item && item.html && item.html === html) return true;
                else if (item && item.html) throw "List item check failed. Expected HTML:" + html + ", but got:" + item.html;
                else if (item) throw "List item check failed. Expected HTML:" + html + ", but element is not of HTML type.";
                else throw "List item check failed. List has no element with index:" + i;
            },

            _assertListItemHasTagName : function(i, tagName) {
                var item = getView().list[i];
                if (item && item.tagName && item.tagName === tagName) return true;
                else if (item && item.tagName) throw "List item check failed. Expected tag name:" + tagName + ", but got:" + item.tagName;
                else if (item) throw "List item check failed. Expected tag name:" + tagName + ", but element is not a tag.";
                else throw "List item check failed. List has no element with index:" + i;
            },

            _assertBlockEnd : function(i, expected) {
                var list = getView().list;
                var r = findBlockEnd(list, i, {}).index;
                if (r !== expected) throw "Assert findBlockEnd failed. Expected index:" + expected + ", but got:" + r;
                return true;
            },

            _assertInterpret : function() {
                return interpret({tree : getView().tree});
            },

            _assertSetViewAndBuildList : function(html) {
                var v = getView();
                v.html = html;
                if (html) {
                    var r = buildList(view.html);
                    if (r.error) {
                        throw r.message;
                    } else {
                        view.list = r.list;
                        view.tree = {}
                    }
                } else {
                    v.list = [];
                    v.tree = {};
                }
                return true;
            },

            _findBlockEnd : function(i, args) {
                var list = getView().list;
                return findBlockEnd(list, i, args).index;
            },

            _findBlockEndTag : function(i, args) {
                var list = getView().list;
                return findBlockEnd(list, i, args);
            },

            _getTree : function() {
                return getView().tree;
            },

            _getList : function() {
                return getView().list;
            },

            _getView : function() {
                return view;
            }
        };
    };
}(jQuery));
