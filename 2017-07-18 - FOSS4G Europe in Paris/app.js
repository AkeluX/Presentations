var wwd;

window.addEventListener("load",  function() {
        var scene = document.getElementById("scene");
        scene.width = window.innerWidth;
        scene.height = window.innerHeight;

        wwd = new WorldWind.WorldWindow("scene");
        //wwd = new WorldWind.WorldWindow("scene", new WorldWind.ZeroElevationModel());

        wwd.addLayer(new WorldWind.BMNGOneImageLayer());
        wwd.addLayer(new WorldWind.BMNGLandsatLayer());

        // Layer for renderables
        var renderableLayer = new WorldWind.RenderableLayer();
        wwd.addLayer(renderableLayer);

        // Visual Effects
        var atmosphereLayer = new WorldWind.AtmosphereLayer()
        wwd.addLayer(atmosphereLayer);
        var starFieldLayer = new WorldWind.StarFieldLayer();
        wwd.addLayer(starFieldLayer);
        starFieldLayer.time = new Date();
        atmosphereLayer.lightLocation = WorldWind.SunPosition.getAsGeographicLocation(starFieldLayer.time);

        wwd.addLayer(new WorldWind.CompassLayer());
        wwd.addLayer(new WorldWind.CoordinatesDisplayLayer(wwd));
        wwd.addLayer(new WorldWind.ViewControlsLayer(wwd));

        // WMS / WMTS
        /*
        var getCapabilities = new XMLHttpRequest();
        getCapabilities.onload = function(e) {
                wmsCapabilities = new WorldWind.WmsCapabilities(this.response);
                
                var layerCapabilities = wmsCapabilities.getNamedLayer("meteosat:worldcloudmap_ir");
                var layerConfiguration = WorldWind.WmsLayer.formLayerConfiguration(layerCapabilities);
                
                var layer = new WorldWind.WmsLayer(layerConfiguration, "2017-07-06");
                layer.opacity = .5;

                wwd.insertLayer(2, layer);
        }
        getCapabilities.open("GET", "ADDRESS OF THE SERVER");
        getCapabilities.responseType = "document";
        getCapabilities.send();
        */
        
        // Basic Shapes
        var groundStationPlacemarkAttributes = new WorldWind.PlacemarkAttributes();
        groundStationPlacemarkAttributes.imageSource = "data/ground-station.png";
        groundStationPlacemarkAttributes.depthTest = false;
        groundStationPlacemarkAttributes.imageOffset = new WorldWind.Offset(WorldWind.OFFSET_FRACTION, 0.5, WorldWind.OFFSET_FRACTION, 0);

        var groundStationPlacemark = new WorldWind.Placemark(new WorldWind.Position(47.219999, 7.199422, 0),
                                                             true,
                                                             groundStationPlacemarkAttributes);
        groundStationPlacemark.highlightAttributes = new WorldWind.PlacemarkAttributes(groundStationPlacemarkAttributes);
        groundStationPlacemark.highlightAttributes.imageScale = 1.2;
        groundStationPlacemark.displayName = "Ground Station";
        
        renderableLayer.addRenderable(groundStationPlacemark);

        var orbitShapeAttributes = new WorldWind.ShapeAttributes();
        orbitShapeAttributes.interiorColor = new WorldWind.Color(1, 0, 0, .5);

        var orbitPath = new WorldWind.Path([
                new WorldWind.Position(10.0, -5.0, 600000),
                new WorldWind.Position(70.0, 30.0, 600000)
        ], orbitShapeAttributes);
        orbitPath.extrude = true;
        orbitPath.numSubSegments = 100;
        orbitPath.displayName = "Orbit";
        orbitPath.highlightAttributes = new WorldWind.ShapeAttributes();
        orbitPath.highlightAttributes.interiorColor = new WorldWind.Color(0, 0, 0, .5);
        orbitPath.highlightAttributes.outlineColor = new WorldWind.Color(0, 0, 0, 1);
        
        renderableLayer.addRenderable(orbitPath);

        // GeoJSON
        var shapeConfigurationCallback = function (geometry, properties) {
                var configuration = {};

                configuration.userProperties = {code: "TAV"};

                configuration.attributes =  new WorldWind.ShapeAttributes();
                configuration.attributes.interiorColor = new WorldWind.Color(0, 0, 1, .25);
                configuration.attributes.outlineColor = new WorldWind.Color(0, 0, 1, 1);

                configuration.highlightAttributes = new WorldWind.ShapeAttributes();
                configuration.highlightAttributes.interiorColor = new WorldWind.Color(0, 1, 0, .25);
                configuration.highlightAttributes.outlineColor = new WorldWind.Color(0, 1, 0, 1);

                return configuration;
        };

        var groundStationMask = new WorldWind.GeoJSONParser("data/ground-station-mask.geojson");
        groundStationMask.load(null, shapeConfigurationCallback, renderableLayer);

        // KML
        var acqPlan = new WorldWind.KmlFile('data/acquisition_plan.kml');
        acqPlan.then(function (kmlFile) {
                renderableLayer.currentTimeInterval = [
                        new Date("2017-07-10T00:00:00").valueOf(),
                        new Date("2017-07-10T23:59:59").valueOf()
                ];
                renderableLayer.addRenderable(kmlFile);
        });

        // GeoTIFF
        /*
        var geoTiffReader = new WorldWind.GeoTiffReader("data/biel.tif");
        geoTiffReader.readAsImage(function (canvas) {
            var image = new WorldWind.SurfaceImage(
                geoTiffReader.metadata.bbox,
                new WorldWind.ImageSource(canvas)
            );
            renderableLayer.addRenderable(image);
        });
        */

        // Collada
        var position = new WorldWind.Position(10, -5, 600000);
        var colladaLoader = new WorldWind.ColladaLoader(position);
        colladaLoader.init({dirPath: 'data/'});
        colladaLoader.load('satellite.dae', function (model) {
                model.scale = 100;
                renderableLayer.addRenderable(model);
                console.log("Satellite loaded");
        });

        // Highlight Controller
        new WorldWind.HighlightController(wwd);
        wwd.deepPicking = true;

        // Picking
        wwd.addEventListener("dblclick", function(event) {
                console.log(wwd.pick(wwd.canvasCoordinates(event.clientX, event.clientY)).objects);
        });
});

function goToTavannes() {
        //wwd.navigator.lookAtLocation.latitude = 47.219999;
        //wwd.navigator.lookAtLocation.longitude = 7.199422;
        //wwd.navigator.range = 1000000;
        //wwd.redraw();

        var animator = new WorldWind.GoToAnimator(wwd);
        animator.goTo(new WorldWind.Position(47.219999, 7.199422, 800000)/* optional callback here */);
}