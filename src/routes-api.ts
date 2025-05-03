const baseFields = ['routes.viewport', 'routes.legs', 'routes.polylineDetails'];

const ROUTES_API_ENDPOINT = 'https://routes.googleapis.com/directions/v2:computeRoutes';
export class RoutesApi {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async computeRoutes(
        from: google.maps.LatLngLiteral,
        to: google.maps.LatLngLiteral,
        options: any
    ) {
        const fields = [...baseFields];

        // Add the required field if optimize_waypoint_order is true
        fields.push('routes.optimized_intermediate_waypoint_index');

        const routeRequest = {
            origin: {
                location: { latLng: { longitude: from.lng, latitude: from.lat } }
            },
            destination: {
                location: { latLng: { longitude: to.lng, latitude: to.lat } }
            },
            ...options
        };

        const url = new URL(ROUTES_API_ENDPOINT);
        url.searchParams.set('fields', fields.join(','));
        const fieldMask = fields.join(',');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'X-Goog-Api-Key': this.apiKey,
                'X-Goog-FieldMask': fieldMask,
            },
            body: JSON.stringify(routeRequest)
        });

        if (!response.ok) {
            console.error(response);
            throw new Error(
                `Request failed with status: ${response.status} - ${response.statusText}`
            );
        }

        return await response.json();
    }
}
