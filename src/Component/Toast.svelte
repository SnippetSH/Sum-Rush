<script lang="ts">
    import { toast } from "@/store";
    import { fly } from "svelte/transition";
</script>

{#if $toast.visible}
    <div
      in:fly={{ y: 50, duration: 300}}
      out:fly={{ y: 50, duration: 300}}
      class="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-lg font-bold text-white transition-colors duration-300"
      class:bg-green-500={$toast.type === "success"}
      class:bg-red-500={$toast.type === "error"}
    >
      {$toast.message}
    </div>
{/if}

<style>
    
</style>