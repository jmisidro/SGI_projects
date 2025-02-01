import { MyObject } from './MyObject.js';

class MyRoute extends MyObject {
    constructor(object, keyframes = [], initialPosition = null) {
        super(object.name);
        this.object = object;
        this.keyframes = keyframes;
        this.initialPosition = initialPosition;
    }
}

export { MyRoute };
