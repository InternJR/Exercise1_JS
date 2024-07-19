let map;
let markers = [];

async function initMap() {
  console.log(document.documentElement.clientWidth, document.documentElement.clientHeight);
  try {
    const response = await fetch('locations.json');
    const locations = await response.json();
    const storeTypes = ['Cafe', 'Restaurant', 'Store'];
    const { Map, InfoWindow } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

    const centerPosition = { lat: 14.6012, lng: 120.9750 };
    

    map = new Map(document.getElementById("map"), {
      zoom: 15.5,
      center: centerPosition,
      mapId: 'DEMO_MAP_ID'
    });

    function getColorForRating(rating) {
      rating = Math.max(1, Math.min(5, rating));
      let r, g, b;
    
      if (rating < 4) {
        // Rating 1 to 4 (with increments of 0.5)
        r = Math.round(255 - (rating - 1) * (145 / 3)); // Red decreases from 255 to 110
        g = Math.round(230 - (rating - 1) * (80 / 3)); // Green slightly decreases from 230 to 150
        b = Math.round(50 + (rating - 1) * (150 / 3)); // Blue increases from 50 to 200
      } else {
        // Rating 4 to 5 (with increments of 0.2)
        r = Math.round(110 - (rating - 4) * (110 / 1)); // Red decreases from 110 to 0
        g = Math.round(150 + (rating - 4) * (105 / 1)); // Green increases from 150 to 255
        b = Math.round(200 - (rating - 4) * (200 / 1)); // Blue decreases from 200 to 0
      }
    
      return `rgb(${r}, ${g}, ${b})`;
    }
    
    

    function createLegendPanel() {
      const legendPanel = document.getElementById('legend-colors');
      legendPanel.innerHTML = '';
      for (let rating = 1; rating < 4; rating += 0.5) {
        const color = getColorForRating(rating);
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        legendItem.style.backgroundColor = color;
        legendItem.textContent = rating.toFixed(1);
        legendPanel.appendChild(legendItem);
      }
      for (let rating = 4.0; rating <= 5.1; rating += 0.2) {
        const color = getColorForRating(rating);
        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');
        legendItem.style.backgroundColor = color;
        legendItem.textContent = rating.toFixed(1);
        legendItem.style.color = 'black';
        legendPanel.appendChild(legendItem);
      }
    }

    createLegendPanel();
    const infoWindow = new InfoWindow();

    function getGlyphColor(shopType){
      switch(shopType){
        case "Cafe":
          return 'black';
          break;
        case "Restaurant":
          return 'red';
          break;
        case "Store":
          return 'white';
          break;
      }
    }
    var mc;
    function createMarkers(selectedTypes) {
      markers.forEach(marker => {
        marker.setMap(null);
        mc?.removeMarker(marker);
      });
      markers = [];
      Object.keys(locations).forEach(key => {
        if (selectedTypes.includes(locations[key].type)) {
          const pinGlyph = new PinElement({
            background: getColorForRating(locations[key].rating),
            glyphColor: getGlyphColor(locations[key].type),
            borderColor: getColorForRating(locations[key].rating)
          });
          const marker = new AdvancedMarkerElement({
            map: map,
            position: locations[key].location,
            content: pinGlyph.element,
            title: key,
            gmpClickable: true,
          });
          markers.push(marker);
          marker.addListener("click", ({ domEvent, latLng }) => {
            const { target } = domEvent;
            map.panTo(latLng);
            infoWindow.close();
            infoWindow.setContent(marker.title);
            infoWindow.open(marker.map, marker);
            displayMarkerInfo(key);
          });
        }
      });
      mc = new markerClusterer.MarkerClusterer({ markers, map });
      //console.log(mc);
    }

    function displayMarkerInfo(key) {
      const markerData = locations[key];
      const infoPanel = document.getElementById('info-panel');
      const markerInfo = document.getElementById('marker-info');
      markerInfo.innerHTML = `
  <table>
    <tr>
      <td><strong>Place:</strong></td>
      <td>${key}</td>
    </tr>
    <tr>
      <td><strong>Type:</strong></td>
      <td>${markerData.type}</td>
    </tr>
    <tr>
      <td><strong>Address:</strong></td>
      <td>${markerData.address}</td>
    </tr>
    <tr>
      <td><strong>Rating:</strong></td>
      <td>${markerData.rating}</td>
    </tr>
    <tr>
      <td><strong>URL:</strong></td>
      <td>${markerData.url ? `<a href="${markerData.url}" target="_blank">${markerData.url}</a>` : 'N/A'}</td>
    </tr>
  </table>
  <br>
  ${markerData.pwd ? '<p><strong>Wheelchair Accessible</strong></p>' : '<p><strong>Not Wheelchair Accessible</strong></p>'}
`;
      infoPanel.classList.add('visible');
    }

    const checkboxes = document.querySelectorAll('.mdc-checkbox__native-control');
        // Event listener for checkboxes
        checkboxes.forEach(checkbox => {
          checkbox.addEventListener('change', function() {
            const selectedTypes = [];
            checkboxes.forEach(cb => {
              if (cb.checked) {
                selectedTypes.push(cb.value);
              }
            });
            createMarkers(selectedTypes);
          });
        });
    
        // Initial markers for all store types
        createMarkers(storeTypes);
    
        // Add event listener for closing the info panel
        const closeInfoPanelButton = document.getElementById('close-info-panel');
        closeInfoPanelButton.addEventListener('click', () => {
          const infoPanel = document.getElementById('info-panel');
          infoPanel.classList.remove('visible');
        });
    
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
    
    initMap();
    

