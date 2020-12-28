<script>
  import { url, isActive } from '@roxi/routify'
  export let children = []
  export let depth = 0
  export let maxDepth = Infinity
  depth++
  const getClass = path => $isActive(path) ? 'active' : ''
</script>

<ul>
  {#each children as { path, title, children }}
    <li data-nav-depth={depth}>
      <!-- we use $url to resolve the path  -->
      <a href={path} use:$url class={getClass(path)}> {title}</a>

      <!-- parse nested children here -->
      {#if children && depth < maxDepth}
        <svelte:self {children} {depth} {maxDepth} />
      {/if}
    </li>
  {/each}
</ul>

<style>
  .active {
    font-weight: bold;
  }
  ul {
    padding-left: 12px;
  }
  li {
    list-style: none;
  }
</style>
