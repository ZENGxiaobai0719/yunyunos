<template>
  <div class="loading-card">
    <div class="loading-cover" />
    <div class="loading-data">
      <div class="loading-shimmer" style="width: 60%; height: 14px; margin-bottom: 8px" />
      <div class="loading-shimmer" style="width: 40%; height: 12px; margin-bottom: 4px" />
      <div class="loading-shimmer" style="width: 80%; height: 12px" />
    </div>
  </div>
</template>

<style scoped>
.loading-card {
  background: rgb(var(--color-foreground, 250,252,252));
  border-radius: 3px;
  box-shadow: 0 4px 6px rgba(49,54,68,.05), 0 5px 20px rgba(49,54,68,.08);
  display: inline-grid;
  grid-template-columns: 185px auto;
  height: 265px;
  min-width: 370px;
  overflow: hidden;
  position: relative;
}
.loading-card::after {
  animation: loading-pulse 2s ease-in-out infinite;
  background: linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.04) 50%, rgba(0,0,0,0) 100%);
  content: '';
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 2;
}
.loading-cover {
  background: rgb(217,223,229);
  height: 100%;
}
.loading-data {
  padding: 17px;
}
.loading-shimmer {
  background: rgb(217,223,229);
  border-radius: 3px;
}

@keyframes loading-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

@media (max-width: 800px) {
  .loading-card { grid-template-columns: 175px auto; min-width: 330px; width: 100%; }
}
@media (max-width: 380px) {
  .loading-card { grid-template-columns: 150px auto; height: 230px; min-width: 320px; }
}
</style>
