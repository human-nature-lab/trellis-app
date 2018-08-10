<template>
  <v-container fill-height>
    <v-layout>
      <v-flex>
        <v-container>
          <v-layout row>
            <v-flex xs12>
              <v-card>
                <v-card-title>
                  <h3 class="headline mb-0">Login</h3>
                </v-card-title>
                <v-card-text>
                  <v-form>
                    <v-text-field
                      label="Username"
                      v-model="name"
                      required>
                    </v-text-field>
                    <v-text-field
                      label="Password"
                      v-model="password"
                      required>
                    </v-text-field>
                  </v-form>
                </v-card-text>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'login',
    data: () => ({
      name: '',
      password: ''
    })
  }
</script>

