

document.ontouchmove = function (e) {
	e.preventDefault();
  }
  
  // Enable scrolling.
  document.ontouchmove = function (e) {
	return false;
  }
//////////////////////////////////////////////////////////////////////////////////
	//		Init
	//////////////////////////////////////////////////////////////////////////////////

	// init renderer
	var renderer	= new THREE.WebGLRenderer({
		antialias: true,
		alpha: true
	});
	renderer.setClearColor(new THREE.Color('lightgrey'), 0)
	renderer.setSize( 640, 480 );
	renderer.domElement.style.position = 'fixed'
	renderer.domElement.style.top = '0px'
	renderer.domElement.style.left = '0px'
	document.body.appendChild( renderer.domElement );

	// array of functions for the rendering loop
	var onRenderFcts= [];
	var mixers = [];

	// init scene and camera
	var scene	= new THREE.Scene();
		
	//////////////////////////////////////////////////////////////////////////////////
	//		Initialize a basic camera
	//////////////////////////////////////////////////////////////////////////////////

	// Create a camera
	var camera = new THREE.Camera();
	scene.add(camera);

	////////////////////////////////////////////////////////////////////////////////
	//          handle arToolkitSource
	////////////////////////////////////////////////////////////////////////////////

	var arToolkitSource = new THREEx.ArToolkitSource({
		// to read from the webcam 
		sourceType : 'webcam',
		
		// // to read from an image
		// sourceType : 'image',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',		

		// to read from a video
		// sourceType : 'video',
		// sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',		
	})

	arToolkitSource.init(function onReady(){
		onResize()
	})
	
	// handle resize
	window.addEventListener('resize', function(){
		onResize()
	})
	function onResize(){
		arToolkitSource.onResize()	
		arToolkitSource.copySizeTo(renderer.domElement)	
		if( arToolkitContext.arController !== null ){
			arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)	
		}	
	}
	////////////////////////////////////////////////////////////////////////////////
	//          initialize arToolkitContext
	////////////////////////////////////////////////////////////////////////////////
	

	// create atToolkitContext
	var arToolkitContext = new THREEx.ArToolkitContext({
		cameraParametersUrl:  'camera_para.dat',
		detectionMode: 'mono',
	})
	// initialize it
	arToolkitContext.init(function onCompleted(){
		// copy projection matrix to camera
		camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
	})

    var firstSight = true;
	scene.visible = false;
	
	// update artoolkit on every frame
	onRenderFcts.push(function(){
		if( arToolkitSource.ready === false )	return

		arToolkitContext.update( arToolkitSource.domElement )
		
		// update scene.visible if the marker is seen
         if(firstSight){
            if(camera.visible){
               firstSight = false;
                scene.visible = true;
                 $( "#marker_hint" ).fadeOut(1000);
            }
        }
		//scene.visible = camera.visible
	})
		
	////////////////////////////////////////////////////////////////////////////////
	//          Create a ArMarkerControls
	////////////////////////////////////////////////////////////////////////////////
	
	// init controls for camera
	var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
		type : 'pattern',
		patternUrl :  'pattern-marker.patt',
		// patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
		// as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
		changeMatrixMode: 'cameraTransformMatrix'
	})
	// as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
	scene.visible = false

	//////////////////////////////////////////////////////////////////////////////////
	//		add an object in the scene
	//////////////////////////////////////////////////////////////////////////////////

	// add a torus knot	
	var preloadMesh1;
	var preloadMesh2;
	{
		var geometry	= new THREE.CubeGeometry(1,1,1);
		var material	= new THREE.MeshNormalMaterial({
			transparent : true,
			opacity: 0.5,
			side: THREE.DoubleSide
		}); 
		preloadMesh1	= new THREE.Mesh( geometry, material );
		preloadMesh1.position.y	= geometry.parameters.height/2
		scene.add( preloadMesh1 );
		
		var geometry	= new THREE.TorusKnotGeometry(0.3,0.1,64,16);
		var material	= new THREE.MeshNormalMaterial(); 
		preloadMesh2	= new THREE.Mesh( geometry, material );
		preloadMesh2.position.y	= 0.5
		scene.add( preloadMesh2 );
		
		onRenderFcts.push(function(delta){
			preloadMesh2.rotation.x += Math.PI*delta
		})
	}

	//////////////////////////////////////////////////////////////////////////////////
	//		render the whole thing on the page
	//////////////////////////////////////////////////////////////////////////////////

	// render the scene
	onRenderFcts.push(function(){
		renderer.render( scene, camera );
	})

	// run the rendering loop
	var lastTimeMsec= null
	requestAnimationFrame(function animate(nowMsec){
		// keep looping
		requestAnimationFrame( animate );
		// measure time
		lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
		var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
		lastTimeMsec	= nowMsec
		// call each update function
		onRenderFcts.forEach(function(onRenderFct){
			onRenderFct(deltaMsec/1000, nowMsec/1000)
		})
		mixers.forEach(function(mixer){
			mixer.update( deltaMsec/1000 );
		});
	})

	
	function createSugar(material){

		
		var geometry	= new THREE.CubeGeometry(0.15,0.15,0.15);
		var sugar	= new THREE.Mesh( geometry, material );
		sugar.name = "sugar"
		scene.add( sugar );
		return sugar;
	}
	
	var lightblubBrokenSource;
	var lightblubSource;
	var spineNode;
	var backNode;
	var spineNodeRotation;
	var backNodeRotation;
	var rod1Node;
	var rod2Node;
	var rod3Node;
	var ripple;
	
		var gameTime = 0;
		var onBaitTime = 1;
		var idleTime=0;
		var fishingTime = 0;
		var hintPoint = new THREE.Object3D();
		hintPoint.position.set(0,1.5,0);
		scene.add(hintPoint);
		function gameLoop(delta){

			if(!scene.visible )return;
			gameTime+=delta;
			if(onBaitTime>0){
				rod2Node.rotation.set(0,(30+Math.sin(gameTime*50)*10)/180*3.14,0);
				rod3Node.rotation.set(0,(30+Math.sin(gameTime*50)*10)/180*3.14,0);
				onBaitTime-=delta;
				if(onBaitTime<=0){
					idleTime = 3+Math.random()*5;
				}
				$("#tap_hint").show();
			}else{
				rod2Node.rotation.set(0,0,0);
				rod3Node.rotation.set(0,0,0);
				$("#tap_hint").hide();
			}
			if(idleTime>0){
				idleTime-=delta;
				if(fishingTime>0){
					fishingTime-=delta;
					spineNode.rotation.set(spineNodeRotation.x,spineNodeRotation.y-fishingTime*.3,spineNodeRotation.z);
					backNode.rotation.set(backNodeRotation.x,backNodeRotation.y,backNodeRotation.z-fishingTime*.3);
			
				}else{
					spineNode.rotation.set(spineNodeRotation.x,spineNodeRotation.y,spineNodeRotation.z-Math.sin(gameTime*1.5)*.1);
					backNode.rotation.set(backNodeRotation.x,backNodeRotation.y+Math.sin(gameTime*1.5)*.1,backNodeRotation.z);
			
				}
				if(idleTime<=0){
					onBaitTime = 1.5+Math.random()*1;
				}
			}else{
			
			}
			
			if(fishingTime>0){
				fishingTime-=delta;
			}
		}
		function gameTap(){
			
			if(onBaitTime){
				onBaitTime = 0;
				var newBlub;
				if(Math.random()<.5){
					newBlub = lightblubSource.clone();
				}else{
					newBlub = lightblubBrokenSource.clone();

				}
				scene.add(newBlub);
				newBlub.visible = true;
				newBlub.position.set(0,.5,0);
				var time = 0;
				var blubLoop= function(delta){
					time+=delta;
					newBlub.position.set(0,.5+Math.min(1,time/.6)*.6,0);
					newBlub.rotation.set(0,time*3.14/2,0);
					if(time>2){
						scene.remove( newBlub );
						onRenderFcts.filter(item => item !== blubLoop)
					}
				}
				onRenderFcts.push(blubLoop);
			}
			idleTime = 3+Math.random()*5;
			fishingTime = 1;
		
		}
		$(renderer.context.canvas).click(gameTap);
	

	var loader = new THREE.FBXLoader();
	loader.load( 'base.fbx', function ( object ) {
		object.mixer = new THREE.AnimationMixer( object );
		object.scale.set(0.05,0.05,0.05);
		lightblubBrokenSource = object.getObjectByName ("lightblub_Broken");
		lightblubSource = object.getObjectByName ("lightblub");
		lightblubBrokenSource.scale.set(.15,.15,.15);
		lightblubSource.scale.set(.15,.15,.15);
		lightblubBrokenSource.visible = false;
		lightblubSource.visible = false;
		/*
		mixers.push( object.mixer );
		var action = object.mixer.clipAction( object.animations[ 0 ] );
		action.play();
		*/ 
		{
			var surface = object.getObjectByName ("coffee_surface");
			var surfaceY = surface.position.y;

			var time = 0;
			onRenderFcts.push(function(delta){
				time+=delta;
				//preloadMesh2.rotation.x += Math.PI*delta
				surface.position.y = surfaceY+Math.sin(time*1+2)*.5;
			});
		}
		spineNode = object.getObjectByName ("spine");
		backNode = object.getObjectByName ("back");
		 spineNodeRotation = spineNode.rotation.clone();
		 backNodeRotation = backNode.rotation.clone();
		rod1Node = object.getObjectByName ("rod1");
		rod2Node = object.getObjectByName ("rod2");
		rod3Node = object.getObjectByName ("rod3");
		
		ripple = object.getObjectByName ("ripple");
		ripple.visible = false;
	var loader = new THREE.TextureLoader();
	loader.load(
		'img/sugar.png',
		function ( texture ) {
			var material = new THREE.MeshLambertMaterial( {
				map: texture
			} );
			var suger1 = createSugar(material);
			var suger2 = createSugar(material);
			suger1.position.set(0.18,.5,0);
			suger2.position.set(-0.16,.5,-0.19);
			
			var time = 0;
			onRenderFcts.push(function(delta){
				time+=delta;
				//preloadMesh2.rotation.x += Math.PI*delta
				suger1.rotation.set(-39.18+Math.sin(time*1+2)*.4,20.14,15.68+Math.sin(time*.78+3)*.4);
				suger2.rotation.set(-40.61,0+Math.sin(time*.96+1.4)*.4,36.86+Math.sin(time*.56+1)*.4);
				suger1.position.y = .5+Math.sin(time*1+2)*.025;
				suger2.position.y = .5+Math.sin(time*1+2)*.025;
			});
		},
		undefined,
		function ( err ) {
			console.error( 'An error happened.' );
		}
	);

		camera.far = 20;
		var light = new THREE.HemisphereLight( 0xffffff, 0xcccccc, 1.25 );
		scene.add( light );
		scene.add( object );
		scene.remove(preloadMesh1);
		scene.remove(preloadMesh2);
		onRenderFcts.push(gameLoop);
	} );
	