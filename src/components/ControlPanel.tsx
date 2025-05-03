import { Box, Slider, Typography } from '@mui/material';
import * as React from 'react';

function secondsToTime(seconds: number) {
    // convert to most reasonable time unit string
    if (seconds < 60) {
        return `${seconds} second(s)`;
    } else if (seconds < 3600) {
        return `${Math.floor(seconds / 60)} minute(s)`;
    } else {
        return `${(seconds / 3600).toFixed(1)} hour(s)`;
    }
}

function estimateEmissions(seconds: number): number {
    if (seconds < 0) {
        throw new Error('Runtime must be non-negative');
    }
    // Average diesel idling fuel consumption (gallons per hour)
    const idleFuelConsumptionGalPerHour = 0.44;
    // CO₂ emissions factor (kg CO₂ per gallon of diesel)
    const co2PerGallon = 10.18;
    // Convert consumption to gallons per second
    const gallonsPerSecond = idleFuelConsumptionGalPerHour / 3600;
    // Calculate and return emissions in kg
    return seconds * gallonsPerSecond * co2PerGallon;
}

interface ControlPanelProps {
    route: any;
    originalRoute: any;
    daysUntilNextPickup: number;
    setDaysUntilNextPickup: (value: number) => void;
}

function getRouteDistanceAndTime(route: any): { distance: number; time: number } {
    let distance = 0; // in meters
    let time = 0; // in seconds
    // for every leg in route
    route?.legs?.forEach((leg: any) => {
        distance += leg.distanceMeters;
        time += parseFloat(leg.duration.toString().replace(/[^0-9.]/g, ''));
    });
    return { distance, time };
}

function ControlPanel({ route, originalRoute, daysUntilNextPickup, setDaysUntilNextPickup }: ControlPanelProps) {

    console.log('ControlPanel', route);

    const newRouteDistanceAndTime = React.useMemo(() => getRouteDistanceAndTime(route), [route]);
    const originalRouteDistanceAndTime = React.useMemo(() => getRouteDistanceAndTime(originalRoute), [originalRoute]);

    return (
        <Box className="control-panel" flexDirection="column" gap={2} padding="1rem" justifyContent={"start"}>
            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                Optimized Garbage Route Visualization
            </Typography>
            <Typography>
                Click anywhere on the map to add a bin location. Click on a bin to edit its properties.
            </Typography>

            <Typography>
                Days until next pickup: {daysUntilNextPickup}
            </Typography>

            <Box
                sx={{
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                }}
            >
                <Slider
                    value={daysUntilNextPickup}
                    min={1}
                    max={10}
                    step={1}
                    onChange={(event, newValue) => {
                        setDaysUntilNextPickup(newValue as number);
                    }}
                />
            </Box>

            <br />


            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                Old Route Information
            </Typography>
            <Typography>
                Estimated distance: {originalRouteDistanceAndTime.distance ?? 'N/A'}m
            </Typography>
            <Typography>
                Estimated duration: {secondsToTime(originalRouteDistanceAndTime.time) ?? 'N/A'}
            </Typography>
            <Typography>
                Estimated carbon emissions: {Math.round(estimateEmissions(originalRouteDistanceAndTime.time) * 100) / 100}kg CO₂
            </Typography>

            <br />

            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                Optimized Route Information
            </Typography>
            <Typography>
                Estimated distance: {newRouteDistanceAndTime.distance ?? 'N/A'}m
            </Typography>
            <Typography>
                Estimated duration: {secondsToTime(newRouteDistanceAndTime.time) ?? 'N/A'}
            </Typography>
            <Typography>
                Estimated carbon emissions: {Math.round(estimateEmissions(newRouteDistanceAndTime.time) * 100) / 100}kg CO₂
            </Typography>

            <br />
            <Typography variant='h5' sx={{ marginBottom: '0.5rem' }}>
                Savings
            </Typography>

            <Typography>
                Carbon savings: {Math.round((estimateEmissions(originalRouteDistanceAndTime.time) - estimateEmissions(newRouteDistanceAndTime.time)) * 100) / 100}kg CO₂
            </Typography>
        </Box >
    );
}

export default ControlPanel;