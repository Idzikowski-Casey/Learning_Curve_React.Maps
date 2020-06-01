import React, { Component } from "react";
import axios from "axios";
import {
  ComposableMap,
  Geographies,
  Geography,
  Sphere,
  Marker,
} from "react-simple-maps";

const markers = [];

const geoUrl =
  "https://raw.githubusercontent.com/zcreativelabs/react-simple-maps/master/topojson-maps/world-110m.json";

class MapChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
    };
  }

  componentDidMount() {
    axios
      .get(`https://sparrow-data.org/labs/wiscar/api/v1/sample?all=1`)
      .then((res) => {
        const data = res.data;
        this.setState({ data });
      });
  }

  render() {
    return (
      <ComposableMap projectionConfig={{ scale: 147 }}>
        <Sphere stroke="#FF5533" strokeWidth={2} />
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography key={geo.rsmKey} geography={geo} />
            ))
          }
        </Geographies>
          {this.state.data.map(({name, coordinates}) => <Marker key={name} coordinates={coordinates}>
          <circle r={10} fill="#F00" stroke="#fff" strokeWidth={2} />
          </Marker>)}
        {/* {markers.map(({ name, coordinates}) => (
        <Marker key={name} coordinates={coordinates}>
          <circle r={10} fill="#F00" stroke="#fff" strokeWidth={2} />
        
        </Marker> */}
      </ComposableMap>
    );
  }
}

export default MapChart;
