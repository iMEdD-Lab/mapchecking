<template>
    <div class="w-full h-full relative map-container">
        <div class="px-1 md:px-0 bg-white flex md:hidden items-center main-title">
                <a target="_blank" class="px-3" href="https://lab.imedd.org">
                    <img class="header-logo" src="/imedd-lab-logo.svg">
                </a>
                <div class="w-full px-4 py-2 text-white bg-customPrimary flex items-center justify-between">
                    <h1 class="text-xl md:text-2xl font-semibold">{{ $t("main.mainTitle") }}</h1>

                    <button v-if="$i18n.locale == 'el'" @click="changeLang('en')"
                        class="language-switcher round-button">EN</button>
                    <button v-else @click="changeLang('el')" class="language-switcher round-button">ΕΛ</button>
                </div>
        </div>
        <div class="block md:hidden order-last--- md:order-first--- px-4 py-3 mb-4 md:mb-0 md:px-0 bg-white"  v-html='$t("main.toolDescription")'></div>
        <input ref="pacinput" id="pac-input" class="controls" :class="[mapLoaded ? '' : 'hidden']" type="text" placeholder="Search a place">
        <div class="w-full h-full" ref="mapel"></div>
        <div class="w-full absolute footer-notice hidden md:block" v-html='$t("map.footer")'></div>
    </div>
</template>

<script setup lang="ts">
    import { Base64 } from 'js-base64'
    import { onMounted, ref, watch, computed } from 'vue';
    import { watchDebounced } from '@vueuse/core'
    import { zlibSync, unzlibSync } from 'fflate';

    import * as GMaps from '@googlemaps/js-api-loader'
    const { Loader } = GMaps

    const DEFAULT_MAP_POSITION = [37.9754855, 23.734566, 17]

    const loader = new Loader({
        apiKey: `${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`,
        version: "3.51",
        libraries: ["geometry", "places"]
    });

    const props = defineProps<{
        densities: number[],
        startHash: string
    }>()

    const colors: string[] = [ '#e81416', '#ffa500','#114B5F','#79c314','#487de7','#047d12', '#70369d' ];
    //const colors: string[] = [ '#F0A202', '#BA3A0B','#114B5F','#DCE1D1','#DBD6DF','#CC9EA6', '#EADB88' ];

    const emits = defineEmits<{
        (event: "polygonsChange", val: { color: string, surface: number }[]): void
        (event: "densitiesChange", val: number[]): void
        (event: "selectedChange", val: number): void
        (event: "hashChange", val: string): void
    }>()

    const mapPosition = ref(DEFAULT_MAP_POSITION)
    const arrPoly = ref<google.maps.LatLng[][]>([])
    const mapLoaded = ref(false);
    const pacinput = ref()
    const mapel = ref()

    let currentMap : google.maps.Map;
    // let currentPolygon : google.maps.Polygon;

    let selectedPolygon: number = 0;
    let polygons: google.maps.Polygon[] = [];
    let my_data: { color: string, surface: number }[] = [];

    onMounted(() => {
        loader.loadCallback(e => {
            if (e) {
                console.log(e);
                return;
            }

            currentMap = new google.maps.Map(mapel.value, {
                zoom: mapPosition.value[2],
                center: {
                    lat: mapPosition.value[0],
                    lng: mapPosition.value[1]
                },
                mapTypeId: 'roadmap',
                gestureHandling: 'greedy'
            });

            const searchBox = new google.maps.places.Autocomplete(pacinput.value, {
                fields: ['geometry']
            })
            const service = new google.maps.places.AutocompleteService();
            const placesService = new google.maps.places.PlacesService(currentMap)

            currentMap.controls[google.maps.ControlPosition.LEFT_TOP].push(pacinput.value);

            searchBox.addListener('place_changed', async () => {
                const place = searchBox.getPlace();

                if (place.geometry?.location) {
                    currentMap.setCenter(place.geometry.location);
                    currentMap.setZoom(17);
                    resetAll();
                } else {
                    pacinput.value?.blur()

                    const sessionToken = new google.maps.places.AutocompleteSessionToken();
                    const rest = await service.getPlacePredictions({
                        input: place.name!,
                        sessionToken
                    })

                    placesService.getDetails({
                        sessionToken,
                        placeId: rest.predictions[0].place_id,
                        fields: ['geometry.location']
                    }, (res) => {
                        if (!res?.geometry?.location) {
                            return;
                        }

                        currentMap.setCenter(res.geometry.location);
                        currentMap.setZoom(17);
                        resetAll();
                    })
                }

            });

            currentMap.addListener('bounds_changed', function() {
                searchBox.setBounds(currentMap.getBounds()!);
            });
            currentMap.addListener('center_changed', mapUpdated);
            currentMap.addListener('zoom_changed', mapUpdated);
            currentMap.addListener('click', mapClicked);

            currentMap.setOptions({
                draggableCursor:'crosshair',
                clickableIcons: false,
                disableDoubleClickZoom: true,
                streetViewControl: false
            });

            addPolygon();

            if (props.startHash) {
                loadHash(props.startHash);
            }

            mapLoaded.value = true;
        });
    })

    const addPolygon = () => {
        const index = polygons.length;

        setNewPolygon(index);
        // setListeners(index);
        setListeners(polygons[index]);
        emits('polygonsChange', my_data);
    }

    const setNewPolygon = (index: number) => {
        let c = new google.maps.Polygon({
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillOpacity: 0.35,
            editable: true,
            draggable: true,
            geodesic: true
        })

        c.setMap(currentMap);
        
        polygons[index] = c;
        // ["insert_at", "remove_at", "set_at"].forEach(ev => google.maps.event.addListener(polygons[index].getPath(), ev, surfaceUpdated));

        setSelectedPolygon(index);
        setPolygonColor(index);
    }

    // const setListeners = (index: number) => {
    const setListeners = (polygon: google.maps.Polygon) => {
        google.maps.event.addListener(polygon.getPath(), 'insert_at', (event) => {
            let currentIndex = my_data.findIndex(x=> x.color == polygon['strokeColor']);
            selectedPolygon = currentIndex;
            surfaceUpdated(currentIndex); //alert the index of the polygon
            emits('selectedChange', currentIndex); //alert the index of the polygon
            emits('polygonsChange', my_data);
        });
        google.maps.event.addListener(polygon.getPath(), 'remove_at', (event) => {
            let currentIndex = my_data.findIndex(x=> x.color == polygon['strokeColor']);
            selectedPolygon = currentIndex;
            surfaceUpdated(currentIndex); //alert the index of the polygon
            emits('selectedChange', currentIndex); //alert the index of the polygon
            emits('polygonsChange', my_data);
        });
        google.maps.event.addListener(polygon.getPath(), 'set_at', (event) => {
            let currentIndex = my_data.findIndex(x=> x.color == polygon['strokeColor']);
            selectedPolygon = currentIndex;
            surfaceUpdated(currentIndex); //alert the index of the polygon
            emits('selectedChange', currentIndex); //alert the index of the polygon
            emits('polygonsChange', my_data);
        });
        google.maps.event.addListener(polygon, 'click', (event) => {
            let currentIndex = my_data.findIndex(x=> x.color == polygon['strokeColor']);
            selectedPolygon = currentIndex;
            emits('selectedChange', currentIndex); //alert the index of the polygon
        });
    }

    const removePolygon = (i:number) => {
        if (polygons.length == 1) return resetPolygon(i);

        polygons[i].getPath().clear();
        polygons.splice(i, 1);
        arrPoly.value.splice(i, 1);

        my_data.splice(i, 1);

        setSelectedPolygon(selectedPolygon-1);
        emits('polygonsChange', my_data);
    }

    const resetPolygon = (index:number) => {
        polygons[index].getPath().clear();
        surfaceUpdated(index);   
        
        emits('polygonsChange', my_data);
    }

    const setPolygonColor = (i: number) => {
        const color = colors.filter((c) => { return my_data.map(p => p.color).indexOf(c) < 0; } )[0];

        polygons[selectedPolygon].setOptions({
            fillColor: `${color}`,
            strokeColor: `${color}`
        });

        my_data.push({ color: color, surface: 0 });
    }

    const setSelectedPolygon = (i: number) => {
        selectedPolygon = i;
    }

    const mapUpdated = () => {
        const pos = currentMap.getCenter();
        const zoom = currentMap.getZoom();

        if (!pos || !zoom) {
            return;
        }

        mapPosition.value = [pos.lat(), pos.lng(), zoom]; 
    }

    /*
        Add a new point to our polygon
        using the lat/lng position clicked on the map.
    */
    const mapClicked = (ev: any) => {
        polygons[selectedPolygon].getPath().push(ev.latLng);
    }

    const surfaceUpdated = (index:number) => {

        arrPoly.value[index] = polygons[index].getPath().getArray().slice();

        /*
            Compute the surface area of our polygon.
            google.maps.geometry.spherical.computeArea() returns the area in square meters
        */
        my_data[index].surface = google.maps.geometry.spherical.computeArea(polygons[index].getPath());
    }

    const reloadHash = (hash: string) => {
        resetAll();
        loadHash(hash);

        //  ["insert_at", "remove_at", "set_at"].forEach(ev => google.maps.event.addListener(currentPolygon.getPath(), ev, surfaceUpdated));

        //  updatePolygonColor();
    }

    /*
        Deserialize out URL hash
    */
    const loadHash = (hash: string) => {
        // if (hash[0] != 'b' && hash[0] != 'c') {
        //     return loadLegacyHash(hash);
        // }

        const isCompressed = hash[0] == 'c';
        let buf = Base64.toUint8Array(hash.substr(1));

        if (!buf) {
            return;
        }

        if (isCompressed) {
            buf = unzlibSync(buf)
        }

        /* Extract meta data (position & zoom) */
        const meta = new Float32Array(buf.buffer, 0, 10);
        currentMap.setCenter({ lat: meta[0], lng: meta[1] });
        currentMap.setZoom(meta[2]);

        /* Extract density and path for every polygon */
        const data = new Float32Array(buf.buffer, 10 * 4);

        let densities: number[] = [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5];

        for (let i = 0; i < 7; i++) {
            if (meta[3 + i] > 0) {
                let startingPosition = meta[3 + i] - 10;
                let endingPosition = (meta[3 + i + 1] > 0) ? meta[3 + i + 1] - 10 - 1 : data.length;
                let arr = [...data.slice(startingPosition, endingPosition + 1)];
                densities[i] = ((arr[0]) ? Math.round(arr[0]*10)/10 : 0);
                
                let path: google.maps.LatLngLiteral[] = [];
                for (let j = 1; j < arr.length; j += 2) {
                    path.push({
                        lat: arr[j],
                        lng: arr[j + 1]
                    });
                }
                if (path.length) {
                    (i > 0) ? setNewPolygon(i) : '';
                    polygons[i].setPath(path);
                    // setListeners(i);
                    setListeners(polygons[i]);
                    surfaceUpdated(i);
                }
        
                emits('selectedChange', i);
            } else {
                densities[i] = 0;
            }
        }

        emits('polygonsChange', my_data);
        emits('densitiesChange', densities);
    }

    /*
        This is the legacy hash decoder.
        We keep it around so that original
        links posted online keep working
    */
    // const loadLegacyHash = (hash: string) => {
    //     const opt = hash.split(';');
    //     const curPosition = opt.pop();

    //     if (curPosition) {
    //         const cursetting = curPosition.split(',');
    //         currentMap.setCenter({lat: parseFloat(cursetting[0]), lng: parseFloat(cursetting[1])});
    //         currentMap.setZoom(parseInt(cursetting[2]));
    //     }

    //     const density = parseFloat(opt.pop() ?? '') || 1;
    //     const path : google.maps.LatLngLiteral[] = [];

    //     for (let i = 0; i < opt.length; i++) {
    //         const coord = opt[i].split(',');
    //         path.push({
    //             lat: parseFloat(coord[0]),
    //             lng: parseFloat(coord[1])
    //         });
    //     }

    //     if (path.length) {
    //         currentPolygon.setPath(path);
    //         surfaceUpdated();
    //     }

    //     emits('densityChange', density);
    // }

    /*
        Generate URL hash from various data.

        - Map position (center position as lat/lng & zoom value)
        - Polygons density, Polygons path as lat/lng points

        The generated buffer is then compressed (if needed) and Base64'd.

        We consider every value to be a float and serialize
        our data into a binary array with no extra information.

               0             4          8       12                  16         ....
        [position lat][position long][zoom][density[0]][...polygons[0] points][density[1]][...polygons[1] points] ...
    */
    const hash = computed(() => {
        let total = 0;
        let startingPositionsArr: number[] = [];
        arrPoly.value.forEach((x, i) => {
            startingPositionsArr.push(10 + total);
            total += 2 * x.length + 1;
        });
        const buf = new Float32Array(total + 3 + 7);
        // buf[0] = props.density;
        buf.set(mapPosition.value, 0);
        for (let i = 0; i < arrPoly.value.length; i++) {
            let startingPosition = startingPositionsArr[i];
            buf[3 + i] = startingPosition;
            buf[startingPosition] = props.densities[i] || 0;
            for (let j = 0; j < arrPoly.value[i].length; j++) {
                buf[startingPosition + 1 + j * 2] = arrPoly.value[i][j].lat();
                buf[startingPosition + 1 + j * 2 + 1] = arrPoly.value[i][j].lng();
            }
        }

        let outbuf = new Uint8Array(buf.buffer);
        const isCompressed = outbuf.byteLength >= 150;
        if (isCompressed) {
            outbuf = zlibSync(outbuf, { level: 9 });
        }

        /*

        */
        return (isCompressed ? 'c' : 'b') + Base64.fromUint8Array(outbuf, true);
    })

    const resetAll = () => {
        for (let i = my_data.length-1; i > -1; i--) {
            if(i == 0) resetPolygon(i);
            else removePolygon(i);
        }
    }
    // watch(() => props.density, () => updatePolygonColor());

    /*
        Debounce the URL hash update
        otherwise it would flood the browser history whenever the user
        moves the polygon around
    */
    watchDebounced(hash,
        (hashval: string) => emits('hashChange', hashval),
        { debounce: 300 })

    defineExpose({
        addPolygon,
        removePolygon,
        resetPolygon,
        reloadHash,
        setSelectedPolygon,
        resetAll
    })

</script>
