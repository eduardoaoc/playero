<template>
  <svg
    v-if="icon"
    :width="size"
    :height="size"
    :viewBox="icon.viewBox"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-for="(node, index) in icon.nodes" :key="index">
      <path v-if="node.type === 'path'" v-bind="node.attrs" />
      <rect v-else-if="node.type === 'rect'" v-bind="node.attrs" />
      <circle v-else-if="node.type === 'circle'" v-bind="node.attrs" />
      <line v-else-if="node.type === 'line'" v-bind="node.attrs" />
      <polyline v-else-if="node.type === 'polyline'" v-bind="node.attrs" />
    </template>
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [Number, String],
    default: 20,
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.7,
  },
});

const gridIcon = {
  viewBox: '0 0 24 24',
  nodes: [
    { type: 'rect', attrs: { x: 3, y: 3, width: 7, height: 7, rx: 1.6 } },
    { type: 'rect', attrs: { x: 14, y: 3, width: 7, height: 7, rx: 1.6 } },
    { type: 'rect', attrs: { x: 14, y: 14, width: 7, height: 7, rx: 1.6 } },
    { type: 'rect', attrs: { x: 3, y: 14, width: 7, height: 7, rx: 1.6 } },
  ],
};

const calendarBase = {
  viewBox: '0 0 24 24',
  nodes: [
    { type: 'rect', attrs: { x: 3, y: 4, width: 18, height: 18, rx: 2 } },
    { type: 'line', attrs: { x1: 16, y1: 2, x2: 16, y2: 6 } },
    { type: 'line', attrs: { x1: 8, y1: 2, x2: 8, y2: 6 } },
    { type: 'line', attrs: { x1: 3, y1: 10, x2: 21, y2: 10 } },
  ],
};

const icons = {
  dashboard: gridIcon,
  grid: gridIcon,
  search: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'circle', attrs: { cx: 11, cy: 11, r: 7 } },
      { type: 'line', attrs: { x1: 21, y1: 21, x2: 16.65, y2: 16.65 } },
    ],
  },
  sun: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'circle', attrs: { cx: 12, cy: 12, r: 4 } },
      { type: 'line', attrs: { x1: 12, y1: 2, x2: 12, y2: 6 } },
      { type: 'line', attrs: { x1: 12, y1: 18, x2: 12, y2: 22 } },
      { type: 'line', attrs: { x1: 2, y1: 12, x2: 6, y2: 12 } },
      { type: 'line', attrs: { x1: 18, y1: 12, x2: 22, y2: 12 } },
      { type: 'line', attrs: { x1: 4.2, y1: 4.2, x2: 6.9, y2: 6.9 } },
      { type: 'line', attrs: { x1: 17.1, y1: 17.1, x2: 19.8, y2: 19.8 } },
      { type: 'line', attrs: { x1: 4.2, y1: 19.8, x2: 6.9, y2: 17.1 } },
      { type: 'line', attrs: { x1: 17.1, y1: 6.9, x2: 19.8, y2: 4.2 } },
    ],
  },
  bell: {
    viewBox: '0 0 24 24',
    nodes: [
      {
        type: 'path',
        attrs: { d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' },
      },
      { type: 'path', attrs: { d: 'M13.73 21a2 2 0 0 1-3.46 0' } },
    ],
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    nodes: [{ type: 'polyline', attrs: { points: '6 9 12 15 18 9' } }],
  },
  filter: {
    viewBox: '0 0 24 24',
    nodes: [{ type: 'path', attrs: { d: 'M22 3H2l8 9v7l4 2v-9z' } }],
  },
  plus: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'line', attrs: { x1: 12, y1: 5, x2: 12, y2: 19 } },
      { type: 'line', attrs: { x1: 5, y1: 12, x2: 19, y2: 12 } },
    ],
  },
  'arrow-up-right': {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'line', attrs: { x1: 7, y1: 17, x2: 17, y2: 7 } },
      { type: 'polyline', attrs: { points: '7 7 17 7 17 17' } },
    ],
  },
  user: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'path', attrs: { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: 12, cy: 7, r: 4 } },
    ],
  },
  users: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'path', attrs: { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: 9, cy: 7, r: 4 } },
      { type: 'path', attrs: { d: 'M23 21v-2a4 4 0 0 0-3-3.87' } },
      { type: 'path', attrs: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } },
    ],
  },
  calendar: calendarBase,
  'calendar-check': {
    viewBox: '0 0 24 24',
    nodes: [...calendarBase.nodes, { type: 'path', attrs: { d: 'M9 16l2 2 4-4' } }],
  },
  'calendar-plus': {
    viewBox: '0 0 24 24',
    nodes: [
      ...calendarBase.nodes,
      { type: 'line', attrs: { x1: 12, y1: 14, x2: 12, y2: 19 } },
      { type: 'line', attrs: { x1: 9.5, y1: 16.5, x2: 14.5, y2: 16.5 } },
    ],
  },
  clipboard: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'path', attrs: { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' } },
      { type: 'rect', attrs: { x: 9, y: 2, width: 6, height: 4, rx: 1 } },
      { type: 'line', attrs: { x1: 9, y1: 12, x2: 15, y2: 12 } },
      { type: 'line', attrs: { x1: 9, y1: 16, x2: 15, y2: 16 } },
    ],
  },
  shield: {
    viewBox: '0 0 24 24',
    nodes: [{ type: 'path', attrs: { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' } }],
  },
  sparkle: {
    viewBox: '0 0 24 24',
    nodes: [{ type: 'path', attrs: { d: 'M12 2l2.7 5.6 6.2.9-4.5 4.3 1.1 6.2L12 16.8 6.5 19l1.1-6.2L3.1 8.5l6.2-.9L12 2z' } }],
  },
  settings: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'line', attrs: { x1: 4, y1: 21, x2: 4, y2: 14 } },
      { type: 'line', attrs: { x1: 4, y1: 10, x2: 4, y2: 3 } },
      { type: 'line', attrs: { x1: 12, y1: 21, x2: 12, y2: 12 } },
      { type: 'line', attrs: { x1: 12, y1: 8, x2: 12, y2: 3 } },
      { type: 'line', attrs: { x1: 20, y1: 21, x2: 20, y2: 16 } },
      { type: 'line', attrs: { x1: 20, y1: 12, x2: 20, y2: 3 } },
      { type: 'line', attrs: { x1: 1, y1: 14, x2: 7, y2: 14 } },
      { type: 'line', attrs: { x1: 9, y1: 8, x2: 15, y2: 8 } },
      { type: 'line', attrs: { x1: 17, y1: 16, x2: 23, y2: 16 } },
    ],
  },
  check: {
    viewBox: '0 0 24 24',
    nodes: [{ type: 'path', attrs: { d: 'M20 6L9 17l-5-5' } }],
  },
  clock: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
      { type: 'path', attrs: { d: 'M12 7v5l3 3' } },
    ],
  },
  x: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'line', attrs: { x1: 18, y1: 6, x2: 6, y2: 18 } },
      { type: 'line', attrs: { x1: 6, y1: 6, x2: 18, y2: 18 } },
    ],
  },
  'user-plus': {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'path', attrs: { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' } },
      { type: 'circle', attrs: { cx: 12, cy: 7, r: 4 } },
      { type: 'line', attrs: { x1: 19, y1: 8, x2: 19, y2: 14 } },
      { type: 'line', attrs: { x1: 16, y1: 11, x2: 22, y2: 11 } },
    ],
  },
  'grid-plus': {
    viewBox: '0 0 24 24',
    nodes: [
      ...gridIcon.nodes,
      { type: 'line', attrs: { x1: 18, y1: 18, x2: 18, y2: 22 } },
      { type: 'line', attrs: { x1: 16, y1: 20, x2: 20, y2: 20 } },
    ],
  },
  ban: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'circle', attrs: { cx: 12, cy: 12, r: 9 } },
      { type: 'line', attrs: { x1: 6.5, y1: 6.5, x2: 17.5, y2: 17.5 } },
    ],
  },
  logout: {
    viewBox: '0 0 24 24',
    nodes: [
      { type: 'path', attrs: { d: 'M14 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2' } },
      { type: 'line', attrs: { x1: 7, y1: 12, x2: 21, y2: 12 } },
      { type: 'polyline', attrs: { points: '17 8 21 12 17 16' } },
    ],
  },
};

const icon = computed(() => icons[props.name] || icons.dashboard);
</script>

