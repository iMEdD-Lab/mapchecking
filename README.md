# Description

The crowd counter allows you, after defining an area on the map, to estimate how many people could fit in it, depending on the population density per square meter. See how to use the tool [here](https://lab.imedd.org/en/crowd-counter/).

# For developers

### Install

Install Packages:
```sh
yarn install
```
Create **.env** file and add your Google Maps API Key and the selected languages:

```sh
VITE_GOOGLE_MAPS_API_KEY=[your_google_maps_api_goes_here]
VITE_TOOL_LOCALE =[el]
VITE_TOOL_LOCALE_FALLBACK =[en]
```

### Run locally
```sh
yarn dev
```
Open **http://127.0.0.1:5173/** in your browser. Any changes are compiled automatically.

### Build for production
```sh
yarn build
```
The build can be found in **/dist** folder.

# Credits

This tool is a modification and extension of [MapChecking](https://www.mapchecking.com/), created by Anthony Catel, for [iMedD Lab](https://lab.imedd.org/) by [Sociality](https://sociality.coop/). The methodology and the visualizations are provided by [Keith Still](https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html). Icons created by Anthony Raj, White Spaces Inc. and KIM Hyojun as provided in the NounProject.
