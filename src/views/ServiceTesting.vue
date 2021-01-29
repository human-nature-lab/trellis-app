<template>
  <v-flex>
    <v-container fluid>
      <v-card>
        <v-toolbar>
          <v-toolbar-title>Service Testing</v-toolbar-title>
          <v-spacer />
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                icon>
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <file-upload
                    input-id="convert-template"
                    extensions="json"
                    v-model="forms"
                    @input="convertForm">
                    Convert form to TypeScript
                  </file-upload>
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="addAlert">
                <v-list-item-action>
                  <v-icon>mdi-plus_alert</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  Add Alert
                </v-list-item-content>
              </v-list-item>
              <v-list-item @click="throwError">
                <v-list-item-action>
                  <v-icon>mdi-alert-circle</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  Throw error
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-toolbar>
        <v-expansion-panel v-model="testSelectorOpen">
          <v-expansion-panel-content>
            <div slot="header">Test suites</div>
            <v-checkbox
              v-model="modulesToRun"
              v-for="name in testModules"
              :key="name"
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
                <v-icon v-if="test.state === SUCCESSFUL" color="success">mdi-check_circle</v-icon>
                <v-icon v-else-if="test.state === FAILED" color="error">mdi-alert-circle</v-icon>
              </v-flex>
              <v-layout column>
                <v-flex>{{test.title}} - {{test.duration}}</v-flex>
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
  </v-flex>
</template>

<script>
  /*global mocha*/
  import LoginServiceCordova from '../services/login/LoginServiceCordova'
  import LoginServiceWeb from '../services/login/LoginServiceWeb'
  import config from 'config'
  import { randomFrom } from '../classes/M'
  import 'mocha/mocha.js'
  import testModules from '../../test/services/index'
  import { FormBuilder } from '../../test/FormBuilder'
  import FileUpload from 'vue-upload-component'
  import Form from '../entities/trellis/Form'
  import { saveAs } from 'file-saver'

  let runner
  export default {
    name: 'service-testing',
    components: {
      FileUpload
    },
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
        debugErrors: false,
        forms: []
      }
      d.state = d.WAITING
      return d
    },
    beforeDestroy () {
      // if (runner) runner.teardown('bdd')
    },
    methods: {
      addAlert () {
        const types = ['error', 'info', 'warn', 'primary', 'secondary']
        if (Math.random() > .5) {
          this.alert(randomFrom(types), 'A persistent alert', {timeout: 0})
        } else {
          this.alert(randomFrom(types), 'A random alert that dismisses itself')
        }
      },
      throwError () {
        throw new Error('Throwing an error from service testing')
      },
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
          err: test.err ? test.err.message : null,
          duration: test.duration
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
      },
      convertForm () {
        if (!this.forms.length) return
        const file = this.forms[0].file
        console.log(file)
        const reader = new FileReader()
        let content
        reader.onload = function (evt) {
          if (evt.target.readyState !== 2) {
            return
          } else if (evt.target.error) {
            throw evt.target.error
          } else {
            content = evt.target.result
            const o = JSON.parse(content)
            const form = new Form().fromSnakeJSON(o.form)
            const template = FormBuilder.formToTemplate(form)
            const str = FormBuilder.templateToTSFile(template)
            saveAs(new Blob([str]), file.name.replace('.json', '') + '.ts')
          }
        }
        reader.readAsText(file)
      }
    },
  }
</script>
