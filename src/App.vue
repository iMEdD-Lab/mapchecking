<template>
    <div class="md:flex flex-1 md:items-stretch md:flex-row">
        <div class="h-[60%] md:h-full w-full">
            <client-only>
                <Map :densities="densities" :startHash="startHash" ref="mapComponent" @polygonsChange="polygonsUpdate" @densitiesChange="densitiesUpdate" @selectedChange="selectedUpdate" @hashChange="hashUpdate" />
            </client-only>
        </div>
        <div class="flex flex-col relative w-full lg:w-2/3 py-2 md:px-4 font-sans md:border-l border-gray-500 bg-slate-100">
            <div class="order-last md:order-first px-4 mb-4 md:mb-0 md:px-0">
                <h1 class="text-xl md:text-2xl">MapChecking &bull; Crowd counting tool</h1>
                <span class="text-gray-800 leading-tight">This tool helps you estimate and fact-check the maximum number of people standing in a given area.</span> 
                <br />
                <div class="text-sm mt-1 font-semibold">Source on github : <iframe class="inline" src="https://ghbtns.com/github-btn.html?user=paraboul&repo=mapchecking&type=star&count=false" frameborder="0" scrolling="0" width="150" height="20" title="GitHub"></iframe></div>
            </div>

            Peaple: {{estimated}}
            <div>
                <div class="accordion" id="accordionExample">

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
                                    Start by delimiting an area on the map
                                </div>

                            </div>
                        </div>
                    </div>


                </div>

                <button class="btn" @click="mapComponent.addPolygon(); selected = polygons.length - 1">Add</button>
            </div>

            <div class="shadow-md md:rounded-md px-4 py-3 bg-red-50 shadow-red-100 md:mt-4  mb-4 md:mb-1 text-sm text-red-600">
                ⚠️ It's easy to overestimate the density as the crowd is rarely uniformly packed. This is what <strong>2 people per square meter</strong> looks like from a low angle :
                <div class="flex space-x-2 mt-1">
                    <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/3-4_med_hr.png">Image 1</a>
                    <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/4-4_med_hr.png">Image 2</a>
                    <a class="font-semibold underline hover:no-underline" target="blank" href="https://www.gkstill.com/_Media/2-2_med_hr.png">Image 3</a>
                    <span>(<a class="underline hover:no-underline" href="https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html">source</a>)</span>
                </div>
            </div>
            <div class="shadow-md md:rounded-md px-4 py-3 bg-white md:mt-4 mb-4 md:mb-8">
                <h2 class="font-bold mb-2">Examples</h2>

                <div class="flex gap-2 flex-wrap">
                    <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAgQJtzQ0LZXRJAAACQQVdzQ0K-UxJAlHNDQl5REkDTc0NCz1ESQP9zQ0KFUxJAHnRDQv5WEkA8dENC51oSQEF0Q0LRXhJAPnRDQldjEkA2dENCo2YSQA50Q0KPaxJA_HNDQq5uEkDac0NCV28SQJRzQ0IhcBJAYnNDQvFuEkAzc0NCEWoSQPNyQ0LIXxJAGnNDQsNZEkA')" class="btn rounded-md text-sm">Place du Trocadero 🇫🇷</a>
                    <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAAQEJ4Q0IdShdAAACQQcp4Q0IfKxdAeXlDQtI7F0CseENClVIXQNl3Q0IeaBdAG3dDQnlYF0A')" class="btn rounded-md text-sm">Place de la République 🇫🇷</a>
                    <a href="javascript:void(0)" @click="mapComponent.reloadHash('ceNolzr-rAXAUBfBvvfW99Z2U2MwGG3HwJ1gssmJjkEWZpfyKKEpIfoSUkqzKYiAZlYxkMRmdMn1u93ZPxxjDTDwYeDdAY0r-SCIYeGiOynAH9MjfHuiWrz7olPcBaJPWMfgvVzPwpAzvAuzKpUzJ7BwMybruLtmcgnZ5mYA_sqz_a0z7EbiRjiGYlrkuWJCFFriTlzZ4lhn1msltHdzLQ-mb-8yDSTkugmtpqYA3GZF_6nesgj45r4Efb-1WKg')" class="btn rounded-md text-sm">Place de la Bastille 🇫🇷</a>
                    <a href="javascript:void(0)" @click="mapComponent.reloadHash('bAAAAQHoRUkLzzlVBAABwQRsPUkISoVVB0A5SQhKhVUF_EFJChAhWQccQUkJBCFZB')" class="btn rounded-md text-sm">Tiergarten 🇩🇪</a>
                </div>
            </div>
            <div class="grow"></div>
            <div class="flex space-x-4 order-last bg-white p-4 text-xs tracking-tight md:-mx-4 items-center font-medium justify-center">
                <span>Created by Anthony Catel</span>
                <a href="https://twitter.com/antcatel?ref_src=twsrc%5Etfw" class="twitter-follow-button" data-show-count="false">Follow @antcatel</a>
            </div>
<!--             <div class="bottom-0 left-0 md:absolute h-8 bg-white border-t border-gray-300 w-full text-xs tracking-tight text-center py-2">Created by Anthony Catel</div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import Map from './components/Map.vue'
import { tatween, Easing } from 'tatween';
import { computed, Ref, ref } from '@vue/reactivity';

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

</script>

<style lang="css">
.collapse.show {
    visibility: visible !important;
}
</style>