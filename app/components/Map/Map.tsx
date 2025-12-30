"use client";

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix deafult marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AssetMarker {
    id: string;
    kodeSap: string;
    unit?: string;
    koordinatX: number;
    koordinatY: number;
    alamat?: string;
}

interface MapProps {
    markers: AssetMarker[];
    center?: [number, number];
    zoom?: number;
}

export default function Map({ markers, center = [-4.852055, 104.862938], zoom = 6 }: MapProps) {
    // Center map on Lampung by default based on seed data

    const towerIcon = new L.Icon({
        iconUrl: '/tower-marker.svg',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40],
    });

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full rounded-xl z-0">
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Street (Jalan)">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                </LayersControl.BaseLayer>

                <LayersControl.BaseLayer name="Satellite (Satelit)">
                    <TileLayer
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                </LayersControl.BaseLayer>
            </LayersControl>
            {markers.map((marker) => (
                <Marker key={marker.id} position={[marker.koordinatY, marker.koordinatX]} icon={towerIcon}>
                    <Popup>
                        <div className="text-sm">
                            <h3 className="font-bold text-pln-blue">{marker.kodeSap}</h3>
                            <p className="text-xs text-gray-500">{marker.unit}</p>
                            <p className="mt-1">{marker.alamat}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
