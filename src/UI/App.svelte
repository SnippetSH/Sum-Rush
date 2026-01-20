<script>
  import Game from "./Game.svelte";
  import { time, isStart, score } from "@/store";
  import { get } from "svelte/store";
  import { fade, scale } from "svelte/transition";
  import { inject } from "@vercel/analytics";
  import { injectSpeedInsights } from "@vercel/speed-insights";
  import Toast from "@/Component/Toast.svelte";
  import Rank from "@/Component/Rank.svelte";

  inject({ mode: "auto" });
  injectSpeedInsights();

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

  let currentSec = get(time);
  function onChangeSeconds(sec) {
    $time = sec;
    currentSec = get(time);
  }
  const secs = [120, 180, 240];
</script>

<div
  class="pretendard w-screen h-screen bg-linear-to-tl from-[#E4E1DC] via-[#F7F6F5] to-[#EBE9E6] flex flex-col justify-center items-center"
>
  {#if $isStart}
    <Game />
  {:else}
    <div
      style="width: {width}px; height: {height}px;"
      class="relative flex flex-col justify-center items-center"
    >
      <div
        class="w-[90%] max-w-sm bg-white/40 backdrop-blur-md border border-white/60 shadow-2xl rounded-3xl p-8 flex flex-col items-center gap-6"
      >
        <h1
          class="retrosans text-4xl text-[#FF7B9D] drop-shadow-sm tracking-wide"
        >
          SUM RUSH
        </h1>

        <div class="flex flex-col items-center">
          <span
            class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1"
            >Last Score</span
          >
          <span class="retrosans text-6xl text-gray-800 drop-shadow-sm">
            {currentScore}
          </span>
        </div>

        <div class="flex bg-gray-200/50 p-1.5 rounded-2xl w-full">
          {#each secs as sec}
            <button
              on:click={() => onChangeSeconds(sec)}
              class="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 relative
                  {currentSec === sec
                ? 'bg-white text-[#FF7B9D] shadow-md scale-100 ring-1 ring-black/5'
                : 'text-gray-400 hover:text-gray-600 hover:bg-white/50'}"
            >
              {sec}s
            </button>
          {/each}
        </div>

        <button
          class="w-full bg-[#FF7B9D] hover:bg-[#ff5d86] text-white text-2xl retrosans py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 active:scale-95 flex justify-center items-center group"
          on:click={start}
        >
          <span class="pt-1">GAME START</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="absolute bottom-10 flex gap-4">
      <button
        class="px-6 py-2 rounded-full bg-white/80 hover:bg-white text-gray-600 font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        on:click={showRule}
      >
        <span>📜</span> Game Rule
      </button>
    </div>
    <Rank />
  {/if}

  {#if isRule}
    <div
      class="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm"
      transition:fade={{ duration: 200 }}
      on:click={showRule}
    >
      <div
        class="bg-white w-[90%] max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden"
        transition:scale={{ duration: 300, start: 0.95 }}
        on:click|stopPropagation
      >
        <div
          class="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"
        ></div>

        <div class="text-center mb-8 relative">
          <h1 class="retrosans text-3xl text-gray-800 tracking-wide">
            📜 Game Rule
          </h1>
          <div class="w-10 h-1 bg-[#FF7B9D] mx-auto mt-3 rounded-full"></div>
        </div>

        <div class="flex flex-col gap-6 mb-8 relative">
          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            >
              🧠
            </div>
            <div>
              <p
                class="retrosans text-lg font-bold text-gray-800 leading-tight"
              >
                숫자를 기억하고 더하세요
              </p>
              <p class="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                Remember the numbers until they stop changing and add them up.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            >
              💯
            </div>
            <div>
              <p
                class="retrosans text-lg font-bold text-gray-800 leading-tight"
              >
                정답을 맞추면 점수 UP!
              </p>
              <p class="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                If the number you entered is correct, your score will go up.
              </p>
            </div>
          </div>

          <div class="flex items-start gap-4">
            <div
              class="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
            >
              ⏱️
            </div>
            <div>
              <p
                class="retrosans text-lg font-bold text-gray-800 leading-tight"
              >
                제한 시간을 선택하세요
              </p>
              <p class="text-xs text-gray-400 mt-1 font-medium leading-relaxed">
                You can choose between 120, 180, and 240 seconds.
              </p>
            </div>
          </div>
        </div>

        <button
          class="w-full bg-[#FF7B9D] hover:bg-[#ff5d86] text-white text-lg font-bold py-3.5 rounded-2xl shadow-lg shadow-pink-200 transition-all active:scale-95"
          on:click={showRule}
        >
          알겠어요! (Close)
        </button>
      </div>
    </div>
  {/if}

  <Toast />
</div>

<style>
</style>
