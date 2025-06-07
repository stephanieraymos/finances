<template>
  <router-view v-if="ready" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "@/lib/supabase";

const router = useRouter();
const ready = ref(false);

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session && router.currentRoute.value.path !== "/login") {
    router.push("/login");
  }

  ready.value = true;
});
</script>
<style lang="scss">
:root {
  --color-dark-gray: #353535;
  --color-medium-gray: #777575;
  --color-light-gray: #909090;
  --color-black: #000;
  --color-primary-dark: #151218;
  --color-primary-middle: #5b5b5c;
  --color-primary-light: #cdcdcd;
  --color-secondary: #ffd18b;
  --color-contrast-dark: #e5e5e5;
  --color-white: #ffffff;
  --color-primary: #23232e;
  --color-error: #f17272;
  --color-error-opacity: #f172725e;

  /** dark shades, 0-n, dark to light */
  --dark-shade-0: #1b1a1d;
  --dark-shade-1: #1b191e;
  --dark-shade-2: #211e24;
  --dark-shade-3: #35333a;
  --dark-shade-4: #4f4d54;
  --dark-shade-5: #5a5960;
  --dark-shade-6: #6c6c6f;
  --dark-shade-7: #717275;
  --dark-shade-75: #9b9b9d;
  --dark-shade-8: #cdcdcd;
  --dark-shade-9: #dedede;
  --dark-shade-10: #efefef;

  /** light shades */
  /** TODO: setup shades to toggle light and dark mode */

  --shade-0: var(--dark-shade-0);
  --shade-1: var(--dark-shade-1);
  --shade-2: var(--dark-shade-2);
  --shade-3: var(--dark-shade-3);
  --shade-4: var(--dark-shade-4);
  --shade-5: var(--dark-shade-5);
  --shade-6: var(--dark-shade-6);
  --shade-7: var(--dark-shade-7);
  --shade-75: var(--dark-shade-75);
  --shade-8: var(--dark-shade-8);
  --shade-9: var(--dark-shade-9);
  --shade-10: var(--dark-shade-10);

  /* important-action colors */
  --submit-blue-dark: rgb(64 177 238);
  --open-blue: var(--submit-blue-dark);
  --merge-green-dark: rgb(64 238 121);
  --merge-green: var(--merge-green-dark);

  /* status background colors */
  --status-draft: #8e5521;
  --status-open: rgb(64 177 238);
  --status-pending: #78e5d2;
  --status-approved: rgb(64 238 121);
  --status-closed: #e57899;
  --status-merged: #4f4d54;

  /* accent colors */
  --rgb-accent: 162, 123, 224;
  --color-accent: rgb(var(--rgb-accent));
  --rgb-highlight: 198 148 234;
  --color-accent-highlight: rgb(var(--rgb-highlight));
  --color-accent-highlight-text: rgb(80, 21, 126);

  /* Department timespan coloring */
  --timespan-default: #84cbff;

  /* Unit colors - Used for GDC report text */
  --color-orange: #ff8c00;
  --color-pink: #ff69b4;
  --color-blue: #005b96;
  --color-red: #ff4500;
  --color-green: #65f83c;
  --color-yellow: #f8f83c;

  /* Shadows */
  --shadow-height-1: 0px 4px 4px rgba(0, 0, 0, 0.25);
  --shadow-height-2: 0px 8px 8px rgba(0, 0, 0, 0.35);
  --shadow-right-height-1: 6px 0px 8px -4px rgba(0, 0, 0, 0.65);
  /* Custom selectbox colors */
  --select-border: var(--color-primary-dark);
  --select-focus: var(--color-secondary);
  --select-arrow: var(--color-white);
  /* TODO: It would be cool if dark/light colors were handled here 🤔 */
  /* dark mode */
  --color-primary-alt: #212126;
  --text-primary: var(--color-white); /* contrast againt primary */

  --font: "Radio Canada", sans-serif;
}
</style>
