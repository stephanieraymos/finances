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
  --color-dark-background: #121212;
  --color-dark-gray: #353535;
  --color-white: #E0E0E0;
  --color-primary: #121212;

  /** shades, 0-n, dark to light */
  --shade-0: #1b1a1d;
  --shade-1: #1b191e;
  --shade-2: #211e24;
  --shade-3: #1E1E1E;
  --shade-4: #4f4d54;
  --shade-5: #5a5960;
  --shade-6: #6c6c6f;
  --shade-7: #717275;
  --shade-75: #9b9b9d;
  --shade-8: #cdcdcd;
  --shade-9: #dedede;
  --shade-10: #efefef;

  --cards: var(--shade-3);
  --borders-lines: #2A2A2A;

  --color-orange: #FF9800;
  --color-pink: #ff69b4;
  --color-blue: #3A8EF6;
  --color-blue-hover: #5EA0FC;
  --color-red: #F44336;
  --color-green: #4CAF50;
  --color-yellow: #f8f83c;

  --text-primary: var(--color-white); /* contrast againt primary */
  --text-secondary: #B0B0B0;
  --info-note: #00BCD4;
  --highlight: #3A3A3A;
}
* {
  padding: 0;
  color: var(--text-primary);
  margin: 0;
  box-sizing: border-box;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  font-family: "Inter", "Poppins", "Manrope", sans-serif;

  li {
    list-style: none;
  }

  h1 {
    font-size: 24px;
  }
  h2 {
    font-size: 22px;
  }
  h3 {
    font-size: 20px;
  }
  h4 {
    font-size: 18px;
  }
  h5 {
    font-size: 16px;
  }
  h6 {
    font-size: 14px;
  }
  p {
    font-size: 14px;
  }
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
  }
}
html, body {
  height: 100%;
  width: 100%;
  font-size: 16px;
  line-height: 1.5;
  background-color: var(--color-dark-background);
}
#app {
  background: var(--dark-shade-1);
  font-family: var(--font);
}
</style>
