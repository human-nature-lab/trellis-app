<template>
  <v-container fluid>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Service Testing</v-toolbar-title>
      </v-toolbar>
      <v-list>
        <v-list-tile v-for="test in tests">
          <v-list-tile-action>
            <v-icon v-if="test.state === SUCCESSFUL" color="success">check_circle</v-icon>
            <v-icon v-else-if="test.state === FAILED" color="error">error</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <div class="title">{{test.parentTitle}}: {{test.title}}</div>
            <v-alert color="error" v-if="test.err">{{test.err}}</v-alert>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-card-actions>
        <v-btn
          :disabled="state !== WAITING"
          @click="start()">
          <span v-if="state === WAITING">Start</span>
          <v-progress-circular v-else />
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
  /*global mocha*/
  // import DatabaseServiceCordova from '../services/database/DatabaseServiceCordova'
  import LoginServiceCordova from '../services/login/LoginServiceCordova'
  import LoginServiceWeb from '../services/login/LoginServiceWeb'
  import config from '../config'
  import 'mocha/mocha.js'
  mocha.setup('bdd')
  import testModules from '../../test/services'
  testModules.forEach(m => m.default())

  let runner
  export default {
    name: 'service-testing',
    data () {
      const d = {
        SUCCESSFUL: 'passed',
        FAILED: 'failed',
        WAITING: 2,
        WORKING: 3,
        allTestsLoaded: false,
        tests: []
      }
      d.state = d.WAITING
      return d
    },
    beforeDestroy () {
      if (runner) runner.teardown('bdd')
    },
    methods: {
      testToDisplay (test) {
        return {
          state: test.state,
          title: test.title,
          parentTitle: test.parent.title,
          err: test.err ? test.err.message : null
        }
      },
      async validateLoggedIn () {
        // TODO: Validate that both versions are logged in
        const wu = await (new LoginServiceCordova()).login(config.user.username, config.user.password)
        const cu = await (new LoginServiceWeb()).login(config.user.username, config.user.password)
        return true
      },
      async validateDataVersion () {
        // TODO: Check that local database is the same snapshot as the latest on the server
        return true
      },
      async start () {
        this.tests = []
        this.state = this.WORKING
        try {
          await this.validateLoggedIn()
          await this.validateDataVersion()
        } catch (err) {
          console.error(err)
        }
        runner = mocha.run()
        runner.on('pass', test => {
          this.tests.push(this.testToDisplay(test))
        })
        runner.on('fail', test => {
          console.error(test)
          this.tests.push(this.testToDisplay(test))
        })
        runner.on('end', () => {
          this.state = this.WAITING
        })
      }
    },
  }
</script>
