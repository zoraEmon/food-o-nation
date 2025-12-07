export interface ProgramData {
    title: string;
    description: string;
    date: string;
    maxParticipants: number;
    placeId: string;
}

export interface PlaceData {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    programs:string[]; // array of program ids
}