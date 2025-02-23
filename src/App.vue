<template>
    <div class="md:flex flex-1 md:items-stretch md:flex-row">
        <div class="h-[60%] md:h-full w-full">
            <client-only>
                <Map :densities="densities" :startHash="startHash" ref="mapComponent" @polygonsChange="polygonsUpdate" @densitiesChange="densitiesUpdate" @selectedChange="selectedUpdate" @hashChange="hashUpdate" />
            </client-only>
        </div>
        <div class="flex flex-col relative w-full lg:w-2/3 py-2--- md:px-4--- font-sans md:border-l border-gray-500 bg-gray-100">
            <div class="px-1 md:px-0 bg-white flex items-center">
                <div class="px-3">
                    <img class="header-logo" src="/iMEdD_logo.png/">
                </div>
                <div class="w-full px-4 py-2 text-white bg-customPrimary flex items-center justify-between">
                    <h1 class="text-xl md:text-2xl">{{ $t("main.mainTitle") }}</h1>  
               
                    <button v-if="$i18n.locale=='el'" @click="changeLang('en')" class="language-switcher">EN</button> 
                    <button v-else @click="changeLang('el')" class="language-switcher">ΕΛ</button>           
                </div>
            </div>
            <div class="order-last--- md:order-first--- px-4 py-3 mb-4 md:mb-0 md:px-0 bg-white">
                {{ $t("main.toolDescription") }}. <a href="#" class="link">{{ $t("main.descriptionLink") }}</a>
            </div>
            <div class="px-4">
                <div class="text-center">
                    <h3 class="text-l md:text-xl text-lighter">{{ $t("main.estimateTitle") }}</h3>  
                    <div class="total-estimate text-darker">{{estimated}} {{ $t("main.people") }}</div>
                </div>
                
                <div>
                    <div class="accordion shadow-md md:rounded-md " id="accordionExample">

                        <div v-for="(polygon, i) in polygons" :key="polygon.color.slice(1)" class="accordion-item">
                            <h2 class="accordion-header" :id="`heading${polygon.color.slice(1)}`"
                                :style="{ color: polygon.color }">
                                <button class="accordion-button" :class="{ collapsed: selected != i }" type="button"
                                    data-bs-toggle="collapse" :data-bs-target="`#collapse${polygon.color.slice(1)}`"
                                    :aria-expanded="i === 0" :aria-controls="`collapse${polygon.color.slice(1)}`"
                                    @click="mapComponent.setSelectedPolygon(i); selected = i">
                                    <div :style="{ backgroundColor: polygon.color }" style="height: 1rem; width: 1rem;">

                                    </div>
                                    Surface: {{ polygon.surface.toFixed(2) }} || People: {{ (densities[i] * polygon.surface).toFixed(0) }} || Density: {{ densities[i] }}
                                </button>
                            </h2>
                            <div :id="`collapse${polygon.color.slice(1)}`" class="accordion-collapse collapse"
                                :class="{ show: selected === i }" :aria-labelledby="`heading${polygon.color.slice(1)}`"
                                data-bs-parent="#accordionExample">
                                <div class="accordion-body">

                                    <div v-if="i !== 0">
                                        <button :key="'remove-button' + i"
                                            @click="mapComponent.removePolygon(i); selected -= 1">
                                            Remove
                                        </button>
                                    </div>
                                    <div v-if="i === 0 && polygons.length == 1">
                                        <button :key="'reset-button' + i"
                                            @click="mapComponent.resetPolygon(i);">
                                            Reset
                                        </button>
                                    </div>

                                    <div v-if="polygon.surface !== 0">
                                        <div class="mt-2 space-y-2">
                                            <span class="font-semibold">Crowd density</span>
                                            <input class="block w-full" type="range" min="0.1" max="5.0" step="0.1"
                                                v-model="densities[i]" />
                                        </div>
                                        <div class="flex justify-around pt-2 mt-2">
                                            <button @click="setDensity(i, 0.3)" class="btn">Light</button>
                                            <button @click="setDensity(i, 2)" class="btn">Crowded</button>
                                            <button @click="setDensity(i, 4)" class="btn">Packed</button>
                                        </div>
                                    </div>

                                    <div class="text-center font-bold" v-else>
                                        {{ $t("accordion.description") }}
                                    </div>
                                    <div class="md:mt-4  mb-4 md:mb-1 text-sm text-lighter">
                                        <img class="info-icon" src="/info.png/"> It's easy to overestimate the density as the crowd is rarely uniformly packed. This is what <strong>2 people per square meter</strong> looks like from a low angle :
                                        <div class="flex space-x-2 mt-1">
                                            <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/3-4_med_hr.png">Image 1</a>
                                            <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/4-4_med_hr.png">Image 2</a>
                                            <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/2-2_med_hr.png">Image 3</a>
                                            <span>(<a class="underline hover:no-underline" href="https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html">source</a>)</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>


                    </div>

                    <button class="btn" @click="mapComponent.addPolygon(); selected = polygons.length - 1">Add</button>
                </div>

                
                <div class="my-4">
                    <h2 class="font-bold mb-2">{{ $t("main.examples") }}</h2>

                    <div class="flex gap-2 flex-wrap">
                        <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAgQJtzQ0LZXRJAAACQQVdzQ0K-UxJAlHNDQl5REkDTc0NCz1ESQP9zQ0KFUxJAHnRDQv5WEkA8dENC51oSQEF0Q0LRXhJAPnRDQldjEkA2dENCo2YSQA50Q0KPaxJA_HNDQq5uEkDac0NCV28SQJRzQ0IhcBJAYnNDQvFuEkAzc0NCEWoSQPNyQ0LIXxJAGnNDQsNZEkA')" class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png/"> 26.01.25 - Πλ.Συντάγματος</a>
                        <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAAQEJ4Q0IdShdAAACQQcp4Q0IfKxdAeXlDQtI7F0CseENClVIXQNl3Q0IeaBdAG3dDQnlYF0A')" class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png/"> 26.01.25 - Εγνατία Οδός</a>
                        <a href="javascript:void(0)" @click="mapComponent.reloadHash('ceNolzr-rAXAUBfBvvfW99Z2U2MwGG3HwJ1gssmJjkEWZpfyKKEpIfoSUkqzKYiAZlYxkMRmdMn1u93ZPxxjDTDwYeDdAY0r-SCIYeGiOynAH9MjfHuiWrz7olPcBaJPWMfgvVzPwpAzvAuzKpUzJ7BwMybruLtmcgnZ5mYA_sqz_a0z7EbiRjiGYlrkuWJCFFriTlzZ4lhn1msltHdzLQ-mb-8yDSTkugmtpqYA3GZF_6nesgj45r4Efb-1WKg')" class="btn rounded-md text-sm"><img class="map-pre-icon" src="/map.png/"> 26.01.25 - Πλ. Γεωργίου</a>
                        <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAAQHoRUkLzzlVBAABwQRsPUkISoVVB0A5SQhKhVUF_EFJChAhWQccQUkJBCFZB')" class="btn rounded-md text-sm">Tiergarten 🇩🇪</a>
                    </div>
                </div>
                <div class="grow"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Map from './components/Map.vue'
import { tatween, Easing } from 'tatween';
import { computed, Ref, ref } from '@vue/reactivity';
import { useI18n } from 'vue-i18n'
const { locale } = useI18n();

const startHash = !import.meta.env.SSR && window.location.hash && window.location.hash.length > 3 ?
                window.location.hash.substring(1) : ''

const mapComponent = ref();

const polygons: Ref<{ color: string, surface: number }[]> = ref([]);
const densities: Ref<number[]> = ref([1.5, 1.5, 1.5, 1.5, 1.5, 1.5]);
const selected: Ref<number> = ref(0);

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

const estimated = computed(() => {
    let total = 0;
    polygons.value.forEach((p, i) => {
        total += Math.round(p.surface * densities.value[i])
    });
    return total;
})

function changeLang (lang) {
    locale.value = lang;
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
