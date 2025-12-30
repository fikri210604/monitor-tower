"use client";

import { MapContainer, TileLayer, Marker, Popup, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { TowerControl } from "lucide-react";
import { renderToString } from "react-dom/server";

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

    // Debug: Log markers data
    console.log("📍 Map received markers:", markers.length);
    console.log("📍 First marker sample:", markers[0]);

    // Filter valid markers (must have both coordinates as numbers)
    const validMarkers = markers.filter(m => {
        const hasCoords = m.koordinatX && m.koordinatY;
        const isValid = typeof m.koordinatX === 'number' && typeof m.koordinatY === 'number';

        if (!hasCoords) {
            console.warn(`⚠️  Marker ${m.kodeSap} missing coordinates:`, m);
        } else if (!isValid) {
            console.warn(`⚠️  Marker ${m.kodeSap} has invalid coordinate types:`,
                typeof m.koordinatX, typeof m.koordinatY, m);
        }

        return hasCoords && isValid;
    });

    console.log(`✅ Valid markers to display: ${validMarkers.length}/${markers.length}`);
    if (validMarkers.length > 0) {
        console.log("📍 Sample valid marker:", validMarkers[0]);

        // Check coordinate ranges
        const xCoords = validMarkers.map(m => m.koordinatX);
        const yCoords = validMarkers.map(m => m.koordinatY);

        const xMin = Math.min(...xCoords);
        const xMax = Math.max(...xCoords);
        const yMin = Math.min(...yCoords);
        const yMax = Math.max(...yCoords);

        console.log("📊 Coordinate X range:", xMin, "to", xMax);
        console.log("📊 Coordinate Y range:", yMin, "to", yMax);
        console.log("📍 First 5 coordinates:", validMarkers.slice(0, 5).map(m =>
            `${m.kodeSap}: [${m.koordinatY}, ${m.koordinatX}]`
        ));
    }

    // Render TowerControl as HTML string for Leaflet DivIcon
    const towerIconHtml = renderToString(
        <TowerControl size={32} color="#0066cc" strokeWidth={2} />
    );

    const towerIcon = new L.DivIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center;">${towerIconHtml}</div>`,
        className: 'custom-tower-icon',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
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
            {validMarkers.map((marker) => (
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
