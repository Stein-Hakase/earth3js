import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import starVertex from "./shaders/starVertex.glsl"
import starFragment from "./shaders/starFragment.glsl"

/**
 * Debug
 */
// const gui = new dat.GUI()

const parameters = {
    materialColor: '#ffeded'
}

// gui
//     .addColor(parameters, 'materialColor')

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Test cube
 */
// const cube = new THREE.Mesh(
//     new THREE.BoxGeometry(1, 1, 1),
//     new THREE.MeshBasicMaterial({ color: '#ff0000' })
// )
// scene.add(cube)

/**
 * LOAD EARTH
 */
const objLoader = new OBJLoader()
let earth = null
objLoader.load("./earth.obj",
    function (object) {
        // console.log("LAODED", object)
        earth = object
        earth.position.set(0, 0, 3.7)

        scene.add(object)

    },
    function (xhr) {
        let loaderPercent = xhr.loaded / xhr.total * 100
        if (loaderPercent < 100) {
            document.body.querySelector(".loaded").innerHTML = loaderPercent.toFixed(2) + '% loaded'
        } else {
            document.body.querySelector(".loader").classList.toggle('showLoader')
        }

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
)

/**
 * LIGHTS
 */
const amabiantLight = new THREE.AmbientLight("white", 0.5)
scene.add(amabiantLight)

const directionalLight = new THREE.DirectionalLight("white")
scene.add(directionalLight)
/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

    earth.updateMatrix()

})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6

scene.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * SHADERS PARICALES
 */
const particalGeometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32)
const particalMaterial = new THREE.RawShaderMaterial({
    vertexShader: starVertex,
    fragmentShader: starFragment,
    wireframe: true
})
const star = new THREE.Mesh(particalGeometry, particalMaterial)
scene.add(star)
/************ */
const scrollParams = {
    currentSection: 0,
    phase: 0,
    isScrolling: true,
    lastDisabledScroll: 0,
    oldScrollPosY: 0,
    direction: "bot",
    inViewSection: 0,
    travelledDistance: 0,
    globalScrollFactor: 0,
    lastScroll: 0
}
const earthParams = {
    infiniteRotation: true,
    scale: {
        duration: 0,
        x: 0,
        y: 0,
        z: 0
    },
    rotation: {
        x: 0,
        directionX: 'forward'
    },
    xPos: 0,
    yPos: 0,
    durationStick: 3
}

/**
 * WINDOW EVENTS LISTENER
 */

window.addEventListener("scroll", (event) => {

    scrollParams.lastScroll = Date.now()
    scrollParams.globalScrollFactor = window.scrollY / (sizes.height * 2)
    scrollParams.direction = window.scrollY > scrollParams.oldScrollPosY ? "bot" : "top"
    scrollParams.oldScrollPosY = window.scrollY
    const newSection = Math.round(window.scrollY / sizes.height)
    scrollParams.inViewSection = ((window.scrollY / sizes.height) - Math.floor(window.scrollY / sizes.height)).toFixed(3)
    scrollParams.currentSection = newSection

    // if (newSection) {
    // console.log(, newSection)
    let phaseValue = window.scrollY / sizes.height
    // console.log(phaseValue / 3)
    if (phaseValue < newSection - (1 / 6)) {
        scrollParams.phase = scrollParams.direction == "top" ? 3 : 1
        let distanceToNextSection = 0
    } else if (phaseValue <= newSection + (1 / 6)) {
        scrollParams.phase = 2
        earthParams.durationStick = 3
    } else {
        scrollParams.phase = scrollParams.direction == "top" ? 1 : 3

    }
    const currentSectionPos = (sizes.height * newSection)
    const nextSectionPos = (sizes.height * (newSection + 1))
    const currentScroll = window.scrollY + sizes.height / 2
    const travelledDistance = ((currentScroll - currentSectionPos) / (nextSectionPos - currentSectionPos))
    earthParams.xPos = travelledDistance
    // earthParams.xPos = (Math.sin(Math.PI * 2 * travelledDistance))
    // earthParams.xPos = Math.abs(Math.sin(Math.PI * (travelledDistance - 0.5))), travelledDistance
    // console.log(earthParams.xPos.toFixed(2))

    // console.log((sizes.height * newSection) + (sizes.height / 2), scrollParams.currentSection) 

    // console.log("SECTION : ", scrollParams.currentSection, " PHASE : ", scrollParams.phase, scrollParams.inViewSection)
    // }

    // console.log(travelledDistance)
    // console.log(camera.position.x)

})


/**
 * Animate
 */
// function rotateAboutPoint (obj, point, axis, theta, pointIsWorld) {
//     pointIsWorld = (pointIsWorld === undefined) ? false : pointIsWorld;

//     if (pointIsWorld) {
//         obj.parent.localToWorld(obj.position); // compensate for world coordinate
//     }

//     obj.position.sub(point); // remove the offset
//     obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
//     obj.position.add(point); // re-add the offset

//     if (pointIsWorld) {
//         obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
//     }

//     obj.rotateOnAxis(axis, theta); // rotate the OBJECT
// }
const clock = new THREE.Clock()
let time = Date.now()
const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    const currentTime = Date.now()
    const deltaTime = currentTime - time
    // let speed = 1
    // if (earth && earthParams.infiniteRotation) {
    //     earth.rotation.y = elapsedTime * speed

    // }
    if (earthParams.rotation.directionX === "forward") {
        earthParams.rotation.x += 0.001
    } else if (earthParams.rotation.directionX === "backward") {
        earthParams.rotation.x -= 0.001
    }

    if (earthParams.rotation.x >= 0.2) {
        earthParams.rotation.directionX = "backward"
    } else if (earthParams.rotation.x <= - 0.2) {
        earthParams.rotation.directionX = "forward"
    }
    // let scaleCoef = 1 + (1 * scrollParams.inViewSection)
    if (earth) {
        let offsetTransform = 0
        switch (scrollParams.phase) {
            case 1:

                // earth.scale.set(scaleCoef, scaleCoef, scaleCoef)
                // earth.position.x = 1 - scrollParams.inViewSection
                // console.log("entering", scrollParams.currentSection)
                // offsetTransform = scrollParams.inViewSection
                // if (earth.position.x > -2) {
                //     earth.position.x = - 2 * earthParams.xPos
                // }
                break;
            case 2:

                // earth.scale.set(scaleCoef, scaleCoef, scaleCoef)
                // earth.position.x = scrollParams.inViewSection - 0.5
                // disableWindowScroll()

                // if (earthParams.durationStick <= 0) {
                //     console.log("enabled")
                //     enableWindowScroll()
                // }
                // earthParams.durationStick -= 0.1


                break;
            case 3:
                // earth.scale.set(scaleCoef, scaleCoef, scaleCoef)
                // earth.position.x = -scrollParams.inViewSection
                // earth.position.x = scrollParams.inViewSection - 1
                // console.log("outing", scrollParams.currentSection)
                // earth.position.x += 0.1
                // if (earth.position.x < 2) {
                //     earth.position.x = 2 * earthParams.xPos
                // }
                break;
            default:
                break;
        }
        /**
         * earth animation 1
         * earth.position.x = scrollParams.currentSection % 2 === 0 ? earthParams.xPos : - earthParams.xPos
         * earth.position.z = earthParams.xPos
         * earth.scale.set(earthParams.xPos * 1.5, earthParams.xPos * 1.5, earthParams.xPos * 1.5)
         * earth.rotation.y = elapsedTime * speed * earthParams.xPos * 2
         */
        earth.rotation.x = earthParams.rotation.x
        earth.rotation.y = Math.cos(Math.PI * scrollParams.globalScrollFactor) * 6
        earth.children.forEach((mesh) => {
            switch (mesh.name) {
                case "Mundo_Tierra":
                    mesh.material.color = new THREE.Color(1, 1, 1)
                    break;

                default:
                    mesh.material.color = new THREE.Color(scrollParams.globalScrollFactor * 0.1, scrollParams.globalScrollFactor * 0.1, scrollParams.globalScrollFactor)

                    break;
            }
        });
        camera.position.x = (Math.sin(Math.PI * scrollParams.globalScrollFactor)) * -1
        camera.position.y = Math.sin(Math.PI * scrollParams.globalScrollFactor) * 0.8
        camera.position.z = 6 + (4 * (scrollParams.globalScrollFactor))


    }
    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()