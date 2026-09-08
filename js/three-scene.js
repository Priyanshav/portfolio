/* =========================================
   THREE.JS HERO 3D SCENE
   Floating wireframe geometry + particles
   ========================================= */

(function () {
  'use strict';

  // Wait for Three.js to load
  function waitForThree(cb) {
    if (window.THREE) { cb(); }
    else {
      var t = setInterval(function () {
        if (window.THREE) { clearInterval(t); cb(); }
      }, 50);
    }
  }

  waitForThree(function () {
    var THREE = window.THREE;
    var canvas = document.getElementById('three-hero');
    if (!canvas) return;

    /* ---- Renderer ---- */
    var renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.parentElement.offsetWidth, canvas.parentElement.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    /* ---- Scene + Camera ---- */
    var scene  = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(
      60,
      canvas.parentElement.offsetWidth / canvas.parentElement.offsetHeight,
      0.1,
      200
    );
    camera.position.set(0, 0, 18);

    /* ---- Materials ---- */
    var matCyan = new THREE.MeshBasicMaterial({
      color: 0x00f5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });

    var matPurple = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.28
    });

    var matPink = new THREE.MeshBasicMaterial({
      color: 0xf472b6,
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });

    /* ---- Main Geometries ---- */
    // Large icosahedron — hero centrepiece
    var icoGeo  = new THREE.IcosahedronGeometry(3.5, 1);
    var icoMesh = new THREE.Mesh(icoGeo, matCyan);
    icoMesh.position.set(5, 0, 0);
    scene.add(icoMesh);

    // Torus
    var torusGeo  = new THREE.TorusGeometry(2.2, 0.5, 10, 40);
    var torusMesh = new THREE.Mesh(torusGeo, matPurple);
    torusMesh.position.set(-6, 1.5, -3);
    torusMesh.rotation.x = Math.PI / 5;
    scene.add(torusMesh);

    // Octahedron
    var octaGeo  = new THREE.OctahedronGeometry(2, 0);
    var octaMesh = new THREE.Mesh(octaGeo, matPink);
    octaMesh.position.set(0, -4, -2);
    scene.add(octaMesh);

    // Small dodecahedron top-left
    var dodGeo  = new THREE.DodecahedronGeometry(1.2, 0);
    var dodMesh = new THREE.Mesh(dodGeo, matCyan);
    dodMesh.position.set(-4, 4, 1);
    scene.add(dodMesh);

    // Small tetrahedron
    var tetGeo  = new THREE.TetrahedronGeometry(1, 0);
    var tetMesh = new THREE.Mesh(tetGeo, matPurple);
    tetMesh.position.set(7, -2.5, -1);
    scene.add(tetMesh);

    /* ---- Particle Field ---- */
    var particleCount = 160;
    var positions = new Float32Array(particleCount * 3);
    var sizes     = new Float32Array(particleCount);

    for (var i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
      sizes[i] = Math.random() * 2.5 + 0.5;
    }

    var ptGeo = new THREE.BufferGeometry();
    ptGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    ptGeo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    var ptMat = new THREE.PointsMaterial({
      color: 0x00f5ff,
      size: 0.12,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    });

    var particles = new THREE.Points(ptGeo, ptMat);
    scene.add(particles);

    /* ---- Connecting Lines ---- */
    var lineMat = new THREE.LineBasicMaterial({
      color: 0x00f5ff,
      transparent: true,
      opacity: 0.08
    });

    var linePositions = [];
    var threshold = 8;

    for (var a = 0; a < particleCount; a++) {
      for (var b = a + 1; b < particleCount; b++) {
        var dx = positions[a*3]   - positions[b*3];
        var dy = positions[a*3+1] - positions[b*3+1];
        var dz = positions[a*3+2] - positions[b*3+2];
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < threshold) {
          linePositions.push(
            positions[a*3],   positions[a*3+1], positions[a*3+2],
            positions[b*3],   positions[b*3+1], positions[b*3+2]
          );
        }
      }
    }

    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    var lineSegs = new THREE.LineSegments(lineGeo, lineMat);
    scene.add(lineSegs);

    /* ---- Mouse tracking ---- */
    var mouse      = { x: 0, y: 0 };
    var targetRot  = { x: 0, y: 0 };
    var currentRot = { x: 0, y: 0 };

    window.addEventListener('mousemove', function (e) {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    /* ---- Resize ---- */
    window.addEventListener('resize', function () {
      var w = canvas.parentElement.offsetWidth;
      var h = canvas.parentElement.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });

    /* ---- Animation loop ---- */
    var clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      // Mouse parallax — smooth lerp
      targetRot.x  = mouse.y * 0.4;
      targetRot.y  = mouse.x * 0.6;
      currentRot.x += (targetRot.x - currentRot.x) * 0.04;
      currentRot.y += (targetRot.y - currentRot.y) * 0.04;
      scene.rotation.x = currentRot.x;
      scene.rotation.y = currentRot.y;

      // Geometry rotations
      icoMesh.rotation.x  = t * 0.22;
      icoMesh.rotation.y  = t * 0.15;
      icoMesh.rotation.z  = t * 0.08;

      torusMesh.rotation.x = t * 0.18;
      torusMesh.rotation.z = t * 0.12;

      octaMesh.rotation.x  = t * 0.25;
      octaMesh.rotation.y  = t * 0.20;

      dodMesh.rotation.y   = t * 0.30;
      dodMesh.rotation.z   = t * 0.15;

      tetMesh.rotation.x   = t * 0.28;
      tetMesh.rotation.z   = t * 0.22;

      // Gentle float
      icoMesh.position.y  = Math.sin(t * 0.6) * 0.5;
      torusMesh.position.y = 1.5 + Math.sin(t * 0.5 + 1) * 0.6;
      dodMesh.position.y   = 4   + Math.sin(t * 0.7 + 2) * 0.4;

      // Pulsing opacity
      matCyan.opacity   = 0.25 + Math.sin(t * 0.8) * 0.1;
      matPurple.opacity = 0.2  + Math.sin(t * 0.6 + 1) * 0.08;

      // Particle drift
      particles.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    }

    animate();
  });

})();
