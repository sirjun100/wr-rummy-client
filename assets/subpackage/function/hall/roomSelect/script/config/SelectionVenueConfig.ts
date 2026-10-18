export const SelectionVenueBundleName = "selectionVenue";

export const CatalogStorageKey = "commRoomData";

/** Legacy gameType: 0 cash, 1 match, 2 buddy, 3 practice/chips */
export enum SelectionGameType {
    Cash = 0,
    Match = 1,
    Buddy = 2,
    Practice = 3,
}

/** Legacy HowToPlayDefined rummy types */
export enum SelectionRummyType {
    Points = 0,
    Pool = 1,
    Deals = 2,
    Multiple = 3,
}

/** Points sub-mode on room rows */
export enum SelectionPointsMode {
    Classic = 1,
    Bump = 3,
    Multiple = 3,
    Double6 = 5,
}

export const SelectionVenueRoute = {
    HallRoomCatalog: 1033,
} as const;
