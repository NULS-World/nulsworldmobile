import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)

import bus from './bus.js'

var SecureStorage = require("nativescript-secure-storage").SecureStorage;
export var secureStorage = new SecureStorage();

export default new Vuex.Store({
  state: {
    accounts: [],
    profiles: {},
    aliases: {},
    alias_addresses: {},
    selected_account: null,
    signTx: null,
    signReason: null,
    signShow: false,
    editProfileShow: false,
    last_broadcast: null
  },
  mutations: {
    add_account(state, account) {
      state.accounts.push(account)
      SecureStorage.set('accounts', JSON.stringify(state.accounts))
    },
    update_accounts(state, accounts) {
      state.accounts = accounts
    },
    set_current_address(state, address) {
      state.selected_account = state.accounts.find(obj => {
        return obj.address === address
      })
      if(state.selected_account===undefined) {
        // fall back to first account
        state.selected_account = state.accounts[0]
        address = state.selected_account.address
      }
      SecureStorage.set('selected_account', address)
    },
    sign_tx(state, payload) {
      state.signTx = payload.tx
      state.signReason = payload.reason
      state.signShow = true
    },
    signed_tx(state) {
      state.signTx = null
      state.signReason = null
      state.signShow = false
      state.last_broadcast = new Date()
      bus.$emit('broadcasted');
    },
    store_profile(state, payload) {
      state.profiles[payload.address] = payload.profile
    },
    edit_profile(state) {
      state.editProfileShow = true
    },
    edited_profile(state) {
      state.editProfileShow = false
    }
  }
})
