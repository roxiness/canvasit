<script>
  import { Router } from '@roxi/routify'
  import { routes } from '../.routify/routes'

  const config = {
    useHash: false,
  }
</script>

<Router { config } { routes } />
