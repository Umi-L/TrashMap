import React from 'react';
import { Typography, Slider } from '@mui/material';
import { getDaysUntilPickup } from '../utils';

interface TrashSetterProps {
    selectedMarker: {
        uuid: string;
        percentFull: number;
        rateOfChangePerDay: number;
    } | null;
    setTrashLocations: React.Dispatch<React.SetStateAction<any[]>>;
    setSelectedMarker: React.Dispatch<React.SetStateAction<any | null>>;
}

const TrashSetter: React.FC<TrashSetterProps> = ({ selectedMarker, setTrashLocations, setSelectedMarker }) => {

    const [percentFull, setPercentFull] = React.useState<number>(selectedMarker ? selectedMarker.percentFull : 0);
    const [rateOfChangePerDay, setRateOfChangePerDay] = React.useState<number>(selectedMarker ? selectedMarker.rateOfChangePerDay : 0);

    if (!selectedMarker) {
        return null;
    }

    const handleSliderChangeCommitted = (key: 'percentFull' | 'rateOfChangePerDay', newValue: number) => {
        setTrashLocations((prev) =>
            prev.map((location) =>
                location.uuid === selectedMarker.uuid
                    ? { ...location, [key]: newValue }
                    : location
            )
        );
        setSelectedMarker((prev: any) =>
            prev ? { ...prev, [key]: newValue } : null
        );
    };

    const daysUntilPickup = getDaysUntilPickup(percentFull, rateOfChangePerDay);

    return (
        <div>
            <Typography variant="h6">
                Needs to be picked up {daysUntilPickup === Infinity ? 'never' : daysUntilPickup === 0 ? 'now' : `in ${daysUntilPickup} day(s)`}
            </Typography>

            <Typography>Percent Full: {Math.round(percentFull * 100)}%</Typography>
            <Slider
                value={percentFull}
                min={0}
                max={1}
                step={0.01}
                onChange={(event, newValue) => {
                    setPercentFull(newValue as number);
                }}
                onChangeCommitted={(event, newValue) => {
                    handleSliderChangeCommitted('percentFull', newValue as number);
                }}
            />

            <Typography>Rate of Change per Day: {Math.round(rateOfChangePerDay * 100)}%</Typography>
            <Slider
                value={rateOfChangePerDay}
                min={0}
                max={1}
                step={0.01}
                onChange={(event, newValue) => {
                    setRateOfChangePerDay(newValue as number);
                }}
                onChangeCommitted={(event, newValue) => {
                    handleSliderChangeCommitted('rateOfChangePerDay', newValue as number);
                }}
            />
        </div>
    );
};

export default TrashSetter;