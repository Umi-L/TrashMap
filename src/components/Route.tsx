import React, { useEffect, useState } from 'react';
import {
    AdvancedMarker,
    AdvancedMarkerAnchorPoint,
    useMap
} from '@vis.gl/react-google-maps';

import { Polyline } from './Polyline';
import { RoutesApi } from '../routes-api';

const defaultAppearance = {
    walkingPolylineColor: '#000000',
    defaultPolylineColor: '#9a1e45',
    stepMarkerFillColor: '#333333',
    stepMarkerBorderColor: '#000000'
};

type Appearance = typeof defaultAppearance;

export type RouteProps = {
    appearance?: Partial<Appearance>;
    route?: any;
    zIndex?: number; // Add zIndex prop
};

const Route = (props: RouteProps) => {
    const { route, zIndex = 1 } = props; // Default zIndex to 1

    if (!route) return null;

    const appearance = { ...defaultAppearance, ...props.appearance };

    // Iterate over all legs in the route
    const polylines = route.legs.flatMap((leg: { steps: any[] }, legIndex: number) => {
        return leg.steps.map((step, stepIndex) => {
            const isWalking = step.travelMode === 'WALK';
            const color = isWalking
                ? appearance.walkingPolylineColor
                : (step?.transitDetails?.transitLine?.color ??
                    appearance.defaultPolylineColor);

            return (
                <Polyline
                    key={`${legIndex}-${stepIndex}-polyline`}
                    encodedPath={step.polyline.encodedPolyline}
                    strokeWeight={isWalking ? 2 : 6}
                    strokeColor={color}
                    zIndex={zIndex} // Apply zIndex to Polyline
                />
            );
        });
    });

    const stepMarkerStyle = {
        backgroundColor: appearance.stepMarkerFillColor,
        borderColor: appearance.stepMarkerBorderColor,
        width: 8,
        height: 8,
        border: `1px solid`,
        borderRadius: '50%'
    };

    // Iterate over all legs to create markers for each step
    const stepMarkers = route.legs.flatMap((leg: any, legIndex: number) => {
        return leg.steps.slice(1).map((step: any, stepIndex: number) => {
            const position = {
                lat: step.startLocation.latLng.latitude,
                lng: step.startLocation.latLng.longitude
            };

            return (
                <AdvancedMarker
                    key={`${legIndex}-${stepIndex}-start`}
                    anchorPoint={AdvancedMarkerAnchorPoint.CENTER}
                    position={position}
                    zIndex={zIndex}> {/* Apply zIndex to AdvancedMarker */}
                    <div style={stepMarkerStyle} />
                </AdvancedMarker>
            );
        });
    });

    return (
        <>
            {polylines}
            {stepMarkers}
        </>
    );
};

export default React.memo(Route);