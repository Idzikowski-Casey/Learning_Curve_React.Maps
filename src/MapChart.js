import React, { useState, useEffect, useRef } from "react";
import MapGl, { Marker, Popup, FlyToInterpolator } from "react-map-gl";
import { Popover, Tooltip, Position, Button, Classes } from "@blueprintjs/core";
import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";
import Tippy from "@tippy.js/react";
import useSuperCluster from "use-supercluster";
import classNames from "classnames";

function MapChart() {
  const [markers, setMarkers] = useState([]);
  const [viewport, setViewport] = useState({
    latitude: 45,
    longitude: 75,
    width: "100vw",
    height: "100vh",
    zoom: 1,
  });

  const mapRef = useRef();

  const [selectedSample, setSelectedSample] = useState(null);

  useEffect(() => {
    getMarkers();
  }, []);

  async function getMarkers() {
    const response = await fetch(
      "https://sparrow-data.org/labs/wiscar/api/v1/sample?all=1"
    );
    const markers = await response.json();
    setMarkers(markers);
  }

  const mapMarkers = markers.filter((d) => d.geometry != null);

  const points = mapMarkers.map((markers) => ({
    type: "Feature",
    properties: {
      cluster: false,
      id: markers.id,
      Sample_name: markers.name,
      project_name: markers.prpject_name,
    },
    geometry: {
      type: "Point",
      coordinates: [
        markers.geometry.coordinates[0],
        markers.geometry.coordinates[1],
      ],
    },
  }));

  // get map bounds using map ref
  const bounds = mapRef.current
    ? mapRef.current.getMap().getBounds().toArray().flat()
    : null;

  // get clusters
  const { clusters, supercluster } = useSuperCluster({
    points,
    zoom: viewport.zoom,
    bounds,
    options: { radius: 75, maxZoom: 5 },
  });



  const clusterClass = classNames({
    "cluster-marker": points.length < 50,
    "cluster-markerRed": points.length >+ 50
  })

  return (
    <div>
      <MapGl
        {...viewport}
        mapboxApiAccessToken={
          "pk.eyJ1IjoiY2FzZXktaWR6IiwiYSI6ImNrYjcyZ3ZydzAxbDIycnBkemcycGx0am4ifQ.VXQmbOI-mi0zAXZlNqbRLw"
        }
        onViewportChange={(viewport) => {
          setViewport(viewport);
        }}
        ref={mapRef}
      >
        {clusters.map((cluster) => {
          const [longitude, latitude] = cluster.geometry.coordinates;
          const {
            cluster: isCluster,
            point_count: pointCount,
          } = cluster.properties;

          const clusterClass = classNames({
            "cluster-marker": pointCount < 50,
            "cluster-markerGreen": pointCount >= 50 && pointCount < 100,
            "cluster-markerYellow": pointCount >= 100 && pointCount < 200,
            "cluster-markerRed": pointCount >= 200,
          })

          if (isCluster) {
            return (
              <Marker
                key={cluster.id}
                longitude={longitude}
                latitude={latitude}
              >
                <div
                  className={clusterClass}
                  style={{
                    width: `${10 + (pointCount / points.length) * 150}px`,
                    height: `${10 + (pointCount / points.length) * 150}px`,
                  }}
                  onClick={() => {
                    const expansionZoom = Math.min(
                      supercluster.getClusterExpansionZoom(cluster.id),
                      5
                    );
                    setViewport({
                      ...viewport,
                      longitude,
                      latitude,
                      zoom: expansionZoom,
                      transitionInterpolator: new FlyToInterpolator({
                        speed: 1,
                      }),
                      transitionDuration: "auto",
                    });
                  }}
                >
                  {pointCount}
                </div>
              </Marker>
            );
          }

          return (
            <Marker
              key={cluster.properties.id}
              latitude={latitude}
              longitude={longitude}
            >
              <Tippy content={cluster.properties.Sample_name}>
                <button
                  className="mrker-btn"
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedSample(cluster);
                  }}
                >
                  <img src="/logo.svg" alt="Generic Icon" />
                </button>
              </Tippy>
            </Marker>
          );
        })}

        {selectedSample ? (
          <Popup
            latitude={selectedSample.geometry.coordinates[1]}
            longitude={selectedSample.geometry.coordinates[0]}
            onClose={() => {
              setSelectedSample(null);
            }}
          >
            <div>
              <p> Sample Name: {selectedSample.properties.Sample_name}</p>
              <p>{selectedSample.properties.project_name}</p>
            </div>
          </Popup>
        ) : null}
      </MapGl>
    </div>
  );
}

export default MapChart;
