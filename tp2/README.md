# SGI 2024/2025 - TP2

## Group T04G10
| Name             | Number    | E-Mail             | Work Distribution |
| ---------------- | --------- | ------------------ | --------- |
| José Isidro         | 202006485 | up202006485@up.pt                | 65% |
| Bruno Machado         | 201907715 | up201907715@up.pt                | 35% |


## Project Information

The objective of this project is to create a 3D Graphics Application, equipped with a graphics engine  that produces THREE.js scenes from a JSON file with the provided YASF (Yet Another Scene Format) specification.

<p align="center">
    <img src="screenshots/project.png">
    <p align="center">Figure 1: Project Overview</p>
</p>

## Topics

- [Code Organization](#code-organization)
- [Controls](#controls)
- [Scene](#scene)
- [Advanced Textures](#advanced-textures)
- [Level of Detail (LOD)](#level-of-detail-lod)
- [Issues and Problems](#issuesproblems)


----

## Code Organization

For the sake of organization, we have created 3 main folders: a `parser` folder, with our parser, MyFileReader, that reads and parses the scene json file; a `loaders` folder, with all of the loaders for the various components of our scene, from cameras and textures to objects and lights and finally an `objects` folder that contains the code for our base object classes.

These objects are the declared in the `constructor` of MyContents.js and are  initialized and added to the scene in the `init` method.

---

## Controls

In order to customize the scene, we've developed a comprehensive control section for the user to modify the scene.

<p align="center">
    <img src="screenshots/controls1.png" width="200px" >
    <img src="screenshots/controls2.png" width="200px" >
</p>
<p align="center">
    <span>Figure 2: Controls - Main & Camera</span>
    <span>Figure 3: Controls - Objects</span>
</p>

<p align="center">
    <img src="screenshots/controls3.png" width="200px" >
    <img src="screenshots/controls4.png" width="200px" >
</p>
<p align="center">
    <span>Figure 4: Controls - Lights</span>
    <span>Figure 5: Controls - Materials</span>
</p>

---

## Scene

Below, we'll illustrate a few examples of the use of all of the various primitives. These are not exclusive.

**Rectangle**

The rectangle primitive is used in our placard object.

<p align="center">
    <img src="screenshots/rectangleprim.png" >
    <p align="center">Figure 6: Primitives - Rectangle</p>
</p>

**Triangle**

The triangle primitive is used in the roof of our cabin (front and back).

<p align="center">
    <img src="screenshots/triangleprim.png" >
    <p align="center">Figure 7: Primitives - Triangle</p>
</p>

**Box**

The box primitive is used in the presents, in the main strutucture of the house and also in the chair seat.

<p align="center">
    <img src="screenshots/boxprim.png" >
    <p align="center">Figure 8: Primitives - Box</p>
</p>


**Cylinder**

The cylinder primitive is used in the tree trunk.

<p align="center">
    <img src="screenshots/cylinderprim.png" >
    <p align="center">Figure 9: Primitives - Cylinder</p>
</p>

**Sphere**

The sphere primitive is used in the snowman body.

<p align="center">
    <img src="screenshots/sphereprim.png" >
    <p align="center">Figure 10: Primitives - Sphere</p>
</p>

**Nurbs**

The nurbs primitive is used in the tree decoration.

<p align="center">
    <img src="screenshots/nurb&polygonprim.png" >
    <p align="center">Figure 11: Primitives - Nurbs</p>
</p>

**Buffer Geomtry (Polygon)**

The polygon primitive is also used in the tree decoration, creating blue pentagons.

<p align="center">
    <img src="screenshots/nurb&polygonprim.png" >
    <p align="center">Figure 12: Primitives - Polygon</p>
</p>

----

### Advanced Textures

We have implemented each and every new technique required for this work.

**Skybox**

<p align="center">
    <img src="screenshots/skybox.png" >
    <p align="center">Figure 13: Skybox</p>
</p>

**Mipmaps**

Although not noticeable, mipmaps are being used in our christmas balls decorating the tree. For all other textures that don't specify their own mipmaps, our loaders generate them automatically.

**Bump Maps**

<p align="center">
    <img src="screenshots/snow.png" >
    <p align="center">Figure 14: Bump Map (Snow)</p>
</p>

**Video Textures**

<p align="center">
    <img src="screenshots/water.gif" >
    <p align="center">Figure 15: Video Texture (River)</p>
</p>


----

### Level of Detail (LOD)

We have a created a LOD for our cabin for the purpose of this demonstration. Below, you can observe the 3 levels of detail for the cabin.

<p align="center">
    <img src="screenshots/cabin_lod1.png" >
    <img src="screenshots/cabin_lod2.png" >
    <img src="screenshots/cabin_lod3.png" >
</p>

<p align="center">Figure 16: Level of Detail - Cabin</p>

---- 

## Issues/Problems

We had no major issues with this project and we believe we have accomplished all the requirements, through the creation of this beautiful christmas scene.



