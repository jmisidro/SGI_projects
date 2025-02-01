import * as THREE from 'three';
import { MyTexturesLoader } from './MyTexturesLoader.js';

class MyMaterialsLoader {
  constructor() {
    this.textureLoader = new MyTexturesLoader();
  }

  getMaterials(materialsData, textureMap) {
    const materialMap = new Map();

    for (const key in materialsData) {
      const data = materialsData[key];
      const material = new Map();

      this.setCommonMaterialProperties(material, data);
      this.applyTextures(material, data, textureMap);

      materialMap.set(data.id, material);
    }
    return materialMap;
  }

  setCommonMaterialProperties(material, data) {
    material.set("color", data.color);
    material.set("specular", data.specular);
    material.set("shininess", data.shininess);
    material.set("emissive", data.emissive);
    material.set("transparent", data.transparent ?? false);
    material.set("opacity", data.opacity ?? 1);
    material.set("wireframe", data.wireframe ?? false);
    material.set("flatShading", data.shading ?? false);
    material.set("twosided", data.twosided ?? false);
    material.set("castshadow", data.castshadow ?? false);
    material.set("receiveshadow", data.castshadow ?? false);
    material.set("name", data.id ?? false);
  }

  applyTextures(material, data, textureMap) {
    if (textureMap.has(data.textureref)) {
      const textureInfo = textureMap.get(data.textureref);
      material.set("textureInfo", textureInfo);
      material.set("textureS", data.texlength_s ?? 1);
      material.set("textureT", data.texlength_t ?? 1);
    }

    if (textureMap.has(data.bumpref)) {
      const bumpInfo = textureMap.get(data.bumpref);
      material.set("bumpInfo", bumpInfo);
      material.set("bumpScale", data.bumpscale ?? 0);
    }

    if (textureMap.has(data.specularref)) {
      const specularInfo = textureMap.get(data.specularref);
      material.set("specularInfo", specularInfo);
    }
  }

  create(materialInfo, sizeX = 1, sizeY = 1) {
    const material = this.createBaseMaterial(materialInfo);

    this.addTexture(material, materialInfo, sizeX, sizeY);
    this.addBumpTexture(material, materialInfo, sizeX, sizeY);
    this.addSpecularTexture(material, materialInfo, sizeX, sizeY);



    return material;
  }

  createBaseMaterial(materialInfo) {
    
    return new THREE.MeshPhongMaterial({
      color: new THREE.Color(...materialInfo.get("color")),
      specular: new THREE.Color(...materialInfo.get("specular")),
      shininess: materialInfo.get("shininess"),
      emissive: new THREE.Color(...materialInfo.get("emissive")),
      transparent: materialInfo.get("transparent") ? true : false,
      opacity: materialInfo.get("opacity") ? materialInfo.get("opacity") : 1,
      wireframe: materialInfo.get("wireframe"),
      side: materialInfo.get("twosided") ? THREE.DoubleSide : THREE.FrontSide,
      shadowSide: THREE.BackSide,
      name: materialInfo.get("name"),
    });
  }

  addTexture(material, materialInfo, sizeX, sizeY) {
    const textureInfo = materialInfo.get("textureInfo");
    if (textureInfo) {
      material.map = this.createTexture(textureInfo);
      material.map.wrapS = THREE.RepeatWrapping;
      material.map.wrapT = THREE.RepeatWrapping;
      material.map.repeat.set(sizeX / materialInfo.get("textureS") || 1, sizeY / materialInfo.get("textureT") || 1);

      if (!textureInfo.isVideo)  // video textures don't have mipmaps
        this.addMipmaps(material, textureInfo);
    }
  }

  createTexture(textureInfo) {
    const isVideo = textureInfo.isVideo;

    if (!isVideo) {
      return this.textureLoader.create(textureInfo);
    } 
    else {
      const video = document.createElement('video');
      video.id = textureInfo.id;
      video.src = textureInfo.filepath;
      video.loop = true;
      video.muted = true;
      video.style.display = 'none';

      video.addEventListener('loadeddata', () => {
        video.play();
      });

      document.body.appendChild(video);
      const videoTexture = new THREE.VideoTexture(video);
      videoTexture.colorSpace = THREE.SRGBColorSpace;
      return videoTexture;
    }
  }

  addMipmaps(material, textureInfo) {
    const mipmaps = textureInfo?.mipmaps;
    if (mipmaps) {
      material.map.generateMipmaps = false;
      for (const key of mipmaps.keys()) {
        this.textureLoader.loadMipmap(material.map, key, mipmaps.get(key));
      }
    } else {
      material.map.generateMipmaps = true;
      material.map.minFilter = THREE.LinearMipMapLinearFilter;
      material.map.magFilter = THREE.NearestFilter;
    }
  }

  addBumpTexture(material, materialInfo, sizeX, sizeY) {
    if (materialInfo.has("bumpInfo")) {
      const bumpInfo = materialInfo.get("bumpInfo");
      material.bumpMap = this.textureLoader.create(bumpInfo);
      material.bumpMap.wrapS = THREE.RepeatWrapping;
      material.bumpMap.wrapT = THREE.RepeatWrapping;
      material.bumpMap.repeat.set(sizeX / materialInfo.get("textureS") || 1, sizeY / materialInfo.get("textureT") || 1);
      material.bumpScale = materialInfo.get("bumpScale") ?? 0;
    }
  }

  addSpecularTexture(material, materialInfo, sizeX, sizeY) {
    if (materialInfo.has("specularInfo")) {
      const specularInfo = materialInfo.get("specularInfo");
      material.specularMap = this.textureLoader.create(specularInfo);
      material.specularMap.wrapS = THREE.RepeatWrapping;
      material.specularMap.wrapT = THREE.RepeatWrapping;
      material.specularMap.repeat.set(sizeX / materialInfo.get("textureS") || 1, sizeY / materialInfo.get("textureT") || 1);
    }
  }
}

export { MyMaterialsLoader};
