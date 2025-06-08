export const config = {
  googleMapsApiKey: 'AIzaSyBWXNE96Eb23e16DCw7Zfb9rkYwxRiTUfQ',
  apiEndpoints: {
    auth: 'https://auth.tomsk-center.ru',
    search: 'https://search.tomsk-center.ru',
    photo: 'https://dsam.tomsk-center.ru',
    chat: 'https://chat.tomsk-center.ru'
  },
  defaultLocation: {
    lat: 56.484626,
    lng: 84.947772
  },
  mapOptions: {
    zoom: 12,
    center: { lat: 56.484626, lng: 84.947772 }, // Томск
    styles: [
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'labels.text',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }
}

export default config
