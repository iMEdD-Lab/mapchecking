<template>
    <div class="md:flex flex-1 md:items-stretch md:flex-row">
        <div class="h-[60%] md:h-full w-full map-wrapper">
            <client-only>
                <Map :densities="densities" :startHash="startHash" ref="mapComponent" @polygonsChange="polygonsUpdate"
                    @densitiesChange="densitiesUpdate" @selectedChange="selectedUpdate" @hashChange="hashUpdate" />
            </client-only>
        </div>
        <div
            class="flex flex-col relative w-full lg:w-2/3 py-2--- md:px-4--- font-sans md:border-l border-gray-500 bg-gray-100 dashboard-wrapper">
            <div class="px-1 md:px-0 bg-white items-center main-title hidden md:flex">
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
            <div class=" hidden md:block order-last--- md:order-first--- px-4 py-3 mb-4 md:mb-0 md:px-0 bg-white"  v-html='$t("main.toolDescription")'></div>
            <div class="px-4">
                <div class="text-center relative">
                    <h3 class="text-l md:text-xl text-lighter">{{ $t("main.estimateTitle") }}</h3>
                    <div class="total-estimate text-darker font-slab font-semibold">{{ estimated }} {{ $t("main.people")
                    }}</div>
                    <button class="round-button button-reset"  @click="mapComponent.resetAll();">
                      <img src="/reset-icon.svg">               
                    </button>
                </div>

                <div>
                    <div class="accordion" id="accordionExample">

                        <div v-for="(polygon, i) in polygons" :key="polygon.color.slice(1)"
                            class="accordion-item shadow-md md:rounded-md"
                            :style="{ backgroundColor: polygon.color + '30' }">
                            <h2 class="accordion-header font-sans font-semibold"
                                :id="`heading${polygon.color.slice(1)}`" :style="{ color: polygon.color }">
                                <button class="accordion-button" :class="{ collapsed: selected != i }" type="button"
                                    data-bs-toggle="collapse" :data-bs-target="`#collapse${polygon.color.slice(1)}`"
                                    :aria-expanded="i === 0" :aria-controls="`collapse${polygon.color.slice(1)}`"
                                    @click="mapComponent.setSelectedPolygon(i); selected = i">
                                    <div :style="{ backgroundColor: polygon.color }" class="accordion-number">
                                        {{ i + 1 }}
                                    </div>
                                    {{ polygon.surface.toFixed(2) }} <span v-html='$t("accordion.areaUnit")'></span> |
                                    {{ (densities[i] * polygon.surface).toFixed(0) }} {{ $t("accordion.people") }}
                                    <!--|| Density: {{ densities[i] }}-->
                                </button>
                            </h2>
                            <div :id="`collapse${polygon.color.slice(1)}`" class="accordion-collapse collapse"
                                :class="{ show: selected === i }" :aria-labelledby="`heading${polygon.color.slice(1)}`"
                                data-bs-parent="#accordionExample">
                                <div class="accordion-body">


                                    <div v-if="polygon.surface !== 0">
                                        <div class="mt-2 space-y-2">
                                            <div class="flex justify-between font-slab text-lighter mb-4">
                                                <span class="density-text">{{ $t("accordion.crowdDensity")
                                                }}</span>
                                                <div><span class="density-text mr-1">{{ densities[i] }}</span> <span class="density-value"
                                                        v-html='$t("accordion.crowdDensityPerArea")'></span></div>
                                            </div>
                                            <input class="block w-full" type="range" min="0.1" max="6.0" step="0.1"
                                                v-model="densities[i]" />
                                            <div class="flex w-full justify-between my-0"><span
                                                    class="text-lighter slider-legend">0</span><span
                                                    class="text-lighter slider-legend">6</span>
                                            </div>
                                            <a v-bind:href="getImage(i)" target="_blank">
                                                <img v-bind:src="getImage(i)" alt="" style="width: 80%; margin: auto;">
                                            </a>
                                        </div>
                                        <!--<div class="flex justify-around pt-2 mt-2">
                                            <button @click="setDensity(i, 0.3)" class="btn">Light</button>
                                            <button @click="setDensity(i, 2)" class="btn">Crowded</button>
                                            <button @click="setDensity(i, 4)" class="btn">Packed</button>
                                        </div>-->
                                        <div class="md:mt-4  mb-4 md:mb-1 text-sm text-lighter">
                                            <img class="info-icon" src="/info.png"> {{ $t("accordion.extraInfo") }}
                                            <a class="link"
                                                href="https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html">{{
                                                    $t("accordion.infoLink") }}
                                            </a>
                                            <!-- <div class="flex space-x-2 mt-1">
                                            <a class="font-semibold underline hover:no-underline" target="blank"
                                                href="https://www.gkstill.com/_Media/3-4_med_hr.png">Image 1</a>
                                            <a class="font-semibold underline hover:no-underline" target="blank"
                                                href="https://www.gkstill.com/_Media/4-4_med_hr.png">Image 2</a>
                                            <a class="font-semibold underline hover:no-underline" target="blank"
                                                href="https://www.gkstill.com/_Media/2-2_med_hr.png">Image 3</a>
                                            <span></span>
                                        </div> -->
                                        </div>
                                    </div>

                                    <div class="text-center font-bold" v-else style="margin-bottom: 1rem;">
                                        {{ $t("accordion.description") }}
                                    </div>

                                    <div v-if="i !== 0" class="flex justify-end">
                                        <button :key="'remove-button' + i" class="round-button button-minus"
                                            @click="mapComponent.removePolygon(i); selected -= 1">
                                            &mdash;
                                        </button>
                                    </div>
                                    <div v-if="i === 0 && polygons.length == 1 && polygon.surface != 0" class="flex justify-end">
                                        <button :key="'reset-button' + i" class="round-button button-minus"
                                            @click="mapComponent.resetPolygon(i);">
                                            &mdash;
                                        </button>
                                    </div>


                                </div>
                            </div>
                        </div>


                    </div>

                    <button v-if="polygons.length < 7" class="round-button add-polygon-btn"
                        @click="mapComponent.addPolygon(); selected = polygons.length - 1">+</button>
                </div>


                <div class="my-4">
                    <h2 class="font-bold mb-2">{{ $t("main.examples") }}</h2>

                    <div class="flex gap-2 flex-wrap">
                        <a href="javascript:void(0)"
                            @click="mapComponent.reloadHash('ceNotzy9Ig0EYx_EzmFRQDNdkRaPlfQXB4N2JbSsOYRhEFIesiWUaZrAMcSCiRSyCBtsQRAyHBrNJQRjT-fruH2NhYWuDfW9bePjcvc_vfXhupCrNzJ_VQmSpCPVNTRohfGqPOqXyxvM8la5Ic_ZrdR4PsI4pXGLGNWaxhVuYCaz-oh_HKE6gEEod0rvj7Fz7t_qmPMjc4mN_j7dl9-2Z8xXG6AWhNG3uRYz3M0IlatJ06G2jz5wC86bdPFwIrd7HFXQ7vZBLJufUPefRktUXGLLnMc4yL4UnZI4wN8w-cP4ks4NpHMdFfOctPmYwijHcwFXMYRd38ZJ8A917Sux4_mN1Ez9wCiV7FMkk8Ann8RWr_BNghPsYuQL3ddzEHsucyTc')"
                            class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png"> 
                            {{ $t("examples.ex1") }}
                        </a>
                        <a href="javascript:void(0)"
                            @click="mapComponent.reloadHash('ceNo1jj8LQVEYxk8UEh_Axik2UpSNe44MBptRUQqTwWaUP_de8TF8AsO5X-HuGEyUXUblyu8OTj39zjnv8zy9NVvqq22UEA7KIg8ltBBVNED_Y1l9vIe1USlH6gIZj3fTMSoK_Y1RJViELfjAF2YC7uOlUWeYhsFG6huzIvTJdmDSDb3C6rl4tka98c7oP8EInjr_c_7bsAsrlWPju5I6szfqAl87oxZrqZ_M8vTdybRhmd7RKGYN2TfGXlOYg3Fo0_-hfwJ_emZdtQ')"
                            class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png"> 
                            {{ $t("examples.ex2") }}
                        </a>
                        <a href="javascript:void(0)"
                            @click="mapComponent.reloadHash('ceNpt0LErhGEcB_B3YDEpyRmURBaDwWAw3HsGEYvBQmKTP0CpY8GiSwbKFVJyWd47tgs3sZouN5HjFmVgOMtRfN7dW0-f3ud5fr_v-_4-vxOp2ZcoDIJdq9saSgX_PgvJkZ9EarQahWMc5jKbuc42lljmFes8i-_rfcBxdjDzGoW_MnOMsx94xy2es5NFlt2_4SYvOcke9f36BkEy2WgkUqvPUdjn7ItTXHKW5iOPOKgmz3leM824d8QC35hju8z4fYq33GCFBdb5xBbZx-xilgM84TAvOMF3zrKjFoUrnGSWRWZY5RrvOcNF9rKmLp5NnNOQ12q_Fs-CJVbs73OaO2ziKbd9_x7nOMpD__1hLnnz-AMn8-Xa')"
                            class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png">
                            {{ $t("examples.ex3") }}
                        </a>
                    </div>
                </div>
                <div class="grow"></div>
            </div>
            <div class="w-full footer-notice block md:hidden" v-html='$t("map.footer")'></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Map from './components/Map.vue'
import { tatween, Easing } from 'tatween';
import { computed, Ref, ref } from '@vue/reactivity';
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();

const startHash = !import.meta.env.SSR && window.location.hash && window.location.hash.length > 3 ?
    window.location.hash.substring(1) : ''

const mapComponent = ref();

const polygons: Ref<{ color: string, surface: number }[]> = ref([]);
const densities: Ref<number[]> = ref([1.5, 1.5, 1.5, 1.5, 1.5, 1.5]);
const selected: Ref<number> = ref(0);

if(typeof window !== 'undefined') {
    let params = window.location.href.split('/');
    (params[params.length-1] == 'en') ? changeLang('en') : changeLang(localStorage.getItem('lang') || 'el');
}

const images = [
    'https://www.gkstill.com/_Media/05-5_med_hr.png',
    'https://www.gkstill.com/_Media/10-5_med_hr.png',
    'https://www.gkstill.com/_Media/15-5_med_hr.png',
    'https://www.gkstill.com/_Media/20-5_med_hr.png',
    'https://www.gkstill.com/_Media/25-5_med_hr.png',
    'https://www.gkstill.com/_Media/30-5_med_hr.png',
    'https://www.gkstill.com/_Media/35-5_med_hr.png',
    'https://www.gkstill.com/_Media/40-5_med_hr.png',
    'https://www.gkstill.com/_Media/45-5_med_hr.png',
    'https://www.gkstill.com/_Media/50-5_med_hr-2.png',
    'https://www.gkstill.com/_Media/55-5_med_hr.png',
    'https://www.gkstill.com/_Media/60-5_med_hr.png'
];

const polygonsUpdate = (values: { color: string, surface: number }[]) => {
    polygons.value = [...values];
}

const densitiesUpdate = (values: number[]) => {
    densities.value = values;
}

const selectedUpdate = (val: number) => {
    selected.value = val;
}

const hashUpdate = (hash: string) => {
    window.location.hash = hash;
}

const setDensity = (index: number, val: number) => {
    densities.value[index] = val;
    // tatween(800, Easing.Exponential.Out, (obj) => {
    //     obj.value[index] = val;
    // }, densities);
}

const getImage = (d: number) => {

    if (densities.value[d] <= 0.5) return images[0];
    else if (densities.value[d] <= 1) return images[1];
    else if (densities.value[d] <= 1.5) return images[2];
    else if (densities.value[d] <= 2) return images[3];
    else if (densities.value[d] <= 2.5) return images[4];
    else if (densities.value[d] <= 3) return images[5];
    else if (densities.value[d] <= 3.5) return images[6];
    else if (densities.value[d] <= 4) return images[7];
    else if (densities.value[d] <= 4.5) return images[8];
    else if (densities.value[d] <= 5) return images[9];
    else if (densities.value[d] <= 5.5) return images[10];
    else if (densities.value[d] <= 6) return images[11];
    else return images[0];
}

const estimated = computed(() => {
    let total = 0;
    polygons.value.forEach((p, i) => {
        total += Math.round(p.surface * densities.value[i])
    });
    return total;
})

function changeLang(lang) {
    locale.value = lang;
    localStorage.setItem('lang', lang)    
    /* this.$store.dispatch('setLocale', lang)
         .then(() => {
             this.$router.replace({ query: { lang } });
         });*/
}

</script>

<style lang="css">
.collapse.show {
    visibility: visible !important;
}
</style>
