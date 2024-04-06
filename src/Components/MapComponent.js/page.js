// components/DrawModifyMap.js
import { Fill, Stroke, Circle as CircleStyle, Style, Icon } from 'ol/style';

import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import { Draw, Modify, Snap } from 'ol/interaction';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { get } from 'ol/proj';
import { fromLonLat } from 'ol/proj';
import axios from 'axios';
import "./mapcompo.css"
import { RotatingLines } from 'react-loader-spinner';

const MapComponent = () => {
    const [typestring, settype] = useState("Point")
    const [isloading, setisloading] = useState(false)
    const [latlng, setlatlng] = useState([])




    // async function getLocationName(latitude, longitude) {
    //     try {
    //         // Convert latitude and longitude to OpenLayers projection
    //         const coordinates = fromLonLat([longitude, latitude]);

    //         // Make a request to OSM Nominatim reverse geocoding API
    //         const response = await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${longitude}&lon=${latitude}&format=json`);


    //         console.log("jkljg", response, latitude)
    //         if (response.data && response.data.display_name) {

    //             return response.data.display_name;
    //         } else {
    //             return 'Location name not found';
    //         }
    //     } catch (error) {
    //         console.error('Error:', error);
    //         return 'Error occurred while fetching location name';
    //     }
    // }

    function calculateArea(latlngArr) {
        const earthRadius = 6371e3; // Earth's radius in meters
        const numPoints = latlngArr.length;

        let area = 0;

        for (let i = 0; i < numPoints; i++) {
            const j = (i + 1) % numPoints;
            const lat1 = latlngArr[i][0] * Math.PI / 180;
            const lat2 = latlngArr[j][0] * Math.PI / 180;
            const deltaLat = lat2 - lat1;
            const deltaLng = (latlngArr[j][1] - latlngArr[i][1]) * Math.PI / 180;

            const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = earthRadius * c;

            area += distance;
        }

        // Return the absolute value of the area
        return Math.abs(area);
    }

    // Example usage:
    const latlngArr = [[40.7128, -74.0060], [34.0522, -118.2437], [29.7604, -95.3698]]; // Example latlng array
    const areaCovered = calculateArea(latlngArr);
    console.log('Area covered:', areaCovered, 'square meters');



    useEffect(() => {
        setisloading(true)
        setTimeout(() => {
            setisloading(false)
        }, 300)
    }, [])


    const mapContainer = useRef(null);




    useEffect(() => {

        const raster = new TileLayer({
            source: new OSM(),
        });

        const source = new VectorSource();
        const vector = new VectorLayer({
            source: source,
            style: (typestring === "Point") ? new Style({
                image: new Icon({
                    src: '/placeholder.png',
                    scale: 0.1,
                }),
            }) : function (feature) {


                return new Style({
                    fill: new Fill({
                        color: 'rgba(255, 255, 255, 0.2)',
                    }),
                    stroke: new Stroke({
                        color: '#ffcc33',
                        width: 2,
                    }),
                    image: new CircleStyle({
                        radius: 7,
                        fill: new Fill({
                            color: '#ffcc33',
                        }),
                    }),
                });
            },
        });

        const extent = get('EPSG:3857').getExtent().slice();
        extent[0] += extent[0];
        extent[2] += extent[2];

        const map = new Map({
            layers: [raster, vector],
            target: mapContainer.current,
            view: new View({
                center: [-11000000, 4600000],
                zoom: 4,
                extent,
            }),
        });

        map.on('click', async (event) => {
            const coordinates = event.coordinate;
            // const res = await getLocationName(coordinates[0], coordinates[1])
            // console.log(res)
            setlatlng(coordinates);
        });

        const modify = new Modify({ source: source });
        map.addInteraction(modify);

        let draw, snap;

        function addInteractions() {
            draw = new Draw({
                source: source,
                // type: 'Polygon', // Default to Polygon
                type: typestring
            });
            map.addInteraction(draw);
            snap = new Snap({ source: source });
            map.addInteraction(snap);
        }

        addInteractions();

        return () => {
            map.setTarget(null);
        };

    }, [typestring]);

    return (
        <section style={{ width: '100%', height: '80vh' }}>
            <form className='selecttype'>
                <label for="type">Geometry type &nbsp;</label>
                <select id="type" onChange={(e) => settype(e.target.value)}>
                    <option value="Point">Point</option>
                    <option value="LineString">LineString</option>
                    <option value="Polygon">Polygon</option>
                    {/* <option value="Circle">Circle</option> */}
                </select>
            </form>
            <div ref={mapContainer} className="map" />
            <div>lattitude:{latlng[0]} and Longitude:{latlng[1]}</div>

            {
                isloading ? <div className='loader overlay'  >
                    <div
                        className='loaderclass'
                    >
                        <RotatingLines

                            visible={true}
                            height="96"
                            width="96"
                            strokeColor="blue"
                            color="grey"
                            strokeWidth="5"
                            animationDuration="0.75"
                            ariaLabel="rotating-lines-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                </div> :
                    null
            }

        </section>
    );
};

export default MapComponent;
