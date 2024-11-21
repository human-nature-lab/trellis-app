<script setup lang="ts">
import global from '../static/singleton'
import { routeQueue } from '@/router'
import { secondaryDrawerIcon, secondaryDrawerOnClick, secondaryDrawerTooltip } from '@/helpers/drawer.helper'
import { isTestStudy } from '@/helpers/singleton.helper'
import Banner from './Banner.vue'

defineProps<{
  maintenanceMode: boolean;
  serverMode: string;
  showBanner: boolean;
}>()

function toStudySelector () {
  routeQueue.pushAndReturnToCurrent({ name: 'StudySelector' })
}

function toLocaleSelector () {
  routeQueue.pushAndReturnToCurrent({ name: 'LocaleSelector' })
}

</script>

<template>
  <v-app-bar
    app
    absolute
    elevate-on-scroll
    scroll-target="#trellis-main"
  >
    <v-app-bar-nav-icon
      :disabled="maintenanceMode"
      @click="global.menuDrawer.open = !global.menuDrawer.open"
    />
    <v-toolbar-title class="logo">
      <router-link
        :to="{name: 'Home'}"
        class="deep-orange--text"
      >
        <img
          src="../assets/trellis-logo.png?url"
          alt="trellis"
        >
      </router-link>
    </v-toolbar-title>
    <v-toolbar-title
      v-if="global.study"
      class="study"
    >
      <v-tooltip right>
        <template #activator="{ on, attrs }">
          <v-btn
            class="subheading"
            v-on="on"
            v-bind="attrs"
            :color="isTestStudy ? 'error' : null"
            text
            @click="toStudySelector"
          >
            {{ global.study.name }}
            <v-icon
              class="ml-2"
              v-if="isTestStudy"
              color="error"
            >
              mdi-dev-to
            </v-icon>
          </v-btn>
        </template>
        <span>{{ $t('change_study') }}</span>
      </v-tooltip>
    </v-toolbar-title>
    <v-spacer />
    <v-tooltip left>
      <template #activator="{ on, attrs }">
        <v-btn
          class="subheading"
          icon
          v-bind="attrs"
          v-on="on"
          @click="toLocaleSelector"
        >
          {{ global.locale ? global.locale.languageTag : '' }}
        </v-btn>
      </template>
      <span>{{ $t('change_locale') }}</span>
    </v-tooltip>
    <v-tooltip
      v-if="secondaryDrawerIcon"
      :disabled="!secondaryDrawerTooltip"
      bottom
      left
    >
      <template #activator="{on, attrs}">
        <v-icon
          v-on="on"
          v-bind="attrs"
          @click.stop="secondaryDrawerOnClick"
        >
          {{ secondaryDrawerIcon }}
        </v-icon>
      </template>
      <span>{{ secondaryDrawerTooltip }}</span>
    </v-tooltip>

    <template
      v-if="showBanner"
      #extension
    >
      <Banner :server-mode="serverMode" />
    </template>
  </v-app-bar>
</template>
