import { TrashData } from "./App";

export function getDaysUntilPickup(percentFull: number, rateOfChangePerDay: number): number {

    // days until pickup using rate of change with buffer
    const buffer = 0.1; // 10% buffer
    let daysUntilPickup = Math.round((1 - percentFull - buffer) / rateOfChangePerDay);

    if (daysUntilPickup < 0) {
        daysUntilPickup = 0;
    }

    if (rateOfChangePerDay === 0) {
        daysUntilPickup = Infinity; // No change, so never needs pickup
    }

    if (percentFull >= 1 - buffer) {
        daysUntilPickup = 0;
    }

    return daysUntilPickup;
}