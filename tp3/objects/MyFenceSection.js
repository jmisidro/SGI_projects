import * as THREE from 'three';

class MyFenceSection {
    
    constructor(length = 50, height = 10, boardSpacing = 1.5, postSpacing = 10, scale = 1) {
        this.length = length * scale;
        this.height = height * scale;
        this.boardSpacing = boardSpacing * scale; 
        this.postSpacing = postSpacing * scale; 
        this.scale = scale;
    

        this.object = new THREE.Group();
    
        const horizontalBoardMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const verticalPostMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
    
        this.addHorizontalBoards(horizontalBoardMaterial);
    
        this.addVerticalPosts(verticalPostMaterial);
    }
    
    addHorizontalBoards(material) {
        const boardHeight = 0.5 * this.scale; 
        const boardDepth = 0.3 * this.scale; 
        const numBoards = 3;

        for (let i = 0; i < numBoards; i++) {
            const board = new THREE.Mesh(
                new THREE.BoxGeometry(this.length, boardHeight, boardDepth),
                material
            );

            const boardOffset = -i * (boardHeight + this.boardSpacing);
            board.position.set(0, this.height / 2 + boardOffset - 0.5 * this.scale, 0); // Offset from post top
            this.object.add(board);
        }
    }


    addVerticalPosts(material) {
        const postWidth = 0.7 * this.scale; 
        const postDepth = 0.7 * this.scale; 

        for (let i = -this.length / 2; i <= this.length / 2; i += this.postSpacing) {
            const post = new THREE.Mesh(
                new THREE.BoxGeometry(postWidth, this.height, postDepth),
                material
            );

            // Position the posts along the length of the fence
            post.position.set(i, 0, 0);
            this.object.add(post);
        }
    }
}

export { MyFenceSection };
