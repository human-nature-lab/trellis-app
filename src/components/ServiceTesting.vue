<template>
  <v-container fluid>
    <v-card>
      <v-toolbar>
        <v-toolbar-title>Service Testing</v-toolbar-title>
      </v-toolbar>
      <v-expansion-panel v-model="testSelectorOpen">
        <v-expansion-panel-content>
          <div slot="header">Test suites</div>
          <v-checkbox
            v-model="modulesToRun"
            v-for="name in testModules"
            :value="name"
            :label="name" />
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-toolbar flat>
        <v-toolbar-title>Results</v-toolbar-title>
      </v-toolbar>
      <v-card>
        <v-flex
          v-for="test in tests"
          v-model="test.open"
          :key="test.title">
          <v-layout row>
            <v-flex xs>
              <v-icon v-if="test.state === SUCCESSFUL" color="success">check_circle</v-icon>
              <v-icon v-else-if="test.state === FAILED" color="error">error</v-icon>
            </v-flex>
            <v-layout column>
              <v-flex>{{test.title}}</v-flex>
              <v-flex>{{ test.err }}</v-flex>
            </v-layout>
          </v-layout>
        </v-flex>
      </v-card>
      <v-card-actions>
        <v-btn
          :disabled="state !== WAITING"
          @click="start()">
          <span v-if="state === WAITING">Start</span>
          <v-progress-circular v-else />
        </v-btn>
        <v-checkbox
          label="Debug errors"
          v-model="debugErrors" />
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
  import testModules from '../../test/services'

  let runner
  export default {
    name: 'service-testing',
    data () {
      const d = {
        testSelectorOpen: [true],
        SUCCESSFUL: 'passed',
        FAILED: 'failed',
        WAITING: 2,
        WORKING: 3,
        allTestsLoaded: false,
        testModules: Object.keys(testModules),
        modulesToRun: [],
        tests: [],
        debugErrors: false
      }
      d.state = d.WAITING
      return d
    },
    beforeDestroy () {
      // if (runner) runner.teardown('bdd')
    },
    methods: {
      getNestedTitle (test) {
        let title = test.title
        let t = test.parent
        while(t.parent) {
          if (t.title) {
            title = t.title + ' > ' + title
          }
          t = t.parent
        }
        return title
      },
      testToDisplay (test) {
        return {
          state: test.state,
          title: this.getNestedTitle(test),
          err: test.err ? test.err.message : null
        }
      },
      async validateLoggedIn () {
        await (new LoginServiceCordova()).login(config.user.username, config.user.password)
        await (new LoginServiceWeb()).login(config.user.username, config.user.password)
        return true
      },
      async validateDataVersion () {
        // TODO: Check that local database is the same snapshot as the latest on the server
        return true
      },
      async start () {
        if (!this.modulesToRun.length) return
        this.tests = []
        this.state = this.WORKING
        this.testSelectorOpen = false
        try {
          await this.validateLoggedIn()
          await this.validateDataVersion()
        } catch (err) {
          console.error(err)
        }
        mocha.setup('bdd')
        this.modulesToRun.forEach(name => {
          testModules[name].default()
        })
        runner = mocha.run()
        runner.on('pass', test => {
          this.tests.push(this.testToDisplay(test))
        })
        runner.on('fail', test => {
          console.error(test)
          if (this.debugErrors) {
            debugger
          }
          this.tests.push(this.testToDisplay(test))
        })
        runner.on('error', err => {
          debugger
        })
        runner.on('end', () => {
          this.state = this.WAITING
        })
      }
    },
  }
</script>
