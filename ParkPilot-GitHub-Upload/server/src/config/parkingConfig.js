export const PARKING_SLOT_DEFINITIONS = (() => {
  const disabledSlots = new Set([8, 17, 32, 48, 63]);
  const accessibleSlots = new Set([6, 21, 22, 23, 38, 54]);
  const nearBuildingSlots = new Set([1, 2, 3, 4, 5, 6, 21, 22, 23, 24]);
  const definitions = [];

  for (let number = 1; number <= 68; number += 1) {
    const zone = number <= 24 ? "A" : number <= 48 ? "B" : "C";
    definitions.push({
      number,
      zone,
      isDisabled: disabledSlots.has(number),
      type: accessibleSlots.has(number) ? "accessible" : "standard",
      nearBuilding: nearBuildingSlots.has(number),
    });
  }

  return definitions;
})();

export const PARKING_SLOT_MAP = new Map(
  PARKING_SLOT_DEFINITIONS.map((slot) => [slot.number, slot])
);

export const VEHICLE_RATES_PER_HOUR = {
  Bike: 20,
  Car: 40,
  SUV: 60,
  Truck: 80,
};

export const BOOKING_ACTIVE_STATUSES = ["pending", "active"];
