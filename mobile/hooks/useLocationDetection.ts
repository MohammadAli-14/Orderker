import * as Location from "expo-location";
import { useState } from "react";
import { Alert } from "react-native";

export interface DetectedLocation {
    zone: string;
    area: string;
    city: string; // The raw detected city
    isServiceable: boolean; // Whether it matches our delivery zones
    address?: string;
}

// Orderker Zone/Area Data for mapping
const ZONES = [
    "Malir",
    "Karachi East",
    "Karachi West",
    "Karachi South",
    "Karachi Central",
    "Korangi",
];

const AREAS: { [key: string]: string[] } = {
    "Malir": ["Malir Cantt", "Shah Faisal Colony", "Landhi", "Quaidabad"],
    "Karachi East": ["Gulshan-e-Iqbal", "Gulistan-e-Johar", "PECHS", "Scheme 33"],
    "Karachi West": ["Orangi Town", "SITE", "Baldia Town", "Manghopir"],
    "Karachi South": ["Clifton", "Defence", "Saddar", "Garden"],
    "Karachi Central": ["Gulberg", "North Nazimabad", "Liaquatabad", "New Karachi"],
    "Korangi": ["Korangi Industrial", "Landhi Industrial", "Shah Faisal", "Model Colony"],
};

export const useLocationDetection = () => {
    const [loading, setLoading] = useState(false);

    /**
     * Map reverse geocoded address to internal Orderker Zones and Areas
     */
    const mapAddressToZone = (address: Location.LocationGeocodedAddress): DetectedLocation => {
        const { district, subregion, city, street, name } = address;

        console.log("📍 Geocoded Address Details:", { district, subregion, city, street, name });

        // Step 1: Try to match District to Zone directly
        let detectedZone = ZONES.find(z =>
            district?.toLowerCase().includes(z.toLowerCase()) ||
            subregion?.toLowerCase().includes(z.toLowerCase())
        ) || "";

        // Step 2: Try to match Subregion to Area
        let detectedArea = "";
        if (detectedZone) {
            const possibleAreas = AREAS[detectedZone];
            detectedArea = possibleAreas.find(a =>
                subregion?.toLowerCase().includes(a.toLowerCase()) ||
                street?.toLowerCase().includes(a.toLowerCase())
            ) || possibleAreas[0]; // Fallback to first area in zone
        } else {
            // Step 3: Deep search all areas if zone wasn't found
            for (const zone in AREAS) {
                const area = AREAS[zone].find(a =>
                    subregion?.toLowerCase().includes(a.toLowerCase()) ||
                    district?.toLowerCase().includes(a.toLowerCase())
                );
                if (area) {
                    detectedZone = zone;
                    detectedArea = area;
                    break;
                }
            }
        }

        // Final Fallbacks
        const hasZone = !!detectedZone;

        // If outside Karachi, we'll use the city as the Zone and street/district as the Area
        // This allows developers in other cities to test the live detection properly.
        if (!hasZone) {
            detectedZone = city || subregion || "Outside Karachi";
            detectedArea = street || name || district || "General Area";
        } else if (!detectedArea) {
            detectedArea = AREAS[detectedZone][0];
        }

        return {
            zone: detectedZone,
            area: detectedArea,
            city: city || "Unknown",
            isServiceable: hasZone,
            address: `${street || name}, ${subregion || district}, ${city}`
        };
    };

    const detectLocation = async (): Promise<DetectedLocation | null> => {
        setLoading(true);
        try {
            // Check permissions
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "We need location access to find delivery zones near you. Please enable it in settings."
                );
                return null;
            }

            // Get coordinates (single grab, high accuracy)
            const position = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Reverse geocode
            const geocode = await Location.reverseGeocodeAsync({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });

            if (geocode && geocode.length > 0) {
                return mapAddressToZone(geocode[0]);
            }

            return null;
        } catch (error) {
            console.error("💥 Error detecting location:", error);
            Alert.alert("Error", "Failed to detect your location. Please try selecting manually.");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { detectLocation, loading };
};
