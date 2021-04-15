# MP4: Pear-L

_Objective_: An application that takes locations of where users are going and where they are leaving from to pair them up accordingly.

## Features:
* Allow the user to select locations from a map and record it as their destination
* Automatically query the current location of the user, registering it as the start
* Initiate a request for other users to report the same information
* Once request has been met (there is another user following the same path), then there is a push notification to both allowing them to accept and start their path, resolving the request.

## Implementation Details:
* Use geoFirestore npm library to handle location data
* Use Express and Expo Notifications to handle pushing the notifications
* Each user will have a push notification token

## Screens:
### Main
* Main screen that has a place to put inputs (hardcoded at first)
    * To be replaced with a MapView component and interactive capabilities to select a location with automatic retrieval of current location

