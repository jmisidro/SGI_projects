class MySceneData {

  constructor() {
    this.globals = null;
    this.fog = null;
    this.skybox = null;

    this.materials = []
    this.lights = [];
    this.textures = [];

    this.cameras = [];
    this.activeCameraId = null;

    this.nodes = [];
    this.lods = [];
    this.rootId = null;

    this.descriptors = [];
    this.typeDescriptors = [];

    this.customAttributeName = "custom"

    this.descriptors["globals"] = [
      { name: "background", type: "rgb" },
      { name: "ambient", type: "rgb" },
      { name: "fog", type: "fog" },
      { name: "skybox", type: "skybox" },
    ]

    this.descriptors["fog"] = [
      { name: "color", type: "rgb" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
    ]

    this.descriptors["texture"] = [
      { name: "id", type: "string" },
      { name: "filepath", type: "string" },
      { name: "isVideo", type: "boolean", required: false, default: false },
      { name: "mipmap0", type: "string", required: false, default: "" },
      { name: "mipmap1", type: "string", required: false, default: "" },
      { name: "mipmap2", type: "string", required: false, default: "" },
      { name: "mipmap3", type: "string", required: false, default: "" },
      { name: "mipmap4", type: "string", required: false, default: "" },
      { name: "mipmap5", type: "string", required: false, default: "" },
      { name: "mipmap6", type: "string", required: false, default: "" },
      { name: "mipmap7", type: "string", required: false, default: "" },
    ]


    this.descriptors["material"] = [
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "specular", type: "rgb" },
      { name: "emissive", type: "rgb" },
      { name: "shininess", type: "float" },
      { name: "transparent", type: "boolean", required: false, default: false },
      { name: "opacity", type: "float", required: false, default: 1.0 },
      { name: "wireframe", type: "boolean", required: false, default: false },
      { name: "shading", type: "boolean", required: false, default: false }, // false: smooth (default), true: flat
      { name: "textureref", type: "string", required: false, default: null }, // The color map. May optionally include an alpha channel. The texture map color is modulated by the diffuse color. Default null.
      { name: "texlength_s", type: "float", required: false, default: 1.0 },
      { name: "texlength_t", type: "float", required: false, default: 1.0 },
      { name: "twosided", type: "boolean", required: false, default: false },
      { name: "bumpref", type: "string", required: false, default: null }, // bump map is to be used in later classes
      { name: "bumpscale", type: "float", required: false, default: 1.0 },
      { name: "specularref", type: "string", required: false, default: null }, // bump map is to be used in later classes
      { name: "specularscale", type: "float", required: false, default: 1.0 },
    ]

    this.descriptors["orthogonal"] = [
      { name: "id", type: "string" },
      { name: "type", type: "string" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
      { name: "location", type: "vector3" },
      { name: "target", type: "vector3" },
      { name: "left", type: "float" },
      { name: "right", type: "float" },
      { name: "bottom", type: "float" },
      { name: "top", type: "float" },
    ]

    this.descriptors["perspective"] = [
      { name: "id", type: "string" },
      { name: "type", type: "string" },
      { name: "angle", type: "float" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
      { name: "location", type: "vector3" },
      { name: "target", type: "vector3" }
    ]

    this.descriptors["cylinder"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "base", type: "float" },
      { name: "top", type: "float" },
      { name: "height", type: "float" },
      { name: "slices", type: "integer" },
      { name: "stacks", type: "integer" },
      { name: "capsclose", type: "boolean", required: false, default: false },
      { name: "thetastart", type: "float", required: false, default: 0.0 },
      { name: "thetalength", type: "float", required: false, default: 2 * Math.PI },
      { name: "distance", type: "float", required: false, default: 0.0 }, // The distance at which to display this level of detail. Default 0.0.  
    ]

    /*
        In the following primitives, distance is to be used with LODs (later classes)
    */
    this.descriptors["rectangle"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "xy1", type: "vector2" },
      { name: "xy2", type: "vector2" },
      { name: "parts_x", type: "integer", required: false, default: 1 },
      { name: "parts_y", type: "integer", required: false, default: 1 },
    ]

    this.descriptors["triangle"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "xyz1", type: "vector3" },
      { name: "xyz2", type: "vector3" },
      { name: "xyz3", type: "vector3" },
    ]

    this.descriptors["sphere"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "radius", type: "float" },
      { name: "slices", type: "integer" },
      { name: "stacks", type: "integer" },
      { name: "thetastart", type: "float", required: false, default: 0.0 },
      { name: "thetalength", type: "float", required: false, default: 2 * Math.PI },
      { name: "phistart", type: "float", required: false, default: 0.0 },
      { name: "philength", type: "float", required: false, default: 2 * Math.PI },
    ]

    this.descriptors["box"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "xyz1", type: "vector3" },
      { name: "xyz2", type: "vector3" },
      { name: "parts_x", type: "integer", required: false, default: 1 },
      { name: "parts_y", type: "integer", required: false, default: 1 },
      { name: "parts_z", type: "integer", required: false, default: 1 },
    ]


    this.descriptors["nurbs"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "degree_u", type: "integer" },
      { name: "degree_v", type: "integer" },
      { name: "parts_u", type: "integer" },
      { name: "parts_v", type: "integer" },
      { name: "controlpoints", type: "list", listOf: "controlpoint" },
    ]

    this.descriptors["controlpoint"] = [
      { name: "x", type: "float" },
      { name: "y", type: "float" },
      { name: "z", type: "float" },
    ]

    this.descriptors["skybox"] = [
      { name: "size", type: "vector3" },
      { name: "center", type: "vector3" },
      { name: "emissive", type: "rgb" },
      { name: "intensity", type: "float" },
      { name: "front", type: "string" },
      { name: "back", type: "string" },
      { name: "up", type: "string" },
      { name: "down", type: "string" },
      { name: "left", type: "string" },
      { name: "right", type: "string" },
    ]

    this.descriptors["polygon"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "radius", type: "float" },
      { name: "stacks", type: "integer" },
      { name: "slices", type: "integer" },
      { name: "color_c", type: "rgb" },
      { name: "color_p", type: "rgb" },
    ]

    this.descriptors["spotlight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "target", type: "vector3" },
      { name: "angle", type: "float" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "distance", type: "float", required: false, default: 1000 },
      { name: "decay", type: "float", required: false, default: 2.0 },
      { name: "penumbra", type: "float", required: false, default: 1.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 },
    ]

    this.descriptors["pointlight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "distance", type: "float", required: false, default: 1000 },
      { name: "decay", type: "float", required: false, default: 2.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 },
    ]

    this.descriptors["directionallight"] = [
      { name: "type", type: "string" },
      { name: "id", type: "string" },
      { name: "color", type: "rgb" },
      { name: "position", type: "vector3" },
      { name: "enabled", type: "boolean", required: false, default: true },
      { name: "intensity", type: "float", required: false, default: 1.0 },
      { name: "castshadow", type: "boolean", required: false, default: false },
      { name: "shadowleft", type: "float", required: false, default: -5.0 },
      { name: "shadowright", type: "float", required: false, default: 5.0 },
      { name: "shadowbottom", type: "float", required: false, default: -5.0 },
      { name: "shadowtop", type: "float", required: false, default: 5.0 },
      { name: "shadowfar", type: "float", required: false, default: 500.0 },
      { name: "shadowmapsize", type: "integer", required: false, default: 512 },
    ]

    this.typeDescriptors['rgb'] = [
      { name: "r", type: "float" },
      { name: "g", type: "float" },
      { name: "b", type: "float" },
    ]

    this.typeDescriptors['vector3'] = [
      { name: "x", type: "float" },
      { name: "y", type: "float" },
      { name: "z", type: "float" },
    ]

    this.typeDescriptors['vector2'] = [
      { name: "x", type: "float" },
      { name: "y", type: "float" },
    ]

    this.typeDescriptors['fog'] = [
      { name: "color", type: "rgb" },
      { name: "near", type: "float" },
      { name: "far", type: "float" },
      { name: "type", type: "string" },
    ]

    this.typeDescriptors['skybox'] = [
      { name: "size", type: "vector3" },
      { name: "center", type: "vector3" },
      { name: "emissive", type: "rgb" },
      { name: "intensity", type: "float" },
      { name: "front", type: "string" },
      { name: "back", type: "string" },
      { name: "up", type: "string" },
      { name: "down", type: "string" },
      { name: "left", type: "string" },
      { name: "right", type: "string" },
    ]

    this.primaryNodeIds = ["globals", "fog", "textures", "materials", "cameras", "graph"]

    this.primitiveIds = ["rectangle", "triangle", "box", "cylinder", "sphere", "nurbs", "polygon"]

    this.lightIds = ["spotlight", "pointlight", "directionallight"]
  }

  createCustomAttributeIfNotExists(obj) {
    if (obj[this.customAttributeName] === undefined || obj[this.customAttributeName] === null) obj[this.customAttributeName] = {}
  }

  setGlobals(globals) {
    this.globals = globals;
    this.createCustomAttributeIfNotExists(globals)
  }

  getGlobals() {
    return this.globals;
  }

  setFog(fog) {
    this.fog = fog;
    this.createCustomAttributeIfNotExists(fog)
    // console.debug("added fog " + JSON.stringify(fog));
  }

  getFog() {
    return this.fog;
  }

  setSkybox(skybox) {
    this.skybox = skybox;
    this.createCustomAttributeIfNotExists(skybox)
    // console.debug("added skybox " + JSON.stringify(skybox));
  }

  getSkybox() {
    return this.skybox;
  }
  
  setRootId(rootId) {
    // console.debug("set graph root id to '" + rootId + "'");
    this.rootId = rootId;
  }

  getMaterial(id) {
    let value = this.materials[id]
    if (value === undefined) return null
    return value
  }

  addMaterial(material) {
    let obj = this.getMaterial(material.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a material with id " + material.id + " already exists!");
    }
    this.materials.push(material)
    this.createCustomAttributeIfNotExists(material)
    // console.debug("added material " + JSON.stringify(material));
  };

  addTexture(texture) {
    let obj = this.getTexture(texture.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a texture with id " + texture.id + " already exists!");
    }
    this.textures.push(texture)
    this.createCustomAttributeIfNotExists(texture)
    // console.debug("added texture" + JSON.stringify(texture))
  };

  getTexture(id) {
    let value = this.textures[id]
    if (value === undefined) return null
    return value
  };

  setActiveCameraId(id) {
    // console.debug("set active camera id to '" + id + "'");
    return this.activeCameraId = id;
  }

  getCamera(id) {
    let value = this.cameras[id]
    if (value === undefined) return null
    return value
  };

  setActiveCamera(id) {
    this.activeCameraId = id;
  }

  addCamera(camera) {
    if (camera.type !== "orthogonal" && camera.type !== "perspective") {
      throw new Error("inconsistency: unsupported camera type " + camera.type + "!");
    }

    let obj = this.getCamera(camera.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a camera with id " + camera.id + " already exists!");
    }
    this.cameras.push(camera)
    this.createCustomAttributeIfNotExists(camera)
    // console.debug("added camera " + JSON.stringify(camera))
  }

  getLight(id) {
    let value = this.lights[id]
    if (value === undefined) return null
    return value
  }

  addLight(light) {
    var obj = this.getLight(light.id);
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a light with id " + light.id + " already exists!");
    }
    this.lights.push(light)
    this.createCustomAttributeIfNotExists(light)
    // console.debug("added light " + JSON.stringify(light));
  }

  getNode(id) {
    let value = this.nodes[id];
    if (value === undefined) return null
    return value
  }

  createEmptyNode(id) {
    let obj = this.getNode(id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a node with id " + id + " already exists!");
    }

    obj = { id: id, transformations: [], materialIds: [], children: [], castShadows: false, receiveShadows: false, loaded: false, type: "node" };
    this.addNode(obj);
    return obj;
  }


  addNode(node) {
    let obj = this.getNode(node.id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a node with id " + node.id + " already exists!");
    }
    this.nodes.push(node)
    this.createCustomAttributeIfNotExists(node)
    // console.debug("added node " + JSON.stringify(node));
  };

  addChildToNode(node, child) {

    if (child === undefined) {
      throw new Error("inconsistency: undefined child add to node!");
    }

    if (node.children === undefined) {
      throw new Error("inconsistency: a node has an undefined array of children!");
    }
    node.children.push(child)
    this.createCustomAttributeIfNotExists(child)
    // console.debug("added node child" + JSON.stringify(child));
  }

  getLOD(id) {
    let value = this.lods[id]
    if (value === undefined) return null
    return value
  }

  createEmptyLOD(id) {
    let obj = this.getLOD(id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a lod with id " + id + " already exists!");
    }

    obj = { id: id, transformations: [], materialIds: [], children: [], loaded: false, type: "lod" };
    this.addLOD(obj);
    return obj;
  }

  addLOD(lod) {
    let obj = this.getLOD(lod.id)
    if (obj !== null && obj !== undefined) {
      throw new Error("inconsistency: a lod with id " + lod.id + " already exists!");
    }
    this.lods.push(lod)
    this.createCustomAttributeIfNotExists(lod)
    // console.debug("added lod " + JSON.stringify(lod));
  }

  createEmptyPrimitive() {
    let obj = { type: "primitive", subtype: null, representations: [], loaded: false }
    return obj
  }

  onLoadFinished(app, contents) {
    console.info("------------------ consolidating data structures ------------------");

    // console.debug("consolidating materials...");
    // TODO: check material refs and replace with material objects

    // console.debug("consolidating scene graph root...");
    // TODO: check root not null and root exists

    // console.debug("consolidating camera...");
    // TODO: check active camera not null and exists

    // TODO: continue consolidation checks
  }
}
export { MySceneData };

