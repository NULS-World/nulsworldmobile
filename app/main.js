import Vue from 'nativescript-vue'
import App from './components/App'
import VueDevtools from 'nativescript-vue-devtools'
import {TNSFontIcon, fonticon} from 'nativescript-fonticon'
import store from './store'
import {secureStorage} from './store'

if(TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')

Vue.registerElement('Carousel', () => require('nativescript-carousel').Carousel)
Vue.registerElement('CarouselItem', () => require('nativescript-carousel').CarouselItem)
Vue.registerElement('CardView', () => require('nativescript-cardview').CardView)



new Vue({
  render: h => h('frame', [h(App)]),
  store: store,
  async mounted() {
    try{
      if (await secureStorage.get({key: 'accounts'}))
      {
        this.$store.commit('update_accounts', JSON.parse(await secureStorage.get({key: 'accounts'})))
        console.log(this.$store.accounts)
      }
    } catch (e) {
      console.warn("Can't import data", e);
    }
  },
}).$start()
