<script setup lang="ts">
import { useAttrs, computed } from "#imports";

// Get all attributes passed to the component
const attrs = useAttrs();

// Extract title from common fields for display
const blockTitle = computed(() => {
  return (
    attrs.title ||
    attrs.name ||
    attrs.heading ||
    attrs.blockType ||
    "Unknown Block"
  );
});
</script>

<template>
  <div class="contentstack-fallback-block">
    <div class="contentstack-fallback-block__header">
      <h3 class="contentstack-fallback-block__title">
        {{ blockTitle }}
      </h3>
      <span class="contentstack-fallback-block__type">
        Type: {{ attrs.blockType || "unknown" }}
      </span>
    </div>

    <div class="contentstack-fallback-block__content">
      <details class="contentstack-fallback-block__details">
        <summary>View Attributes</summary>
        <pre class="contentstack-fallback-block__json">{{ $attrs }}</pre>
      </details>
    </div>

    <div class="contentstack-fallback-block__footer">
      <small>
        This is a fallback component. Map "{{ attrs.blockType }}" to a proper
        Vue component.
      </small>
    </div>
  </div>
</template>

<style scoped>
.contentstack-fallback-block {
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin: 0.5rem 0;
  background-color: #f8fafc;
  font-family: system-ui, -apple-system, sans-serif;
}

.contentstack-fallback-block__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.contentstack-fallback-block__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.contentstack-fallback-block__type {
  font-size: 0.875rem;
  color: #64748b;
  background-color: #e2e8f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.contentstack-fallback-block__content {
  margin-bottom: 0.75rem;
}

.contentstack-fallback-block__details {
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.contentstack-fallback-block__details summary {
  padding: 0.5rem;
  background-color: #f1f5f9;
  cursor: pointer;
  font-weight: 500;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.contentstack-fallback-block__details summary:hover {
  background-color: #e2e8f0;
}

.contentstack-fallback-block__details[open] summary {
  border-bottom: 1px solid #e2e8f0;
}

.contentstack-fallback-block__json {
  margin: 0;
  padding: 1rem;
  background-color: #ffffff;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #1e293b;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.contentstack-fallback-block__footer {
  color: #64748b;
  font-size: 0.875rem;
  font-style: italic;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .contentstack-fallback-block {
    background-color: #1e293b;
    border-color: #475569;
  }

  .contentstack-fallback-block__title {
    color: #f1f5f9;
  }

  .contentstack-fallback-block__type {
    background-color: #475569;
    color: #e2e8f0;
  }

  .contentstack-fallback-block__header {
    border-bottom-color: #475569;
  }

  .contentstack-fallback-block__details {
    border-color: #475569;
  }

  .contentstack-fallback-block__details summary {
    background-color: #334155;
    color: #e2e8f0;
    border-bottom-color: #475569;
  }

  .contentstack-fallback-block__details summary:hover {
    background-color: #475569;
  }

  .contentstack-fallback-block__json {
    background-color: #0f172a;
    color: #e2e8f0;
  }

  .contentstack-fallback-block__footer {
    color: #94a3b8;
  }
}
</style>
