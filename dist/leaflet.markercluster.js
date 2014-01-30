/*
 Leaflet.markercluster, Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
 https://github.com/Leaflet/Leaflet.markercluster
 (c) 2012-2013, Dave Leaver, smartrak
*/
(function(e,t,n){L.MarkerClusterGroup=L.FeatureGroup.extend({options:{maxClusterRadius:80,iconCreateFunction:null,spiderfyOnMaxZoom:true,showCoverageOnHover:true,zoomToBoundsOnClick:true,singleMarkerMode:false,disableClusteringAtZoom:null,removeOutsideVisibleBounds:true,animateAddingMarkers:false,spiderfyDistanceMultiplier:1,chunkedLoading:false,chunkInterval:200,chunkDelay:50,chunkProgress:null,polygonOptions:{},enablePhotoClusterMode:false,photoZoomWidth:300,photoGalleryWidth:500,photoIconCreateFunction:null,extractPhotoUrl:null},initialize:function(e){L.Util.setOptions(this,e);if(!this.options.iconCreateFunction){this.options.iconCreateFunction=this._defaultIconCreateFunction}if(this.options.enablePhotoClusterMode){this.options.iconCreateFunction=this.options.photoIconCreateFunction?this.options.photoIconCreateFunction:this._defaultPhotoIconCreateFunction;this.options.singleMarkerMode=true;this.options.spiderfyOnMaxZoom=false;this.options.extractPhotoUrl=this._extractPhotoUrl}this._featureGroup=L.featureGroup();this._featureGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this);this._nonPointGroup=L.featureGroup();this._nonPointGroup.on(L.FeatureGroup.EVENTS,this._propagateEvent,this);this._inZoomAnimation=0;this._needsClustering=[];this._needsRemoving=[];this._currentShownBounds=null;this._queue=[]},addLayer:function(e){if(e instanceof L.LayerGroup){var t=[];for(var n in e._layers){t.push(e._layers[n])}return this.addLayers(t)}if(!e.getLatLng){this._nonPointGroup.addLayer(e);return this}if(!this._map){this._needsClustering.push(e);return this}if(this.hasLayer(e)){return this}if(this._unspiderfy){this._unspiderfy()}this._addLayer(e,this._maxZoom);var r=e,i=this._map.getZoom();if(e.__parent){while(r.__parent._zoom>=i){r=r.__parent}}if(this._currentShownBounds.contains(r.getLatLng())){if(this.options.animateAddingMarkers){this._animationAddLayer(e,r)}else{this._animationAddLayerNonAnimated(e,r)}}return this},removeLayer:function(e){if(e instanceof L.LayerGroup){var t=[];for(var n in e._layers){t.push(e._layers[n])}return this.removeLayers(t)}if(!e.getLatLng){this._nonPointGroup.removeLayer(e);return this}if(!this._map){if(!this._arraySplice(this._needsClustering,e)&&this.hasLayer(e)){this._needsRemoving.push(e)}return this}if(!e.__parent){return this}if(this._unspiderfy){this._unspiderfy();this._unspiderfyLayer(e)}this._removeLayer(e,true);if(this._featureGroup.hasLayer(e)){this._featureGroup.removeLayer(e);if(e.setOpacity){e.setOpacity(1)}}return this},addLayers:function(e){var t=this._featureGroup,n=this._nonPointGroup,r=this.options.chunkInterval,i=this.options.chunkProgress,s,o,u,a;if(this._map){var f=0,l=(new Date).getTime();var c=L.bind(function(){var s=(new Date).getTime();for(;f<e.length;f++){if(f%200===0){var o=(new Date).getTime()-s;if(o>r){break}}a=e[f];if(!a.getLatLng){n.addLayer(a);continue}if(this.hasLayer(a)){continue}this._addLayer(a,this._maxZoom);if(a.__parent){if(a.__parent.getChildCount()===2){var u=a.__parent.getAllChildMarkers(),h=u[0]===a?u[1]:u[0];t.removeLayer(h)}}}if(i){i(f,e.length,(new Date).getTime()-l)}if(f===e.length){this._featureGroup.eachLayer(function(e){if(e instanceof L.MarkerCluster&&e._iconNeedsUpdate){e._updateIcon()}});this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds)}else{setTimeout(c,this.options.chunkDelay)}},this);c()}else{s=[];for(o=0,u=e.length;o<u;o++){a=e[o];if(!a.getLatLng){n.addLayer(a);continue}if(this.hasLayer(a)){continue}s.push(a)}this._needsClustering=this._needsClustering.concat(s)}return this},removeLayers:function(e){var t,n,r,i=this._featureGroup,s=this._nonPointGroup;if(!this._map){for(t=0,n=e.length;t<n;t++){r=e[t];this._arraySplice(this._needsClustering,r);s.removeLayer(r)}return this}for(t=0,n=e.length;t<n;t++){r=e[t];if(!r.__parent){s.removeLayer(r);continue}this._removeLayer(r,true,true);if(i.hasLayer(r)){i.removeLayer(r);if(r.setOpacity){r.setOpacity(1)}}}this._topClusterLevel._recursivelyAddChildrenToMap(null,this._zoom,this._currentShownBounds);i.eachLayer(function(e){if(e instanceof L.MarkerCluster){e._updateIcon()}});return this},clearLayers:function(){if(!this._map){this._needsClustering=[];delete this._gridClusters;delete this._gridUnclustered}if(this._noanimationUnspiderfy){this._noanimationUnspiderfy()}this._featureGroup.clearLayers();this._nonPointGroup.clearLayers();this.eachLayer(function(e){delete e.__parent});if(this._map){this._generateInitialClusters()}return this},getBounds:function(){var e=new L.LatLngBounds;if(this._topClusterLevel){e.extend(this._topClusterLevel._bounds)}else{for(var t=this._needsClustering.length-1;t>=0;t--){e.extend(this._needsClustering[t].getLatLng())}}e.extend(this._nonPointGroup.getBounds());return e},eachLayer:function(e,t){var n=this._needsClustering.slice(),r;if(this._topClusterLevel){this._topClusterLevel.getAllChildMarkers(n)}for(r=n.length-1;r>=0;r--){e.call(t,n[r])}this._nonPointGroup.eachLayer(e,t)},getLayers:function(){var e=[];this.eachLayer(function(t){e.push(t)});return e},getLayer:function(e){var t=null;this.eachLayer(function(n){if(L.stamp(n)===e){t=n}});return t},hasLayer:function(e){if(!e){return false}var t,n=this._needsClustering;for(t=n.length-1;t>=0;t--){if(n[t]===e){return true}}n=this._needsRemoving;for(t=n.length-1;t>=0;t--){if(n[t]===e){return false}}return!!(e.__parent&&e.__parent._group===this)||this._nonPointGroup.hasLayer(e)},zoomToShowLayer:function(e,t){var n=function(){if((e._icon||e.__parent._icon)&&!this._inZoomAnimation){this._map.off("moveend",n,this);this.off("animationend",n,this);if(e._icon){t()}else if(e.__parent._icon){var r=function(){this.off("spiderfied",r,this);t()};this.on("spiderfied",r,this);e.__parent.spiderfy()}}};if(e._icon&&this._map.getBounds().contains(e.getLatLng())){t()}else if(e.__parent._zoom<this._map.getZoom()){this._map.on("moveend",n,this);this._map.panTo(e.getLatLng())}else{this._map.on("moveend",n,this);this.on("animationend",n,this);this._map.setView(e.getLatLng(),e.__parent._zoom+1);e.__parent.zoomToBounds()}},onAdd:function(e){this._map=e;var t,n,r;if(!isFinite(this._map.getMaxZoom())){throw"Map has no maxZoom specified"}this._featureGroup.onAdd(e);this._nonPointGroup.onAdd(e);if(!this._gridClusters){this._generateInitialClusters()}for(t=0,n=this._needsRemoving.length;t<n;t++){r=this._needsRemoving[t];this._removeLayer(r,true)}this._needsRemoving=[];this._zoom=this._map.getZoom();this._currentShownBounds=this._getExpandedVisibleBounds();this._map.on("zoomend",this._zoomEnd,this);this._map.on("moveend",this._moveEnd,this);if(this._spiderfierOnAdd){this._spiderfierOnAdd()}this._bindEvents();n=this._needsClustering;this._needsClustering=[];this.addLayers(n)},onRemove:function(e){e.off("zoomend",this._zoomEnd,this);e.off("moveend",this._moveEnd,this);this._unbindEvents();this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","");if(this._spiderfierOnRemove){this._spiderfierOnRemove()}this._hideCoverage();this._featureGroup.onRemove(e);this._nonPointGroup.onRemove(e);this._featureGroup.clearLayers();this._map=null},getVisibleParent:function(e){var t=e;while(t&&!t._icon){t=t.__parent}return t||null},_arraySplice:function(e,t){for(var n=e.length-1;n>=0;n--){if(e[n]===t){e.splice(n,1);return true}}},_removeLayer:function(e,t,n){var r=this._gridClusters,i=this._gridUnclustered,s=this._featureGroup,o=this._map;if(t){for(var u=this._maxZoom;u>=0;u--){if(!i[u].removeObject(e,o.project(e.getLatLng(),u))){break}}}var a=e.__parent,f=a._markers,l;this._arraySplice(f,e);while(a){a._childCount--;if(a._zoom<0){break}else if(t&&a._childCount<=1){l=a._markers[0]===e?a._markers[1]:a._markers[0];r[a._zoom].removeObject(a,o.project(a._cLatLng,a._zoom));i[a._zoom].addObject(l,o.project(l.getLatLng(),a._zoom));this._arraySplice(a.__parent._childClusters,a);a.__parent._markers.push(l);l.__parent=a.__parent;if(a._icon){s.removeLayer(a);if(!n){s.addLayer(l)}}}else{a._recalculateBounds();if(!n||!a._icon){a._updateIcon()}}a=a.__parent}delete e.__parent},_isOrIsParent:function(e,t){while(t){if(e===t){return true}t=t.parentNode}return false},_propagateEvent:function(e){if(e.layer instanceof L.MarkerCluster){if(e.originalEvent&&this._isOrIsParent(e.layer._icon,e.originalEvent.relatedTarget)){return}e.type="cluster"+e.type}this.fire(e.type,e)},_defaultIconCreateFunction:function(e){var t=e.getChildCount();var n=" marker-cluster-";if(t<10){n+="small"}else if(t<100){n+="medium"}else{n+="large"}return new L.DivIcon({html:"<div><span>"+t+"</span></div>",className:"marker-cluster"+n,iconSize:new L.Point(40,40)})},_extractPhotoUrl:function(e){if(typeof e.feature!="undefined"&&typeof e.feature.properties.photo_url!="undefined"){return e.feature.properties.photo_url}if(typeof e.options!="undefined"&&typeof e.options.photo_url!="undefined"){return e.options.photo_url}return"http://placehold.it/50x50"},_defaultPhotoIconCreateFunction:function(e){var t=e.getChildCount();var n=e.getAllChildMarkers();var r="";for(index=0;index<t&&index<3;++index){var i=t==1?Math.floor(Math.random()*10+1):index;r+='<span class="photo-cluster-'+i+'"><img src="'+this.extractPhotoUrl(n[index])+'" /></span>'}var s='<span class="photo-cluster photo-cluster-count-'+t+'">'+r+"<strong>"+t+"</strong></span>";var o=new L.DivIcon({html:s});return o},_bindEvents:function(){var e=this._map,t=this.options.spiderfyOnMaxZoom,n=this.options.showCoverageOnHover,r=this.options.zoomToBoundsOnClick,i=this.options.enablePhotoClusterMode;if(t||r){this.on("clusterclick",this._zoomOrSpiderfy,this)}if(n){this.on("clustermouseover",this._showCoverage,this);this.on("clustermouseout",this._hideCoverage,this);e.on("zoomend",this._hideCoverage,this)}if(i){this.on("click",this._photoPopup,this);this.on("clusterclick",this._photoGallery,this)}},_photoGallery:function(e){var t=this._map;if(t.getMaxZoom()===t.getZoom()){e.layer.photoGallery()}},_photoPopup:function(e){var t=this._map;var n='<span class="photo-cluster-zoom"><img src="'+this._extractPhotoUrl(e.layer)+'" /></span>';var r=(new L.popup({autoPan:true,minWidth:this.options.photoZoomWidth})).setContent(n).setLatLng(e.latlng).openOn(this._map)},_zoomOrSpiderfy:function(e){var t=this._map;if(t.getMaxZoom()===t.getZoom()){if(this.options.spiderfyOnMaxZoom){e.layer.spiderfy()}}else if(this.options.zoomToBoundsOnClick){e.layer.zoomToBounds()}if(e.originalEvent&&e.originalEvent.keyCode===13){t._container.focus()}},_showCoverage:function(e){var t=this._map;if(this._inZoomAnimation){return}if(this._shownPolygon){t.removeLayer(this._shownPolygon)}if(e.layer.getChildCount()>2&&e.layer!==this._spiderfied){this._shownPolygon=new L.Polygon(e.layer.getConvexHull(),this.options.polygonOptions);t.addLayer(this._shownPolygon)}},_hideCoverage:function(){if(this._shownPolygon){this._map.removeLayer(this._shownPolygon);this._shownPolygon=null}},_unbindEvents:function(){var e=this.options.spiderfyOnMaxZoom,t=this.options.showCoverageOnHover,n=this.options.zoomToBoundsOnClick,r=this._map;if(e||n){this.off("clusterclick",this._zoomOrSpiderfy,this)}if(t){this.off("clustermouseover",this._showCoverage,this);this.off("clustermouseout",this._hideCoverage,this);r.off("zoomend",this._hideCoverage,this)}},_zoomEnd:function(){if(!this._map){return}this._mergeSplitClusters();this._zoom=this._map._zoom;this._currentShownBounds=this._getExpandedVisibleBounds()},_moveEnd:function(){if(this._inZoomAnimation){return}var e=this._getExpandedVisibleBounds();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,e);this._topClusterLevel._recursivelyAddChildrenToMap(null,this._map._zoom,e);this._currentShownBounds=e;return},_generateInitialClusters:function(){var e=this._map.getMaxZoom(),t=this.options.maxClusterRadius,n=t;if(typeof t!=="function"){n=function(){return t}}if(this.options.disableClusteringAtZoom){e=this.options.disableClusteringAtZoom-1}this._maxZoom=e;this._gridClusters={};this._gridUnclustered={};for(var r=e;r>=0;r--){this._gridClusters[r]=new L.DistanceGrid(n(r));this._gridUnclustered[r]=new L.DistanceGrid(n(r))}this._topClusterLevel=new L.MarkerCluster(this,-1)},_addLayer:function(e,t){var n=this._gridClusters,r=this._gridUnclustered,i,s;if(this.options.singleMarkerMode){e.options.icon=this.options.iconCreateFunction({getChildCount:function(){return 1},getAllChildMarkers:function(){return[e]}})}for(;t>=0;t--){i=this._map.project(e.getLatLng(),t);var o=n[t].getNearObject(i);if(o){o._addChild(e);e.__parent=o;return}o=r[t].getNearObject(i);if(o){var u=o.__parent;if(u){this._removeLayer(o,false)}var a=new L.MarkerCluster(this,t,o,e);n[t].addObject(a,this._map.project(a._cLatLng,t));o.__parent=a;e.__parent=a;var f=a;for(s=t-1;s>u._zoom;s--){f=new L.MarkerCluster(this,s,f);n[s].addObject(f,this._map.project(o.getLatLng(),s))}u._addChild(f);for(s=t;s>=0;s--){if(!r[s].removeObject(o,this._map.project(o.getLatLng(),s))){break}}return}r[t].addObject(e,i)}this._topClusterLevel._addChild(e);e.__parent=this._topClusterLevel;return},_enqueue:function(e){this._queue.push(e);if(!this._queueTimeout){this._queueTimeout=setTimeout(L.bind(this._processQueue,this),300)}},_processQueue:function(){for(var e=0;e<this._queue.length;e++){this._queue[e].call(this)}this._queue.length=0;clearTimeout(this._queueTimeout);this._queueTimeout=null},_mergeSplitClusters:function(){this._processQueue();if(this._zoom<this._map._zoom&&this._currentShownBounds.contains(this._getExpandedVisibleBounds())){this._animationStart();this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,this._zoom,this._getExpandedVisibleBounds());this._animationZoomIn(this._zoom,this._map._zoom)}else if(this._zoom>this._map._zoom){this._animationStart();this._animationZoomOut(this._zoom,this._map._zoom)}else{this._moveEnd()}},_getExpandedVisibleBounds:function(){if(!this.options.removeOutsideVisibleBounds){return this.getBounds()}var e=this._map,t=e.getBounds(),n=t._southWest,r=t._northEast,i=L.Browser.mobile?0:Math.abs(n.lat-r.lat),s=L.Browser.mobile?0:Math.abs(n.lng-r.lng);return new L.LatLngBounds(new L.LatLng(n.lat-i,n.lng-s,true),new L.LatLng(r.lat+i,r.lng+s,true))},_animationAddLayerNonAnimated:function(e,t){if(t===e){this._featureGroup.addLayer(e)}else if(t._childCount===2){t._addToMap();var n=t.getAllChildMarkers();this._featureGroup.removeLayer(n[0]);this._featureGroup.removeLayer(n[1])}else{t._updateIcon()}}});L.MarkerClusterGroup.include(!L.DomUtil.TRANSITION?{_animationStart:function(){},_animationZoomIn:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,e);this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds())},_animationZoomOut:function(e,t){this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,e);this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds())},_animationAddLayer:function(e,t){this._animationAddLayerNonAnimated(e,t)}}:{_animationStart:function(){this._map._mapPane.className+=" leaflet-cluster-anim";this._inZoomAnimation++},_animationEnd:function(){if(this._map){this._map._mapPane.className=this._map._mapPane.className.replace(" leaflet-cluster-anim","")}this._inZoomAnimation--;this.fire("animationend")},_animationZoomIn:function(e,t){var n=this._getExpandedVisibleBounds(),r=this._featureGroup,i;this._topClusterLevel._recursively(n,e,0,function(s){var o=s._latlng,u=s._markers,a;if(!n.contains(o)){o=null}if(s._isSingleParent()&&e+1===t){r.removeLayer(s);s._recursivelyAddChildrenToMap(null,t,n)}else{s.setOpacity(0);s._recursivelyAddChildrenToMap(o,t,n)}for(i=u.length-1;i>=0;i--){a=u[i];if(!n.contains(a._latlng)){r.removeLayer(a)}}});this._forceLayout();this._topClusterLevel._recursivelyBecomeVisible(n,t);r.eachLayer(function(e){if(!(e instanceof L.MarkerCluster)&&e._icon){e.setOpacity(1)}});this._topClusterLevel._recursively(n,e,t,function(e){e._recursivelyRestoreChildPositions(t)});this._enqueue(function(){this._topClusterLevel._recursively(n,e,0,function(e){r.removeLayer(e);e.setOpacity(1)});this._animationEnd()})},_animationZoomOut:function(e,t){this._animationZoomOutSingle(this._topClusterLevel,e-1,t);this._topClusterLevel._recursivelyAddChildrenToMap(null,t,this._getExpandedVisibleBounds());this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds,e,this._getExpandedVisibleBounds())},_animationZoomOutSingle:function(e,t,n){var r=this._getExpandedVisibleBounds();e._recursivelyAnimateChildrenInAndAddSelfToMap(r,t+1,n);var i=this;this._forceLayout();e._recursivelyBecomeVisible(r,n);this._enqueue(function(){if(e._childCount===1){var s=e._markers[0];s.setLatLng(s.getLatLng());if(s.setOpacity){s.setOpacity(1)}}else{e._recursively(r,n,0,function(e){e._recursivelyRemoveChildrenFromMap(r,t+1)})}i._animationEnd()})},_animationAddLayer:function(e,t){var n=this,r=this._featureGroup;r.addLayer(e);if(t!==e){if(t._childCount>2){t._updateIcon();this._forceLayout();this._animationStart();e._setPos(this._map.latLngToLayerPoint(t.getLatLng()));e.setOpacity(0);this._enqueue(function(){r.removeLayer(e);e.setOpacity(1);n._animationEnd()})}else{this._forceLayout();n._animationStart();n._animationZoomOutSingle(t,this._map.getMaxZoom(),this._map.getZoom())}}},_forceLayout:function(){L.Util.falseFn(t.body.offsetWidth)}});L.markerClusterGroup=function(e){return new L.MarkerClusterGroup(e)};L.MarkerCluster=L.Marker.extend({initialize:function(e,t,n,r){L.Marker.prototype.initialize.call(this,n?n._cLatLng||n.getLatLng():new L.LatLng(0,0),{icon:this});this._group=e;this._zoom=t;this._markers=[];this._childClusters=[];this._childCount=0;this._iconNeedsUpdate=true;this._bounds=new L.LatLngBounds;if(n){this._addChild(n)}if(r){this._addChild(r)}},getAllChildMarkers:function(e){e=e||[];for(var t=this._childClusters.length-1;t>=0;t--){this._childClusters[t].getAllChildMarkers(e)}for(var n=this._markers.length-1;n>=0;n--){e.push(this._markers[n])}return e},getChildCount:function(){return this._childCount},zoomToBounds:function(){var e=this._childClusters.slice(),t=this._group._map,n=t.getBoundsZoom(this._bounds),r=this._zoom+1,i=t.getZoom(),s;while(e.length>0&&n>r){r++;var o=[];for(s=0;s<e.length;s++){o=o.concat(e[s]._childClusters)}e=o}if(n>r){this._group._map.setView(this._latlng,r)}else if(n<=i){this._group._map.setView(this._latlng,i+1)}else{this._group._map.fitBounds(this._bounds)}},getBounds:function(){var e=new L.LatLngBounds;e.extend(this._bounds);return e},_updateIcon:function(){this._iconNeedsUpdate=true;if(this._icon){this.setIcon(this)}},createIcon:function(){if(this._iconNeedsUpdate){this._iconObj=this._group.options.iconCreateFunction(this);this._iconNeedsUpdate=false}return this._iconObj.createIcon()},createShadow:function(){return this._iconObj.createShadow()},_addChild:function(e,t){this._iconNeedsUpdate=true;this._expandBounds(e);if(e instanceof L.MarkerCluster){if(!t){this._childClusters.push(e);e.__parent=this}this._childCount+=e._childCount}else{if(!t){this._markers.push(e)}this._childCount++}if(this.__parent){this.__parent._addChild(e,true)}},_expandBounds:function(e){var t,n=e._wLatLng||e._latlng;if(e instanceof L.MarkerCluster){this._bounds.extend(e._bounds);t=e._childCount}else{this._bounds.extend(n);t=1}if(!this._cLatLng){this._cLatLng=e._cLatLng||n}var r=this._childCount+t;if(!this._wLatLng){this._latlng=this._wLatLng=new L.LatLng(n.lat,n.lng)}else{this._wLatLng.lat=(n.lat*t+this._wLatLng.lat*this._childCount)/r;this._wLatLng.lng=(n.lng*t+this._wLatLng.lng*this._childCount)/r}},_addToMap:function(e){if(e){this._backupLatlng=this._latlng;this.setLatLng(e)}this._group._featureGroup.addLayer(this)},_recursivelyAnimateChildrenIn:function(e,t,n){this._recursively(e,0,n-1,function(e){var n=e._markers,r,i;for(r=n.length-1;r>=0;r--){i=n[r];if(i._icon){i._setPos(t);i.setOpacity(0)}}},function(e){var n=e._childClusters,r,i;for(r=n.length-1;r>=0;r--){i=n[r];if(i._icon){i._setPos(t);i.setOpacity(0)}}})},_recursivelyAnimateChildrenInAndAddSelfToMap:function(e,t,n){this._recursively(e,n,0,function(r){r._recursivelyAnimateChildrenIn(e,r._group._map.latLngToLayerPoint(r.getLatLng()).round(),t);if(r._isSingleParent()&&t-1===n){r.setOpacity(1);r._recursivelyRemoveChildrenFromMap(e,t)}else{r.setOpacity(0)}r._addToMap()})},_recursivelyBecomeVisible:function(e,t){this._recursively(e,0,t,null,function(e){e.setOpacity(1)})},_recursivelyAddChildrenToMap:function(e,t,n){this._recursively(n,-1,t,function(r){if(t===r._zoom){return}for(var i=r._markers.length-1;i>=0;i--){var s=r._markers[i];if(!n.contains(s._latlng)){continue}if(e){s._backupLatlng=s.getLatLng();s.setLatLng(e);if(s.setOpacity){s.setOpacity(0)}}r._group._featureGroup.addLayer(s)}},function(t){t._addToMap(e)})},_recursivelyRestoreChildPositions:function(e){for(var t=this._markers.length-1;t>=0;t--){var n=this._markers[t];if(n._backupLatlng){n.setLatLng(n._backupLatlng);delete n._backupLatlng}}if(e-1===this._zoom){for(var r=this._childClusters.length-1;r>=0;r--){this._childClusters[r]._restorePosition()}}else{for(var i=this._childClusters.length-1;i>=0;i--){this._childClusters[i]._recursivelyRestoreChildPositions(e)}}},_restorePosition:function(){if(this._backupLatlng){this.setLatLng(this._backupLatlng);delete this._backupLatlng}},_recursivelyRemoveChildrenFromMap:function(e,t,n){var r,i;this._recursively(e,-1,t-1,function(e){for(i=e._markers.length-1;i>=0;i--){r=e._markers[i];if(!n||!n.contains(r._latlng)){e._group._featureGroup.removeLayer(r);if(r.setOpacity){r.setOpacity(1)}}}},function(e){for(i=e._childClusters.length-1;i>=0;i--){r=e._childClusters[i];if(!n||!n.contains(r._latlng)){e._group._featureGroup.removeLayer(r);if(r.setOpacity){r.setOpacity(1)}}}})},_recursively:function(e,t,n,r,i){var s=this._childClusters,o=this._zoom,u,a;if(t>o){for(u=s.length-1;u>=0;u--){a=s[u];if(e.intersects(a._bounds)){a._recursively(e,t,n,r,i)}}}else{if(r){r(this)}if(i&&this._zoom===n){i(this)}if(n>o){for(u=s.length-1;u>=0;u--){a=s[u];if(e.intersects(a._bounds)){a._recursively(e,t,n,r,i)}}}}},_recalculateBounds:function(){var e=this._markers,t=this._childClusters,n;this._bounds=new L.LatLngBounds;delete this._wLatLng;for(n=e.length-1;n>=0;n--){this._expandBounds(e[n])}for(n=t.length-1;n>=0;n--){this._expandBounds(t[n])}},_isSingleParent:function(){return this._childClusters.length>0&&this._childClusters[0]._childCount===this._childCount}});L.DistanceGrid=function(e){this._cellSize=e;this._sqCellSize=e*e;this._grid={};this._objectPoint={}};L.DistanceGrid.prototype={addObject:function(e,t){var n=this._getCoord(t.x),r=this._getCoord(t.y),i=this._grid,s=i[r]=i[r]||{},o=s[n]=s[n]||[],u=L.Util.stamp(e);this._objectPoint[u]=t;o.push(e)},updateObject:function(e,t){this.removeObject(e);this.addObject(e,t)},removeObject:function(e,t){var n=this._getCoord(t.x),r=this._getCoord(t.y),i=this._grid,s=i[r]=i[r]||{},o=s[n]=s[n]||[],u,a;delete this._objectPoint[L.Util.stamp(e)];for(u=0,a=o.length;u<a;u++){if(o[u]===e){o.splice(u,1);if(a===1){delete s[n]}return true}}},eachObject:function(e,t){var n,r,i,s,o,u,a,f=this._grid;for(n in f){o=f[n];for(r in o){u=o[r];for(i=0,s=u.length;i<s;i++){a=e.call(t,u[i]);if(a){i--;s--}}}}},getNearObject:function(e){var t=this._getCoord(e.x),n=this._getCoord(e.y),r,i,s,o,u,a,f,l,c=this._objectPoint,h=this._sqCellSize,p=null;for(r=n-1;r<=n+1;r++){o=this._grid[r];if(o){for(i=t-1;i<=t+1;i++){u=o[i];if(u){for(s=0,a=u.length;s<a;s++){f=u[s];l=this._sqDist(c[L.Util.stamp(f)],e);if(l<h){h=l;p=f}}}}}}return p},_getCoord:function(e){return Math.floor(e/this._cellSize)},_sqDist:function(e,t){var n=t.x-e.x,r=t.y-e.y;return n*n+r*r}};(function(){L.QuickHull={getDistant:function(e,t){var n=t[1].lat-t[0].lat,r=t[0].lng-t[1].lng;return r*(e.lat-t[0].lat)+n*(e.lng-t[0].lng)},findMostDistantPointFromBaseLine:function(e,t){var n=0,r=null,i=[],s,o,u;for(s=t.length-1;s>=0;s--){o=t[s];u=this.getDistant(o,e);if(u>0){i.push(o)}else{continue}if(u>n){n=u;r=o}}return{maxPoint:r,newPoints:i}},buildConvexHull:function(e,t){var n=[],r=this.findMostDistantPointFromBaseLine(e,t);if(r.maxPoint){n=n.concat(this.buildConvexHull([e[0],r.maxPoint],r.newPoints));n=n.concat(this.buildConvexHull([r.maxPoint,e[1]],r.newPoints));return n}else{return[e[0]]}},getConvexHull:function(e){var t=false,n=false,r=null,i=null,s;for(s=e.length-1;s>=0;s--){var o=e[s];if(t===false||o.lat>t){r=o;t=o.lat}if(n===false||o.lat<n){i=o;n=o.lat}}var u=[].concat(this.buildConvexHull([i,r],e),this.buildConvexHull([r,i],e));return u}}})();L.MarkerCluster.include({getConvexHull:function(){var e=this.getAllChildMarkers(),t=[],n,r;for(r=e.length-1;r>=0;r--){n=e[r].getLatLng();t.push(n)}return L.QuickHull.getConvexHull(t)}});L.MarkerCluster.include({_2PI:Math.PI*2,_circleFootSeparation:25,_circleStartAngle:Math.PI/6,_spiralFootSeparation:28,_spiralLengthStart:11,_spiralLengthFactor:5,_circleSpiralSwitchover:9,photoGallery:function(){var e=this.getAllChildMarkers(),t=this._group,n=t._map;var r="";for(index=0;index<e.length;++index){r+='<li><img src="'+this._group._extractPhotoUrl(e[index])+'" /></li>'}var i='<div class="photo-cluster-gallery"><ul>'+r+"</ul>";var s=(new L.popup({offset:new L.Point(40,150),autoPan:true,minWidth:this.options.photoGalleryWidth})).setContent(i).setLatLng(this._latlng).openOn(n)},spiderfy:function(){if(this._group._spiderfied===this||this._group._inZoomAnimation){return}var e=this.getAllChildMarkers(),t=this._group,n=t._map,r=n.latLngToLayerPoint(this._latlng),i;this._group._unspiderfy();this._group._spiderfied=this;if(e.length>=this._circleSpiralSwitchover){i=this._generatePointsSpiral(e.length,r)}else{r.y+=10;i=this._generatePointsCircle(e.length,r)}this._animationSpiderfy(e,i)},unspiderfy:function(e){if(this._group._inZoomAnimation){return}this._animationUnspiderfy(e);this._group._spiderfied=null},_generatePointsCircle:function(e,t){var n=this._group.options.spiderfyDistanceMultiplier*this._circleFootSeparation*(2+e),r=n/this._2PI,i=this._2PI/e,s=[],o,u;s.length=e;for(o=e-1;o>=0;o--){u=this._circleStartAngle+o*i;s[o]=(new L.Point(t.x+r*Math.cos(u),t.y+r*Math.sin(u)))._round()}return s},_generatePointsSpiral:function(e,t){var n=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthStart,r=this._group.options.spiderfyDistanceMultiplier*this._spiralFootSeparation,i=this._group.options.spiderfyDistanceMultiplier*this._spiralLengthFactor,s=0,o=[],u;o.length=e;for(u=e-1;u>=0;u--){s+=r/n+u*5e-4;o[u]=(new L.Point(t.x+n*Math.cos(s),t.y+n*Math.sin(s)))._round();n+=this._2PI*i/s}return o},_noanimationUnspiderfy:function(){var e=this._group,t=e._map,n=e._featureGroup,r=this.getAllChildMarkers(),i,s;this.setOpacity(1);for(s=r.length-1;s>=0;s--){i=r[s];n.removeLayer(i);if(i._preSpiderfyLatlng){i.setLatLng(i._preSpiderfyLatlng);delete i._preSpiderfyLatlng}if(i.setZIndexOffset){i.setZIndexOffset(0)}if(i._spiderLeg){t.removeLayer(i._spiderLeg);delete i._spiderLeg}}e._spiderfied=null}});L.MarkerCluster.include(!L.DomUtil.TRANSITION?{_animationSpiderfy:function(e,t){var n=this._group,r=n._map,i=n._featureGroup,s,o,u,a;for(s=e.length-1;s>=0;s--){a=r.layerPointToLatLng(t[s]);o=e[s];o._preSpiderfyLatlng=o._latlng;o.setLatLng(a);if(o.setZIndexOffset){o.setZIndexOffset(1e6)}i.addLayer(o);u=new L.Polyline([this._latlng,a],{weight:1.5,color:"#222"});r.addLayer(u);o._spiderLeg=u}this.setOpacity(.3);n.fire("spiderfied")},_animationUnspiderfy:function(){this._noanimationUnspiderfy()}}:{SVG_ANIMATION:function(){return t.createElementNS("http://www.w3.org/2000/svg","animate").toString().indexOf("SVGAnimate")>-1}(),_animationSpiderfy:function(e,n){var r=this,i=this._group,s=i._map,o=i._featureGroup,u=s.latLngToLayerPoint(this._latlng),a,f,l,c;for(a=e.length-1;a>=0;a--){f=e[a];if(f.setOpacity){f.setZIndexOffset(1e6);f.setOpacity(0);o.addLayer(f);f._setPos(u)}else{o.addLayer(f)}}i._forceLayout();i._animationStart();var h=L.Path.SVG?0:.3,p=L.Path.SVG_NS;for(a=e.length-1;a>=0;a--){c=s.layerPointToLatLng(n[a]);f=e[a];f._preSpiderfyLatlng=f._latlng;f.setLatLng(c);if(f.setOpacity){f.setOpacity(1)}l=new L.Polyline([r._latlng,c],{weight:1.5,color:"#222",opacity:h});s.addLayer(l);f._spiderLeg=l;if(!L.Path.SVG||!this.SVG_ANIMATION){continue}var d=l._path.getTotalLength();l._path.setAttribute("stroke-dasharray",d+","+d);var v=t.createElementNS(p,"animate");v.setAttribute("attributeName","stroke-dashoffset");v.setAttribute("begin","indefinite");v.setAttribute("from",d);v.setAttribute("to",0);v.setAttribute("dur",.25);l._path.appendChild(v);v.beginElement();v=t.createElementNS(p,"animate");v.setAttribute("attributeName","stroke-opacity");v.setAttribute("attributeName","stroke-opacity");v.setAttribute("begin","indefinite");v.setAttribute("from",0);v.setAttribute("to",.5);v.setAttribute("dur",.25);l._path.appendChild(v);v.beginElement()}r.setOpacity(.3);if(L.Path.SVG){this._group._forceLayout();for(a=e.length-1;a>=0;a--){f=e[a]._spiderLeg;f.options.opacity=.5;f._path.setAttribute("stroke-opacity",.5)}}setTimeout(function(){i._animationEnd();i.fire("spiderfied")},200)},_animationUnspiderfy:function(e){var t=this._group,n=t._map,r=t._featureGroup,i=e?n._latLngToNewLayerPoint(this._latlng,e.zoom,e.center):n.latLngToLayerPoint(this._latlng),s=this.getAllChildMarkers(),o=L.Path.SVG&&this.SVG_ANIMATION,u,a,f;t._animationStart();this.setOpacity(1);for(a=s.length-1;a>=0;a--){u=s[a];if(!u._preSpiderfyLatlng){continue}u.setLatLng(u._preSpiderfyLatlng);delete u._preSpiderfyLatlng;if(u.setOpacity){u._setPos(i);u.setOpacity(0)}else{r.removeLayer(u)}if(o){f=u._spiderLeg._path.childNodes[0];f.setAttribute("to",f.getAttribute("from"));f.setAttribute("from",0);f.beginElement();f=u._spiderLeg._path.childNodes[1];f.setAttribute("from",.5);f.setAttribute("to",0);f.setAttribute("stroke-opacity",0);f.beginElement();u._spiderLeg._path.setAttribute("stroke-opacity",0)}}setTimeout(function(){var e=0;for(a=s.length-1;a>=0;a--){u=s[a];if(u._spiderLeg){e++}}for(a=s.length-1;a>=0;a--){u=s[a];if(!u._spiderLeg){continue}if(u.setOpacity){u.setOpacity(1);u.setZIndexOffset(0)}if(e>1){r.removeLayer(u)}n.removeLayer(u._spiderLeg);delete u._spiderLeg}t._animationEnd()},200)}});L.MarkerClusterGroup.include({_spiderfied:null,_spiderfierOnAdd:function(){this._map.on("click",this._unspiderfyWrapper,this);if(this._map.options.zoomAnimation){this._map.on("zoomstart",this._unspiderfyZoomStart,this)}this._map.on("zoomend",this._noanimationUnspiderfy,this);if(L.Path.SVG&&!L.Browser.touch){this._map._initPathRoot()}},_spiderfierOnRemove:function(){this._map.off("click",this._unspiderfyWrapper,this);this._map.off("zoomstart",this._unspiderfyZoomStart,this);this._map.off("zoomanim",this._unspiderfyZoomAnim,this);this._unspiderfy()},_unspiderfyZoomStart:function(){if(!this._map){return}this._map.on("zoomanim",this._unspiderfyZoomAnim,this)},_unspiderfyZoomAnim:function(e){if(L.DomUtil.hasClass(this._map._mapPane,"leaflet-touching")){return}this._map.off("zoomanim",this._unspiderfyZoomAnim,this);this._unspiderfy(e)},_unspiderfyWrapper:function(){this._unspiderfy()},_unspiderfy:function(e){if(this._spiderfied){this._spiderfied.unspiderfy(e)}},_noanimationUnspiderfy:function(){if(this._spiderfied){this._spiderfied._noanimationUnspiderfy()}},_unspiderfyLayer:function(e){if(e._spiderLeg){this._featureGroup.removeLayer(e);e.setOpacity(1);e.setZIndexOffset(0);this._map.removeLayer(e._spiderLeg);delete e._spiderLeg}}})})(window,document)