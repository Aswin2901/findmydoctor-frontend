import React from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "100vh",
};

const position = { lat: 53.54, lng: 10 };

export default function Intro() {
  return (
    <LoadScript googleMapsApiKey={process.env.GOOGLE_MAPS_API_KEY}>
      <GoogleMap mapContainerStyle={mapContainerStyle} center={position} zoom={9}>
        <Marker position={position} />
      </GoogleMap>
    </LoadScript>
  );
}
