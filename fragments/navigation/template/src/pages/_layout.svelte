<script>
    import NavBar from "../components/Navbar/Bar.svelte";
</script>

<header>
    <NavBar />
</header>
<main>
    <slot>
        <!-- optional fallback -->
    </slot>
</main>
<footer />
