<script>
  import { onMount } from "svelte";
  import Game from "./Game.svelte";
  import { time, isStart, score } from "./store";

  let width = window.innerWidth / 4;
  let height = width * 0.725;
  if (window.innerWidth < 1280 && window.innerWidth >= 500) {
    width = window.innerWidth - 100;
    height = width * 0.725;
  } else if (window.innerWidth < 500 && window.innerWidth >= 350) {
    width = window.innerWidth - 50;
    height = width * 0.9;
  } else if (window.innerWidth < 350 ) {
    width = 310;
    height = 320 * 1.2;
  }
  
  
  let currentScore = 0;
  score.subscribe(() => {
    const s = localStorage.getItem("score")
    if(s) {
      currentScore = parseInt(s);
    }
  })

  function start() {
    isStart.set(true);
    score.set(0);
  }
</script>

<div
  class="pretendard w-screen h-screen bg-linear-to-tl from-[#E4E1DC] via-[#F7F6F5] to-[#EBE9E6] flex justify-center items-center"
>
  {#if $isStart}
    <Game />
  {:else}
    <div
      style="width: {width}px; height: {height}px;"
      class="bg-[#FFAAA1]/50 relative flex flex-col justify-center items-center rounded-2xl"
    >
      <div class="retrosans text-center text-3xl text-black flex justify-center items-center mb-8">
        Score: {currentScore}
      </div>
      <div id="time-select" class="flex justify-center gap-5 items-center mb-10">
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
          class:is-active={$time === 120}
          on:click={() => {time.set(120)}}>120</button
        >
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
          class:is-active={$time === 180}
          on:click={() => {time.set(180)}}>180</button
        >
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105" 
          class:is-active={$time === 240}
          on:click={() => {time.set(240)}}>240</button
        >
      </div>
      <button
        class="retrosans text-2xl text-white bg-[#404352] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
        on:click={start}>시작</button
      >
    </div>
  {/if}
</div>

<style>
  .button-animation {
    transition: all 0.2s;
  }

  .is-active {
    background-color: #FF887B;
  }
</style>