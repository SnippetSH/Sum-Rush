<script>
  import { onMount } from "svelte";
  import Game from "./Game.svelte";
  import { time, isStart, score } from "./store";
  import { inject } from '@vercel/analytics';

  inject({mode: 'auto'});

  let width = window.innerWidth / 4;
  let height = width * 0.725;
  if (window.innerWidth < 1280 && window.innerWidth >= 500) {
    width = window.innerWidth - 100;
    height = width * 0.725;
  } else if (window.innerWidth < 500 && window.innerWidth >= 350) {
    width = window.innerWidth - 50;
    height = width * 0.9;
  } else if (window.innerWidth < 350) {
    width = 310;
    height = 320 * 1.2;
  }

  let currentScore = 0;
  score.subscribe(() => {
    const s = localStorage.getItem("score");
    if (s) {
      currentScore = parseInt(s);
    }
  });

  function start() {
    isStart.set(true);
    score.set(0);
  }

  let isRule = false;
  function showRule() {
    isRule = !isRule;
  }
</script>

<div
  class="pretendard w-screen h-screen bg-linear-to-tl from-[#E4E1DC] via-[#F7F6F5] to-[#EBE9E6] flex flex-col justify-center items-center"
>
  {#if $isStart}
    <Game />
  {:else}
    <div
      style="width: {width}px; height: {height}px;"
      class="bg-[#FFAAA1]/50 relative flex flex-col justify-center items-center rounded-2xl"
    >
      <div
        class="retrosans text-center text-3xl text-black flex justify-center items-center mb-8"
      >
        Score: {currentScore}
      </div>
      <div
        id="time-select"
        class="flex justify-center gap-5 items-center mb-10"
      >
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
          class:is-active={$time === 120}
          on:click={() => {
            time.set(120);
          }}>120</button
        >
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
          class:is-active={$time === 180}
          on:click={() => {
            time.set(180);
          }}>180</button
        >
        <button
          class="button-animation retrosans text-2xl text-white bg-[#ABA899] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
          class:is-active={$time === 240}
          on:click={() => {
            time.set(240);
          }}>240</button
        >
      </div>
      <button
        class="retrosans text-2xl text-white bg-[#404352] px-4 py-2 rounded-lg hover:cursor-pointer hover:scale-105"
        on:click={start}>시작</button
      >
    </div>
    <div class="absolute bottom-5">
      <button
        class="retrosans text-center text-2xl text-black rounded-lg bg-[#FF887B] px-4 pt-3.5 pb-1.5 hover:cursor-pointer hover:scale-105"
        on:click={showRule}
      >
        Game Rule
      </button>
    </div>
  {/if}

  {#if isRule}
    <div
      class="absolute top-0 left-0 w-screen h-screen bg-[#000000]/50 flex justify-center items-center"
    >
      <div
        class="bg-[#F7F6F5] w-96 h-108 rounded-lg p-5 flex flex-col justify-center items-start"
      >
        <h1 class="retrosans text-3xl text-black mb-5">Game Rule</h1>
        <p class="retrosans text-lg text-black">
          1. 바뀌는 것이 멈출 때까지 숫자들을 기억하고 더하세요.
        </p>
        <p class="retrosans text-sm text-black mb-1">
          Remember the numbers until they stop changing and add them up.
        <p class="retrosans text-lg text-black">
          2. 입력한 숫자가 정답이면 점수가 올라갑니다.
        </p>
        <p class="retrosans text-sm text-black mb-1">
          If the number you entered is correct, your score will go up.
        </p>
        <p class="retrosans text-lg text-black">
          3. 시간은 120초, 180초, 240초 중 선택할 수 있습니다.
        </p>
        <p class="retrosans text-sm text-black mb-1">
          You can choose between 120, 180, and 240 seconds.
        </p>
        <button
          class="retrosans text-center text-xl text-black rounded-lg bg-[#FF887B] px-4 pt-2.5 pb-1.5 mt-5 hover:cursor-pointer hover:scale-105"
          on:click={showRule}
        >
          Close
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .button-animation {
    transition: all 0.2s;
  }

  .is-active {
    background-color: #ff887b;
  }
</style>
