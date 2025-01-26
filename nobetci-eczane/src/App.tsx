import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

function App() {
  const [pharmacies, setPharmacies] = useState([]);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getData = async () => {
    try {
      const response = await axios.get(
        `https://api.collectapi.com/health/dutyPharmacy?il=Ankara`,
        {
          headers: {
            authorization: "apikey 6MJXlgtLId3xQhPADAZJU1:5CmZVc4twnvCnROloYfCcq",
            "content-type": "application/json",
          },
        }
      );
      setPharmacies(response.data.result);
    } catch (err) {
      console.error(err);
      setError("Veri çekilirken bir hata oluştu.");
    }
  };

  useEffect(() => {
    // Kullanıcı konumunu al
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Konum alınamadı:", error);
        }
      );
    }

    getData();
  }, []);

  const openAllPharmaciesMap = () => {
    // Tüm eczanelerin konumlarını URL'de birleştirme
    const markers = pharmacies
      .map((pharmacy, index) => {
        const [lat, lon] = pharmacy.loc.split(",");
        return `marker=${lat},${lon}&name=${encodeURIComponent(pharmacy.name)}`;
      })
      .join("&");

    // OpenStreetMap'te merkezi konum olarak Ankara'yı kullanma
    window.open(
      `https://www.openstreetmap.org/?mlat=39.9334&mlon=32.8597&zoom=11&${markers}`,
      "_blank"
    );
  };

  const mapState = {
    center: [39.9334, 32.8597],
    zoom: 11
  };

  // Filtrelenmiş eczaneleri hesapla
  const filteredPharmacies = pharmacies.filter(pharmacy =>
    pharmacy.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="App">
      <h1>Ankara Nöbetçi Eczaneleri</h1>
      
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Harita</h2>
      <YMaps query={{ lang: 'tr_TR' }}>
        <Map
          defaultState={mapState}
          width="100%"
          height="600px"
        >
          {/* Eczane konumları */}
          {pharmacies.map((pharmacy, index) => {
            const [lat, lng] = pharmacy.loc.split(",").map(Number);
            return (
              <Placemark
                key={index}
                geometry={[lat, lng]}
                properties={{
                  hintContent: pharmacy.name,
                  balloonContent: `
                    <strong>${pharmacy.name}</strong><br/>
                    ${pharmacy.address}<br/>
                    Tel: ${pharmacy.phone}
                  `,
                  iconCaption: pharmacy.name
                }}
                options={{
                  preset: 'islands#redMedicalIcon',
                  openBalloonOnClick: true
                }}
              />
            );
          })}

          {/* Kullanıcı konumu */}
          {userLocation && (
            <Placemark
              geometry={[userLocation.lat, userLocation.lng]}
              properties={{
                hintContent: 'Sizin Konumunuz',
                balloonContent: 'Şu an buradasınız',
                iconCaption: 'Konumunuz'
              }}
              options={{
                preset: 'islands#blueCircleDotIcon',
                openBalloonOnClick: true
              }}
            />
          )}
        </Map>
      </YMaps>

      {/* Arama input'u */}
      <div style={{ margin: "20px 0" }}>
        <input
          type="text"
          placeholder="Eczane adı ile ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "8px 12px",
            width: "300px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <table border="1" style={{ width: "100%", textAlign: "left", marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Eczane Adı</th>
            <th>İlçe</th>
            <th>Adres</th>
            <th>Telefon</th>
            <th>Konum</th>
          </tr>
        </thead>
        <tbody>
          {filteredPharmacies?.map((pharmacy, index) => (
            <tr key={index}>
              <td>{pharmacy.name}</td>
              <td>{pharmacy.dist}</td>
              <td>{pharmacy.address}</td>
              <td>{pharmacy.phone}</td>
              <td>
                <button
                  onClick={() =>
                    window.open(
                      `https://www.openstreetmap.org/?mlat=${pharmacy.loc.split(",")[0]}&mlon=${pharmacy.loc.split(",")[1]}&zoom=15`,
                      "_blank"
                    )
                  }
                  style={{
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                  }}
                >
                  Haritada Göster
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ 
        marginTop: "30px",
        width: "95%",
        maxWidth: "1400px",
        margin: "30px auto",
        padding: "20px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: "8px"
      }}>
     
      </div>
    </div>
  );
}

export default App;
