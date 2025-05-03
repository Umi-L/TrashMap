import { APIProvider, AdvancedMarker, Map, Pin, InfoWindow, MapMouseEvent, useMap } from '@vis.gl/react-google-maps';
import './App.css';
import { Typography, Box, Slider } from '@mui/material';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { RoutesApi } from './routes-api';
import Route from './components/Route';
import ControlPanel from './components/ControlPanel';
import TrashSetter from './components/TrashSetter';
import { getDaysUntilPickup } from './utils';

interface Position {
    lat: number;
    lng: number;
}

export interface TrashData {
    uuid: string; // Add UUID property
    lat: number;
    lng: number;
    percentFull: number;
    rateOfChangePerDay: number;
}

function App() {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    const position = {
        lat: 43.7232076085418,
        lng: -79.7251762551008,
    };

    const [trashLocations, setTrashLocations] = useState<TrashData[]>([
        { uuid: crypto.randomUUID(), lat: 43.684980, lng: -79.759302, percentFull: 0.5, rateOfChangePerDay: 0.1 },
        { uuid: crypto.randomUUID(), lat: 43.73334107421644, lng: -79.7459164175475, percentFull: 0.7, rateOfChangePerDay: 0.2 },
        { uuid: crypto.randomUUID(), lat: 43.703390066248154, lng: -79.75995007980336, percentFull: 0.3, rateOfChangePerDay: 0.1 },
    ]);

    const [startLocations, setStartLocations] = useState<Position[]>([
        { lat: 43.746766, lng: -79.711818 },
        { lat: 43.709175, lng: -79.801589 }
    ]);

    const [selectedMarker, setSelectedMarker] = useState<TrashData | null>(null);
    const [daysUntilNextPickup, setDaysUntilNextPickup] = useState<number>(5);

    const apiClient = new RoutesApi(apiKey);

    const routeOrigin = { ...startLocations[0] };
    const routeDestination = { ...startLocations[0] };

    const [route, setRoute] = useState<any>(null);
    const [originalRoute, setOriginalRoute] = useState<any>(null);

    const routeWaypoints = useMemo(() => trashLocations
        .filter((location) => {
            const daysUntilPickup = getDaysUntilPickup(location.percentFull, location.rateOfChangePerDay);
            return daysUntilPickup < daysUntilNextPickup; // Only include if it needs to be picked up
        })
        .map((location) => ({
            location: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng,
                },
            },
        })), [trashLocations, daysUntilNextPickup]);

    const routeOptions = useMemo(() => ({
        travelMode: 'DRIVE',
        computeAlternativeRoutes: false,
        units: 'METRIC',
        intermediates: routeWaypoints,
        optimizeWaypointOrder: true,
    }), [routeWaypoints]);

    const originalRouteOptions = useMemo(() => ({
        travelMode: 'DRIVE',
        computeAlternativeRoutes: false,
        units: 'METRIC',
        intermediates: trashLocations.map((location) => ({
            location: {
                latLng: {
                    latitude: location.lat,
                    longitude: location.lng,
                },
            },
        })),
        optimizeWaypointOrder: true,
    }), [trashLocations]);

    const handleMarkerClick = useCallback((location: Position) => {
        if (trashLocations.some((loc) => loc.lat == location.lat && loc.lng == location.lng)) {
            const selectedTrash = trashLocations.find((loc) => loc.lat === location.lat && loc.lng === location.lng);
            if (selectedTrash) {
                setSelectedMarker(selectedTrash);
            }
        }
    }, [trashLocations]);

    const handleMapClick = useCallback((event: MapMouseEvent) => {
        if (selectedMarker) {
            setSelectedMarker(null);
        } else {
            const newMarker = {
                uuid: crypto.randomUUID(), // Generate a new UUID
                lat: event.detail.latLng!.lat,
                lng: event.detail.latLng!.lng,
                percentFull: Math.random(),
                rateOfChangePerDay: Math.random() * 0.6,
            };

            setTrashLocations((prev) => [...prev, newMarker]);
        }
    }, [selectedMarker]);


    const trashPins = trashLocations.map((location, index) => {

        const daysUntilPickup = getDaysUntilPickup(location.percentFull, location.rateOfChangePerDay);

        const needsToBePickedUp = daysUntilPickup < daysUntilNextPickup;

        const pinColor = needsToBePickedUp ? undefined : 'var(--trash-inactive-color)';
        const pinBorderColor = needsToBePickedUp ? undefined : 'var(--trash-inactive-border-color)';

        return <AdvancedMarker
            key={index}
            position={location}
            title={`Trash Location ${index + 1}`}
            onClick={() => handleMarkerClick(location)}
        >
            <Pin
                scale={1}
                {...(pinColor && { background: pinColor })}
                {...(pinBorderColor && { borderColor: pinBorderColor })}
            >
                <Typography>
                    🗑️
                </Typography>
            </Pin>
        </AdvancedMarker>
    });

    useEffect(() => {
        console.log('Requesting route from API...');

        apiClient.computeRoutes(routeOrigin, routeDestination, routeOptions).then(res => {
            // we're only interested in the first result for this case
            const [tempRoute] = res.routes;

            console.log('Route received:', tempRoute);

            // store in state and trigger rerendering
            setRoute(tempRoute);

            // // fit map to the viewport returned from the API
            // const { high, low } = route.viewport;
            // const bounds: google.maps.LatLngBoundsLiteral = {
            //     north: high.latitude,
            //     south: low.latitude,
            //     east: high.longitude,
            //     west: low.longitude
            // };

            // map.fitBounds(bounds);
        });

        apiClient.computeRoutes(routeOrigin, routeDestination, originalRouteOptions).then(res => {
            // we're only interested in the first result for this case
            const [tempRoute] = res.routes;

            console.log('Original Route received:', tempRoute);

            // store in state and trigger rerendering
            setOriginalRoute(tempRoute);
        });

    }, [origin, routeOptions, originalRouteOptions]);

    return (
        <>
            <Box
                sx={{
                    height: '100vh',
                    margin: '0.5rem',
                    borderRadius: '8px',
                    overflow: 'hidden',
                }}
            >
                <Map
                    defaultCenter={position}
                    defaultZoom={13}
                    mapId="5404fe304501171"
                    disableDefaultUI
                    fullscreenControl={false}
                    clickableIcons={false}
                    onClick={handleMapClick}
                >

                    <Route
                        route={originalRoute}
                        appearance={{
                            walkingPolylineColor: '#000',
                            defaultPolylineColor: '#808080',
                            stepMarkerFillColor: '#808080',
                            stepMarkerBorderColor: '#000000'
                        }}
                        zIndex={0}
                    />

                    <Route
                        route={route}
                        appearance={{
                            walkingPolylineColor: '#000',
                            defaultPolylineColor: '#004dfe',
                            stepMarkerFillColor: '#0000d7',
                            stepMarkerBorderColor: '#000000'
                        }}
                        zIndex={1}
                    />


                    {trashPins}
                    {startLocations.map((location, index) => (
                        <AdvancedMarker
                            key={index}
                            position={location}
                            title={`Start Location ${index + 1}`}
                        >
                            <Pin scale={1.4} background={'var(--start-bg-color)'} borderColor={'var(--start-outline-color)'}>
                                <Typography>
                                    🚛
                                </Typography>
                            </Pin>
                        </AdvancedMarker>
                    ))}

                    {selectedMarker && (
                        <InfoWindow
                            position={selectedMarker}
                            onCloseClick={() => setSelectedMarker(null)}
                            style={{
                                overflow: 'hidden',
                            }}
                        >
                            <Box sx={{ padding: '1rem' }}>
                                <TrashSetter
                                    selectedMarker={selectedMarker}
                                    setTrashLocations={setTrashLocations}
                                    setSelectedMarker={setSelectedMarker}
                                />
                            </Box>
                        </InfoWindow>
                    )}
                </Map>
                <ControlPanel
                    route={route}
                    originalRoute={originalRoute}
                    daysUntilNextPickup={daysUntilNextPickup}
                    setDaysUntilNextPickup={setDaysUntilNextPickup}
                />
            </Box >
        </>
    );
}

export default App;
