<template>
    <Page ref="page" backgroundSpanUnderStatusBar="true" statusBarStyle="light">
        <ActionBar title="NULS World"
                   android:flat="true">
          <StackLayout orientation="horizontal"
            horizontalAlignment="center">
            <Image src="~/assets/images/logo96.png" height="40"></Image>
          </StackLayout>
        </ActionBar>
        <TabView android:tabBackgroundColor="#fff"
                 android:tabTextColor="#6e84a3"
                 android:selectedTabTextColor="rgba(18,38,63,.9)"
                 androidSelectedTabHighlightColor="rgba(18,38,63,.9)">
            <TabViewItem title="Portfolio">
                <AbsoluteLayout ref="portfolioLayout">
                  <GridLayout columns="*" rows="*,3*" left="0" top="0" height="100%" width="100%" marginBottom="48">
                      <GridLayout col="0" row="0" columns="*,*,*" rows="*" class="nuls-blue">
                        <StackLayout orientation="vertical" col="0" row="0">
                          <Label class="header-pretitle text-secondary" text="Staked" />
                          <Label class="text-white">
                            {{(total_consensus_locked || 0)/100000000}}
                          </Label>
                        </StackLayout>

                        <StackLayout orientation="vertical" col="1" row="0">
                          <Label class="header-pretitle text-secondary" text="Time Locked" />
                          <Label class="text-white">
                            {{(total_time_locked || 0)/100000000}}
                          </Label>
                        </StackLayout>

                        <StackLayout orientation="vertical" col="2" row="0">
                          <Label class="header-pretitle text-secondary" text="Available" />
                          <Label class="text-white">
                            {{(total_available || 0)/100000000}}
                          </Label>
                        </StackLayout>
                      </GridLayout>
                      <Label class="message" text="Tab 1b Content" col="0" row="1"/>
                  </GridLayout>
			            <StackLayout left="0" top="0" height="100%" width="100%" class="backdrop" :class="classBackdrop" />

            			<AbsoluteLayout ref="fabItemPosition" marginTop="83%" marginLeft="75%">
                    <CardView elevation="10" radius="75" margin="10" width="56" height="56" class="add-card">
            				  <Button @tap="onAddTap" class="add-button fe" id="add-button">&#xe8b1;</Button>
                    </CardView>
            			</AbsoluteLayout>
                </AbsoluteLayout>
            </TabViewItem>
            <TabViewItem title="Wallet">
                <GridLayout columns="*" rows="*">
                    <Label class="message" text="Tab 2 Content" col="0" row="0"/>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="Explorer">
                <GridLayout columns="*" rows="*">
                    <Label class="message" text="Tab 3 Content" col="0" row="0"/>
                </GridLayout>
            </TabViewItem>
            <TabViewItem title="News">
                <GridLayout columns="*" rows="*">
                    <Label class="message" text="Tab 3 Content" col="0" row="0"/>
                </GridLayout>
            </TabViewItem>
        </TabView>
    </Page>
</template>

<script>
  import * as view from "ui/core/view";
  import { mapState } from 'vuex'
  import secp256k1 from 'secp256k1'

  import {private_key_to_public_key,
          address_from_hash,
          hash_from_address,
          public_key_to_hash
          } from 'nulsworldjs/src/model/data.js'

  var hexRegEx = /([0-9]|[a-f])/gim

  function isHex(input) {
    return typeof input === 'string' &&
      (input.match(hexRegEx) || []).length === input.length
  }

  export default {
    data() {
      return {
        total_consensus_locked: 0,
        total_time_locked: 0,
        total_available: 0,
        unspent_info: {},
        last_height: 0,
        stats: {}
      }
    },
    computed: mapState({
      accounts: state => state.accounts,
      selected_account: state => state.selected_account,
      last_broadcast: state => state.last_broadcast
    }),
    watch:{
      async accounts() {
        await this.updateStats()
      }
    },
    methods: {
      async onAddTap() {
        let result = await prompt('Please input an address (view-only) or a private key (wallet mode).', 'Ns')
        if (result.result)
        {
          if (result.text.length == 32) {
            this.$store.commit('add_account', {
              'type': 'watch',
              'address': result.address,
              'name': null,
              'private_key': null
            })
            return;
          } else if ((result.text.length >= 64) && (result.text.length <= 66)) {
            let private_key = result.text
            if ((this.private_key.length == 66) && (this.private_key.substring(0, 2) == "00"))
              private_key = private_key.substring(2, 66)

              try {
                let prvbuffer = Buffer.from(private_key, 'hex')
                let pub = private_key_to_public_key(prvbuffer)
                let hash = public_key_to_hash(pub, {chain_id: 8964});
                let address = address_from_hash(hash);

                this.$store.commit('add_account', {
                  'type': 'wallet',
                  'address': address,
                  'name': null,
                  'private_key': private_key
                })
              } catch (e) {
                console.warning("error converting prv key")
              }
          }
          await alert("Can't add this account, data invalid.")
        }
        console.log(`Dialog result: ${result.result}, text: ${result.text}`)
      },
      async updateStats() {
        let result = await axios.get('https://nuls.world/addresses/stats', {
          params: {
            addresses: this.accounts.map((acct) => acct.address)
          }
        })
        console.log(result.data)
        this.unspent_info = result.data.unspent_info
        this.last_height = result.data.last_block_height
        this.total_unspent = Object.values(this.unspent_info).map((u) => u.unspent_value).reduce((e, i) => e + i)
        this.total_available = Object.values(this.unspent_info).map((u) => u.available_value).reduce((e, i) => e + i)
        this.total_consensus_locked = Object.values(this.unspent_info).map((u) => u.consensus_locked_value).reduce((e, i) => e + i)
        this.total_time_locked = Object.values(this.unspent_info).map((u) => u.time_locked_value).reduce((e, i) => e + i)
        this.accounts = this.$root.$data.accounts
        this.update_charts()
      }
    },
    async created() {
      await this.updateStats()
    }
  }
</script>

<style scoped>
Page {
  background-color: #fff;
}
ActionBar {
    background-color: #fff;
    color: rgba(18,38,63,.9);
}

.message {
    vertical-align: center;
    text-align: center;
    font-size: 20;
    color: #333333;
}

.nuls-blue {
  background: linear-gradient(-133deg, #002e5e 0%, #092243 89%, #0a2140 100%);
  color: #fff;
}

.add-card {
  background: orangered;
  vertical-align: center;
  text-align: center;
}

Button.add-button {
  vertical-align: center;
  text-align: center;
  color: #fff;
  border: 0;
  width: 56;
  height: 56;
  font-size: 25;
  background: orangered;
  border-radius: 50%;
  transition: all 1s ease-in;
}

Button.add-button:highlighted {
  background: coral;
}
</style>
