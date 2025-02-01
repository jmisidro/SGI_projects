import * as THREE from 'three';
import { MySceneData } from '../MySceneData.js';

class MyFileReader {

	/**
	   constructs the object
	*/
	constructor(onSceneLoadedCallback) {
		this.data = new MySceneData();
		this.errorMessage = null;
		this.onSceneLoadedCallback = onSceneLoadedCallback;

		this.graphElement = null;
	}

	open(jsonfile) {
		fetch(jsonfile)
			.then((res) => {
				if (!res.ok) {
					console.error(`HTTP error! Status: ${res.status}`);
					throw new Error(`HTTP error! Status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				this.readJson(data);
				this.onSceneLoadedCallback(this.data);
			})
			.catch((error) =>
				console.error("Unable to fetch data:", error));
	};

	/**
	 * Read the json file and loads the data
	 */
	readJson(data) {
		try {
			const rootElement = data["yasf"];
			if (rootElement == null) {
				console.error("root element 'yasf' not found in json file.");
				throw new Error("root element 'yasf' not found in json file.");
			}

			this.graphElement = rootElement["graph"];
			if (this.graphElement == null) {
				console.error("graph element not found in json file.");
				throw new Error("graph element not found in json file.");
			}

			this.loadGlobals(rootElement);
			this.loadTextures(rootElement);
			this.loadMaterials(rootElement);
			this.loadCameras(rootElement);
			this.loadNodes();
		}
		catch (error) {
			this.errorMessage = error;
		}
	}

	/**
	 * checks if any unknown node is child a given element
	 * @param {*} parentElem 
	 * @param {Array} list an array of strings with the valid node names
	 */
	checkForUnknownNodes(parentElem, list) {
		// for each of the elem's children
		for (let i = 0; i < parentElem.children.length; i++) {
			let elem = parentElem.children[i]
			// is element's tag name not present in the list?
			if (list.includes(elem.tagName) === false) {
				// unkown element. Report!
				console.error("unknown json element '", elem.tagName, "' descendent of element '", parentElem.tagName, "'")
				throw new Error("unknown json element '", elem.tagName, "' descendent of element '", parentElem.tagName, "'")
			}
		}
	}

	/**
	 *  checks if any unknown attributes exits at a given element
	 * @param {*} elem 
	 *  @param {Array} list an array of strings with the valid attribute names	  
	*/
	checkForUnknownAttributes(elem, list) {
		// for each elem attributes
		for (let attrib in elem) {
			if (list.includes(attrib) === false) {
				console.error("unknown attribute '", attrib, "' in element ", elem.id, "not included in ", list);
				throw new Error("unknown attribute '", attrib, "' in element ", elem.id, "not included in ", list);
			}
		}
	}

	toArrayOfNames(descriptor) {
		let list = []
		// for each descriptor, get the value
		for (let i = 0; i < descriptor.length; i++) {
			list.push(descriptor[i].name)
		}
		return list
	}

	/**
	 * returns the index of a string in a list. -1 if not found
	 * @param {Array} list an array of strings
	 * @param {*} searchString the searched string
	 * @returns the zero-based index of the first occurrence of the specified string, or -1 if the string is not found
	 */
	indexOf(list, searchString) {
		if (Array.isArray(list)) {
			return list.indexOf(searchString)
		}
		return -1;
	}

	/**
	 * extracts the color (rgb) from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {String} attributeName the attribute name
	 * @param {Boolean} required if the attribte is required or not
	 * @returns {THREE.Color} the color encoded in a THREE.Color object
	 */
	getRGB(element, attributeName, required) {
		if (required == undefined) required = true;

		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			console.error("rgb attribute name is null.");
			throw new Error("rgb attribute name is null.");
		}

		let value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element.id, "': rgba value is null for attribute '", attributeName, "' in element '", element.id, "'.");
				throw new Error("element '", element.id, "': rgba value is null for attribute '", attributeName, "' in element '", element.id, "'.");
			}
			return null;
		}

		return this.getVectorN(value, ["r", "g", "b"]);
	}

	/**
	 * returns a rectangle2D from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {String} attributeName the attribute name 
	 * @param {boolean} required if the attribte is required or not
	 * @returns {Array} an array object with 4 elements: x1, y1, x2, y2
	 */
	getRectangle2D(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			console.error("rectangle2D attribute name is null.");
			throw new Error("rectangle2D attribute name is null.");
		}

		let value = element.getAttribute(attributeName);
		if (value == null) {
			if (required) {
				console.error("element '", element.id, ": rectangle2D value is null for attribute ", attributeName, ".");
				throw new Error("element '", element.id, ": rectangle2D value is null for attribute ", attributeName, ".");
			}
			return null;
		}

		let temp = value.split(' ');
		if (temp.length != 4) {
			console.error("element '", element.id, ": invalid ", temp.length, " number of components for a rectangle2D, in attribute ", attributeName, ".");
			throw new Error("element '", element.id, ": invalid ", temp.length, " number of components for a rectangle2D, in attribute ", attributeName, ".");
		}

		let rect = {};
		rect.x1 = parseFloat(temp[0]);
		rect.y1 = parseFloat(temp[1]);
		rect.x2 = parseFloat(temp[2]);
		rect.y2 = parseFloat(temp[3]);
		return rect;
	}

	getVectorN(value, keys) {
		let vector = new Array();
		for (let i = 0; i < keys.length; ++i) {
			const key = keys[i];
			const component = value[key];
			if (component === null || component === undefined) {
				console.error("element '", value, "': vector", keys.length, " value is null for '", key);
				throw new Error("element '", value, "': vector", keys.length, " value is null for '", key);
			}
			vector.push(component);
		}
		return vector;
	}

	/**
	 * returns a vector3 from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector3 encoded in a THREE.Vector3 object
	 */
	getVector3(element, attributeName, required) {
		if (required == undefined) required = true;

		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			console.error("vector3 attribute name is null.");
			throw new Error("vector3 attribute name is null.");
		}

		const value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element.id, "': vector3 value is null for attribute '", attributeName, "' in element '", element.id, "'.");
				throw new Error("element '", element.id, "': vector3 value is null for attribute '", attributeName, "' in element '", element.id, "'.");
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y", "z"]);
	}

	/**
	 * returns a vector2 from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the attribute name 
	 * @param {*} required if the attribte is required or not
	 * @returns {THREE.vector3} the vector2 encoded in a THREE.Vector3 object
	 */
	getVector2(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			throw new Error("vector3 attribute name is null.");
		}

		const value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element.id, ": vector2 value is null for attribute ", attributeName, ".");
				throw new Error("element '", element.id, ": vector2 value is null for attribute ", attributeName, ".");
			}
			return null;
		}

		return this.getVectorN(value, ["x", "y"]);
	}

	/**
	 * returns a string from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the attribute name
	 * @param {*} required if the attribte is required or not
	 * @returns {String} the string
	 */
	getString(element, attributeName, required) {

		if (required == undefined) required = true;

		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			console.error("string attribute name is null.");
			throw new Error("string attribute name is null.");
		}

		const value = element[attributeName];
		if (value == null && required) {
			console.error("element '", element, ": in element '", element, "' string value is null for attribute '", attributeName, "'.");
			throw new Error("element '", element, ": in element '", element, "' string value is null for attribute '", attributeName, "'.");
		}
		return value;
	}

	/**
	 * checks if an element has a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName 
	 * @returns {boolean} if the element has the attribute
	 */
	hasAttribute(element, attributeName) {
		if (element == null) {
			console.error("element is null.");
			throw new Error("element is null.");
		}
		if (attributeName == null) {
			console.error("string attribute name is null.");
			throw new Error("string attribute name is null.");
		}

		let value = element.getAttribute(attributeName);
		return (value != null);
	}

	/**
	 * returns a boolean from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {boolean} the boolean value
	 */
	getBoolean(element, attributeName, required) {
		if (required == undefined) required = true;

		const value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element, ": in element '", element, "' bool value is null for attribute '", attributeName, "'.");
				throw new Error("element '", element, ": in element '", element, "' bool value is null for attribute '", attributeName, "'.");
			}
			return null;
		}
		if (typeof value !== "boolean") {
			console.error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be bool but is '", (typeof value), "'")
			throw new Error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be bool but is '", (typeof value), "'")
		}

		return value
	}

	/**
	 * returns a integer from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Integer} the integer value
	 */
	getInteger(element, attributeName, required) {
		if (required == undefined) required = true;

		const value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element, ": in element '", element, "' integer value is null for attribute '", attributeName, "'.");
				throw new Error("element '", element, ": in element '", element, "' integer value is null for attribute '", attributeName, "'.");
			}
			return null;
		}
		if (!Number.isInteger(value)) {
			console.error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be integer but is '", (typeof value), "'")
			throw new Error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be integer but is '", (typeof value), "'")
		}

		return value
	}

	/**
	 * returns a float from an element for a particular attribute
	 * @param {*} element the json element
	 * @param {*} attributeName the 
	 * @param {*} required if the attribte is required or not
	 * @returns {Float} the float value
	 */
	getFloat(element, attributeName, required) {
		if (required == undefined) required = true;

		const value = element[attributeName];
		if (value == null) {
			if (required) {
				console.error("element '", element, ": in element '", element, "' float value is null for attribute '", attributeName, "'.");
				throw new Error("element '", element, ": in element '", element, "' float value is null for attribute '", attributeName, "'.");
			}
			return null;
		}
		if (typeof value !== "number") {
			console.error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be float but is '", (typeof value), "'")
			throw new Error("element '", element, ": in element '", element, "' attribute '", attributeName, "' should be float but is '", (typeof value), "'")
		}

		return value
	}

	/*
		Example: options = {elem: elem, descriptor: descriptor, extras: [["type", "pointlight"]]}
		where elem is a json element, descriptor is an array of all the attributes description and extras are extra
		attributes to add to the resulting object.

		Each attribute descriptor is an object with the following properties:
		- name: the name of the attribute
		- type: the type of the attribute (string, boolean, integer, float, vector3, vector2, rgba, rectangle2D, item)
		- required: true if the attribute is required, false otherwise
		- default: the default value if the attribute is not required and not present in the json element
		- choices: an array of choices if the type is item

	*/
	loadJsonItem(options) {
		// create an empty object
		let obj = {}

		if (options === null || options === undefined) {
			console.error("unable to load json item because arguments are null or undefined");
			throw new Error("unable to load json item because arguments are null or undefined");
		}

		if (options.elem === null || options.elem === undefined) {
			console.error("unable to load json item because json element is null or undefined");
			throw new Error("unable to load json item because json element is null or undefined");
		}

		if (options.descriptor === null || options.descriptor === undefined) {
			console.error("unable to load json item because descriptor to parse element '", options.elem.id, "' is null or undefined");
			throw new Error("unable to load json item because descriptor to parse element '", options.elem.id, "' is null or undefined");
		}

		// Add the id to the element if the descriptor requires it
		for (let i in options.descriptor) {
			const attr = options.descriptor[i];
			if (attr.name == "id") {
				options.elem["id"] = options.key;
			}
		}

		this.checkForUnknownAttributes(options.elem, this.toArrayOfNames(options.descriptor))

		// for each descriptor, get the value
		for (let i = 0; i < options.descriptor.length; i++) {
			let value = null;
			let descriptor = options.descriptor[i]
			if (descriptor.type === "string") {
				value = this.getString(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "boolean") {
				value = this.getBoolean(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "integer") {
				value = this.getInteger(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "float") {
				value = this.getFloat(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector3") {
				value = this.getVector3(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "vector2") {
				value = this.getVector2(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rgb") {
				value = this.getRGB(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "rectangle2D") {
				value = this.getRectangle2D(options.elem, descriptor.name, descriptor.required);
			}
			else if (descriptor.type === "list") {
				let newDescriptor = this.data.descriptors[descriptor.listOf];
				value = [];
				for (let key in options.elem[descriptor.name]) {
					let newObj = this.loadJsonItem({
						elem: options.elem[descriptor.name][key],
						descriptor: newDescriptor,
						extras: []
					});
					value.push(newObj);
				}
			}
			else if (descriptor.type === "fog") {
				this.loadFog(options.elem)
			}
			else if (descriptor.type === "skybox") {
				this.loadSkybox(options.elem)
			}
			else {
				console.error("element '", options.elem, " invalid type '", descriptor.type, "' in descriptor");
				throw new Error("element '", options.elem, " invalid type '", descriptor.type, "' in descriptor");
			}

			// if the value is null and the attribute is not required, then use the default value
			if (value == null && descriptor.required == false && descriptor.default != undefined) {
				value = descriptor.default;
			}

			// store the value in the object
			obj[descriptor.name] = value;
		}
		// append extra parameters if any
		for (let i = 0; i < options.extras.length; i++) {
			let extra = options.extras[i]
			obj[extra[0]] = extra[1]
		}

		// return the object
		return obj;
	}

	loadJsonItems(parentElemen, tagName, descriptor, extras, addFunc) {
		for (let elem in parentElemen) {
			let obj = this.loadJsonItem({
				key: elem,
				elem: parentElemen[elem],
				descriptor: descriptor,
				extras: extras
			});
			addFunc.bind(this.data)(obj);
		}
	}

	/*
	 * Load globals element
	 * 
	 */
	loadGlobals(rootElement) {
		const globals = rootElement["globals"];
		this.data.setGlobals(this.loadJsonItem({
			key: "globals",
			elem: globals,
			descriptor: this.data.descriptors["globals"],
			extras: [["type", "globals"]]
		}));
	}

	/**
	 * Load fog element
	 * @param {*} rootElement 
	 */
	loadFog(rootElement) {
		const fog = rootElement["fog"];
		this.data.setFog(this.loadJsonItem({
			key: "fog",
			elem: fog,
			descriptor: this.data.descriptors["fog"],
			extras: [["type", "fog"]]
		}))
	}

	
	/**
	 * Load the skybox element
	 * @param {*} rootElement 
	 */
	loadSkybox(rootElement) {
		const skybox = rootElement["skybox"];
		this.data.setSkybox(this.loadJsonItem({
			key: "skybox",
			elem: skybox,
			descriptor: this.data.descriptors["skybox"],
			extras: [["type", "skybox"]]
		}))
	}

	/**
	 * Load the textures element
	 * @param {*} rootElement 
	 */
	loadTextures(rootElement) {
		const elem = rootElement["textures"];
		this.loadJsonItems(elem, 'texture', this.data.descriptors["texture"], [["type", "texture"]], this.data.addTexture)
	}

	/**
	 * Load the materials element
	 * @param {*} rootElement 
	 */
	loadMaterials(rootElement) {
		const elem = rootElement["materials"];
		this.loadJsonItems(elem, 'material', this.data.descriptors["material"], [["type", "material"]], this.data.addMaterial)
	}

	/**
	 * Load the cameras element
	 * @param {*} rootElement 
	 */
	loadCameras(rootElement) {
		let camerasElem = rootElement["cameras"];

		for (let key in camerasElem) {
			let elem = camerasElem[key];
			if (key == "initial") {
				this.data.setActiveCameraId(elem);
				continue;
			}

			let camType = elem["type"];
			if (camType == "orthogonal") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["orthogonal"],
					extras: [["type", "orthogonal"]]
				}));
			}
			else if (camType == "perspective") {
				this.data.addCamera(this.loadJsonItem({
					key: key,
					elem: elem,
					descriptor: this.data.descriptors["perspective"],
					extras: [["type", "perspective"]]
				}));
			}
			else {
				console.error("Unrecognized camera type '", camType, "' in camera '", key, "'");
				throw new Error("Unrecognized camera type '", camType, "' in camera '", key, "'");
			}
		}
	}

	/**
	 * Load the nodes element
	 */
	loadNodes() {
		const graphElem = this.graphElement;
		for (let key in graphElem) {
			let elem = graphElem[key];

			if (key == "rootid") {
				this.data.setRootId(elem);
				continue;
			}

			this.loadNode(key, elem);
		}
	}

	/**
	 * Load the data for a particular node elemment
	 * @param {*} id the node id
	 * @param {*} nodeElement the json node element
	 * @param {*} parentElement the parent element
	 */
	loadNode(id, nodeElement, parentElement=null) {
		let nodeType = nodeElement["type"];

		if (nodeType == null) {
			console.error("node ", id, " has no type.");
			throw new Error("node ", id, " has no type.");
		}

		if (nodeType == 'lod') {
			this.loadLOD(id, nodeElement, parentElement);
			return;
		}

		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getNode(id);
		if (obj !== null && obj.loaded) {
			return;
		}
		else {
			// otherwise add a new node
			obj = this.data.createEmptyNode(id);
		}

		// load transformations
		let transforms = nodeElement["transforms"];
		if (transforms !== null && transforms !== undefined) {
			this.loadTransforms(obj, transforms);
		}

		// load cast shadows 
		let castshadows = nodeElement["castshadows"];
		if (castshadows !== null && castshadows !== undefined) {
			obj.castShadows = this.getBoolean(nodeElement, "castshadows");
		}

		// load receive shadows
		let receiveshadows = nodeElement["receiveshadows"];
		if (receiveshadows !== null && receiveshadows !== undefined) {
			obj.receiveShadows = this.getBoolean(nodeElement, "receiveshadows");
		}

		// load material refeences
		let materialsRef = nodeElement["materialref"];
		if (materialsRef != null) {
			if (materialsRef["materialId"] === null || materialsRef["materialId"] === undefined) {
				console.error("node ", id, " has a materialref but not a materialId");
				throw new Error("node ", id, " has a materialref but not a materialId");
			}

			let materialId = this.getString(materialsRef, "materialId");
			obj['materialIds'].push(materialId);
		}

		// load children (primitives or other node references)
		let children = nodeElement["children"];
		if (children == null) {
			console.error("in node ", id, ", a children node is required");
			throw new Error("in node ", id, ", a children node is required");
		}
		this.loadChildren(obj, children);
		obj.loaded = true;

		if (parentElement !== null) {
			this.data.addChildToNode(parentElement, obj);
		}
	}

	/**
	 * 
	 * @param {*} id the node id
	 * @param {*} lodElement the json lod element 
	 * @param {*} parentElement the parent element 
	 * @returns 
	 */
	loadLOD(id, lodElement, parentElement=null) {

		// get if node previously added (for instance because it was a child ref in other node)
		let obj = this.data.getLOD(id);
		if (obj !== null && obj.loaded) {
			return;
		}
		else {
			// otherwise add a new node
			obj = this.data.createEmptyLOD(id);
		}

		
		// load children (primitives or other node references)
		let lodNodes = lodElement["lodNodes"];
		if (lodNodes == null) {
			console.error("in node ", id, ", a lodNodes node is required");
			throw new Error("in node ", id, ", a lodNodes node is required");
		}

		for (let i = 0; i < lodNodes.length; i++) {
			let childId = lodNodes[i]["nodeId"];
			if (childId === null || childId === undefined) {
				console.error("node ", id, " has a lodNodes but not a nodeId");
				throw new Error("node ", id, " has a lodNodes but not a nodeId");
			}
			let mindist = lodNodes[i]["mindist"];
			if (mindist === null || mindist === undefined) {
				console.error("node ", id, " has a lodNodes but not a mindist");
				throw new Error("node ", id, " has a lodNodes but not a mindist");
			}

			// find node by id. if not present create a new one
			let node = this.data.getNode(childId)
			if (node == null) {
				// otherwise add a new node
				node = this.data.createEmptyNode(childId);		
			}

			// load the noderef
			this.loadNodeRef(node, childId);

			// add the child node to the lod object
			obj.children.push({ node: node, mindist: mindist });
		}
		obj.loaded = true;

		if (parentElement !== null) {
			this.data.addChildToNode(parentElement, obj);
		}
	}

	/**
	 * Load the transformations for a particular node element
	 * @param {*} obj the node object
	 * @param {*} transformsElement the transforms json element
	 * @returns 
	 */
	loadTransforms(obj, transformsElement) {
		for (let i in transformsElement) {
			const transform = transformsElement[i];
			const transformType = transform["type"];
			if (!["translate", "rotate", "scale"].includes(transformType)) {
				return "unrecognized transformation ", transformType, ".";
			}
			if (transformType == "translate") {
				let translate = this.getVector3(transform, "amount");
				// add a translation
				obj.transformations.push({ type: "T", translate: translate });
			}
			else if (transformType == "rotate") {
				let factor = this.getVector3(transform, "amount");
				// add a rotation
				obj.transformations.push({ type: "R", rotation: factor });
			}
			else if (transformType == "scale") {
				let factor = this.getVector3(transform, "amount");
				// add a scale
				obj.transformations.push({ type: "S", scale: factor });
			}
		}
	}

	/**
	 * Load the children for a particular node element
	 * @param {*} nodeObj the node object
	 * @param {*} childrenElement the json children element
	 */

	loadChildren(nodeObj, childrenElement) {
		for (let child in childrenElement) {
			let childElement = childrenElement[child];
			const nodeType = childElement["type"];

			if (child === "nodesList") {
				this.loadNodesList(nodeObj, childElement);
			}
			else if (child === "lodsList") {
				this.loadLodsList(nodeObj, childElement);
			}
			else if (this.data.primitiveIds.includes(nodeType)) {
				childElement["id"] = child;
				let primitiveObj = this.data.createEmptyPrimitive();
				this.loadPrimitive(childElement, primitiveObj, nodeType);
				this.data.addChildToNode(nodeObj, primitiveObj);
			}
			else if (this.data.lightIds.includes(nodeType)) {
				let lightObj = this.loadLight(child, childElement, nodeType)
				this.data.addChildToNode(nodeObj, lightObj)
			}
			else {
				console.error("unrecognized child type '", nodeType, "'.");
				throw new Error("unrecognized child type '", nodeType, "'.");
			}
		}
	}

	/**
	 * Loads a light object into a new object
	 * @param {*} elem 
	 * @returns object with the light data
	 */
	loadLight(id, elem, lightType) {
		const descriptor = this.data.descriptors[lightType];
		let obj = this.loadJsonItem({
			elem: elem,
			key: id,
			descriptor: descriptor,
			extras: [["type", lightType]]
		})
		return obj;
	}

	/**
	 * For a given primitive element, loads the available representations into the primitive object
	 * @param {json element} parentElem 
	 * @param {*} primitiveObj the primitive object to load data into
	 */
	loadPrimitive(parentElem, primitiveObj, primType) {
		const descriptor = this.data.descriptors[primType];

		if (primType === "cylinder") {
			console.log("cylinder: ", parentElem, "descriptor: ", descriptor);
		}

		const obj = this.loadJsonItem({
			key: parentElem.id,
			elem: parentElem,
			descriptor: descriptor,
			extras: [["type", "primitive"], ["subtype", primType]]
		})

		primitiveObj.subtype = primType;
		primitiveObj.representations.push(obj);

		return;
	}

	/**
	 * Load the nodesList element
	 * @param {*} id the node id
	 * @param {*} nodeElement the json node
	 * @returns
	 */
	loadNodesList(nodeObj, nodesList) {
		if (!Array.isArray(nodesList)) {
			console.error("nodesList for node ", id, " is not an array.");
			throw new Error("nodesList for node ", id, " is not an array.");
		}

		for (let i = 0; i < nodesList.length; i++) {
			let childId = nodesList[i];
			if (typeof childId !== "string") {
				console.error("nodesList for node ", id, " contains a non-string element.");
				throw new Error("nodesList for node ", id, " contains a non-string element.");
			}
			this.loadNodeRef(nodeObj, childId);
		}
	}

	/**
	 * Load a node reference in the graph element
	 * @param {*} nodeObj the json parent node
	 * @param {*} id the node id
	 * @returns
	 */
	loadLodsList(nodeObj, lodsList) {
		if (!Array.isArray(lodsList)) {
			console.error("lodsList for node ", id, " is not an array.");
			throw new Error("lodsList for node ", id, " is not an array.");
		}

		for (let i = 0; i < lodsList.length; i++) {
			let childId = lodsList[i];
			if (typeof childId !== "string") {
				console.error("lodsList for node ", id, " contains a non-string element.");
				throw new Error("lodsList for node ", id, " contains a non-string element.");
			}
			this.loadNodeRef(nodeObj, childId);
		}
	}

	/**
	 * Load a node reference in the graph element
	 * @param {*} nodeObj the json parent node
	 * @param {*} id the node id
	 * @returns
	 */
	loadNodeRef(nodeObj, id) {
		let elem = this.graphElement[id];
		if (elem == null) {
			console.error("node ", id, " not found in graph element.");
			throw new Error("node ", id, " not found in graph element.");
		}

		this.loadNode(id, elem, nodeObj);
	}
}

export { MyFileReader };
