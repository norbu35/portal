const getGeocode = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}): Promise<google.maps.GeocoderResponse> => {
  return new Promise((resolve, reject) => {
    if (!latitude || !longitude) reject(new Error('Incorrect GPS coordinates'));

    const fetchGeocode = async () => {
      const apiKey = process.env.NEXT_PUBLIC_MAPS_API;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          reject(Error('Error fetching from Google Maps API'));
        }
        const data = await response.json();
        if (data.error_message) {
          reject(Error(data.error_message));
        }
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };

    fetchGeocode();
  });
};

export default getGeocode;
