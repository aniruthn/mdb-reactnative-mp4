import * as firebase from 'firebase';

export interface GeoFenceModel {
    name: string;
    coordinates: firebase.firestore.GeoPoint;
    radius: number;
}

export interface UserModel {
    email: string,
    name: string,
    notificationToken: string,
    settings: {
        locationTrackingOn: boolean,
        pushNotificationsOn: boolean
    },
    protectedRegions: [GeoFenceModel]
}

export interface MapRegion {
    
}