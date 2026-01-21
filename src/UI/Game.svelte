<script lang="ts">
    import { onMount, tick } from "svelte";
    import { time, isStart, score, showToast } from "@/store";
    import { get } from "svelte/store";

    export let diff: string;
    // 화면에 표시할 레이아웃 관련
    let width = window.innerWidth / 4;
    let height = width * 0.93;
    if (window.innerWidth < 1280 && window.innerWidth >= 500) {
        width = window.innerWidth - 100;
        height = width * 1.03;
    } else if (window.innerWidth < 500) {
        width = window.innerWidth - 50;
        height = width * 1.3;
    }
    const innerWidth = width / 3;
    const innerHeight = innerWidth;

    // 전체 제한 시간 (초)
    let currentTime: number = 0;
    let previousTime: number = 0;

    // 현재 스테이지 (0부터 시작)
    let stage = 0;
    let maxNum = 9;

    let nickname = "";
    let showGameOverModal = false;

    // 각 스테이지에서 몇 개의 숫자를 표시할지 설정
    const stageInterval = [
        3, 5, 6, 6, 4, 4, 4, 5, 5, 6, 6, 6, 6, 6, 6, 5, 5, 5, 5, 5, 6, 6, 6, 6,
        6, 7, 7, 7, 8, 8, 8, 8, 8, 8, 9, 10, 10, 10, 10, 10, 12, 12, 12, 12, 12,
    ];
    let currentStageNumbers: number[] = [];

    // 현재 표시 중인 숫자
    let currentNumber = Math.floor(Math.random() * maxNum) + 1;
    let isReviewing = false;

    // 이번 스테이지에서 누적된 정답(합계)
    let correctAnswer = currentNumber;

    // 이번 스테이지에서 표시된 숫자 개수
    let countCurrentStage = 1;

    // 숫자를 표시하는 인터벌 ID
    let intervalID: number | null = null;

    // 사용자 입력값
    let inputValue: string | number = "";

    let inputElement: HTMLInputElement;

    let timeoutInterval: ReturnType<typeof setTimeout> | undefined = undefined;

    // 컴포넌트가 마운트되면 게임 시작
    onMount(() => {
        currentTime = get(time);
        // currentTime = 10;
        previousTime = currentTime;

        setTimeout(() => {}, 1000);
        timeoutInterval = setInterval(() => {
            currentTime -= 1;
            // 시간이 다 되면 게임 종료
            if (currentTime <= 0) {
                endGame();
            }
        }, 1000);

        // 첫 스테이지 시작
        startStage();
    });

    async function endGame() {
        clearInterval(timeoutInterval!);
        if (intervalID) clearInterval(intervalID);

        showGameOverModal = true;
    }

    async function submitScore() {
        if (!nickname.trim()) {
            showToast("닉네임을 입력해주세요.", "error");
            return;
        }

        closeGame();

        try {
            const res = await fetch("/api/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nickname: nickname,
                    score: Number($score),
                    limitTime: Number(get(time)),
                }),
            });

            if (res.ok) {
                showToast("점수가 등록되었습니다.", "success");
            } else {
                showToast("점수 등록에 실패했습니다.", "error");
            }
        } catch (e) {
            console.error(e);
            showToast("점수 등록에 실패했습니다.", "error");
        }
    }

    function closeGame() {
        showGameOverModal = false;
        isStart.set(false);
    }

    function goHome() {
        clearInterval(timeoutInterval!);
        if (intervalID) clearInterval(intervalID);
        isStart.set(false);
    }
    /**
     * 스테이지를 시작하는 함수
     */
    let n = 1000;
    function startStage() {
        // 스테이지 범위를 넘어가면 (게임 클리어)
        if (stage >= stageInterval.length) {
            return;
        }

        // 스테이지 초기화
        currentStageNumbers = [];
        countCurrentStage = 1;
        currentNumber = Math.floor(Math.random() * maxNum) + 1;
        currentStageNumbers.push(currentNumber);
        correctAnswer = currentNumber;
        inputValue = "";

        
        // n초마다 숫자 표시
        if(diff === "EASY") {
            n = 800;
        } else if(diff === "NORMAL") {
            n = 650;
        } else if(diff === "HARD") {
            n = 500;
        }
        intervalID = setInterval(() => {
            let newNumber = Math.floor(Math.random() * maxNum) + 1;
            // 이전 숫자와 중복을 피하고 싶다면 아래 while 유지
            while (newNumber === currentNumber) {
                newNumber = Math.floor(Math.random() * maxNum) + 1;
            }

            // 새 숫자 표시
            currentNumber = newNumber;
            // 누적 합계 갱신
            correctAnswer += newNumber;
            // 카운트 증가
            countCurrentStage++;
            currentStageNumbers.push(newNumber);

            // console.log("currentNumber: ", currentStageNumbers);

            // 이번 스테이지에서 필요한 숫자를 다 표시했으면
            if (countCurrentStage === stageInterval[stage]) {
                // console.log("정답: ", correctAnswer);
                // 인터벌 정지
                clearInterval(intervalID!);
                intervalID = null;
                // 여기서부터는 유저가 답을 입력하길 기다림

                if (stage === 4) {
                    maxNum = 22;
                } else if (stage === 7) {
                    maxNum = 28;
                } else if (stage === 10) {
                    maxNum = 34;
                } else if (stage === 12) {
                    maxNum = 40;
                } else if (stage === 15) {
                    maxNum = 80;
                } else if (stage === 20) {
                    maxNum = 100;
                } else if (stage === 25) {
                    maxNum = 120;
                }
            }
        }, n);
    }

    function reviewingNumbers() {
        if (currentStageNumbers.length === 0) {
            return;
        }

        if (intervalID || isReviewing) {
            return;
        }

        isReviewing = true;
        let index = 0;

        let temp = currentNumber;
        currentNumber = currentStageNumbers[index];
        index++;
        const reviewInterval = setInterval(() => {
            if (index < currentStageNumbers.length) {
                currentNumber = currentStageNumbers[index];
                index++;
            } else {
                currentNumber = temp;
                isReviewing = false;
                clearInterval(reviewInterval);
            }
        }, n);
    }

    /**
     * 사용자 입력 핸들러
     */
    function handleInput(event: Event) {
        const value = (event.target as HTMLInputElement).value;
        inputValue = value; // 숫자/문자 구분 없이 저장

        if (!intervalID) {
            checkAnswer();
        }
    }

    /**
     * 유저가 정답을 제출했을 때
     */
    function checkAnswer() {
        const userSum = parseInt(inputValue.toString(), 10);
        // 정답 비교
        if (userSum === correctAnswer) {
            // 다음 스테이지로 이동
            stage++;
            score.update((s) => {
                let current = s;
                current +=
                    ((stage + 1) * (get(time) - (previousTime - currentTime))) /
                    30;

                return Math.floor(current);
            });
            previousTime = currentTime;
            if (stage < stageInterval.length) {
                startStage();
            } else {
                // 마지막 스테이지까지 클리어
                alert("모든 스테이지를 완료했습니다. 축하합니다!");
            }
        }
    }

    $: if (!intervalID && !showGameOverModal) {
        inputElement?.focus();
    }

    function getScreenStyle(isInterval: boolean, review: boolean) {
        if (review)
            return "ring-4 ring-blue-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] border-blue-400"; // 리뷰 모드
        if (!isInterval)
            return "ring-4 ring-[#FF7B9D]/50 shadow-[0_0_15px_rgba(255,123,157,0.3)] border-[#FF7B9D]"; // 입력 모드 (강조)
        return "shadow-[inset_0_2px_6px_rgba(0,0,0,0.05)] border-transparent"; // 기본 (숫자 나오는 중)
    }

    // 상태 메시지 텍스트 및 색상
    $: statusMessage = intervalID
        ? { text: "Memorize...", color: "text-gray-400" }
        : {
              text: "Calculate Now!",
              color: "text-[#FF7B9D] font-bold animate-pulse",
          };

    // [핵심 로직] intervalID가 없어지면(숫자 출력이 끝나면) 실행
    $: if (!intervalID && inputElement && !showGameOverModal) {
        focusInput();
    }

    async function focusInput() {
        // Svelte가 'disabled' 속성을 제거하는 DOM 업데이트를 마칠 때까지 기다림
        await tick();

        // 그 후에 포커스
        inputElement?.focus();
    }
</script>

<div class="absolute top-4 left-4 z-10">
    <button
        on:click={goHome}
        class="hover:cursor-pointer group flex items-center gap-2 px-3 py-2 bg-white/40 backdrop-blur-md border border-white/50 rounded-full hover:bg-white/60 transition-all shadow-sm"
    >
        <span class="text-lg grayscale group-hover:grayscale-0 transition-all"
            >🏠</span
        >
        <span class="text-sm font-bold text-gray-600 group-hover:text-black"
            >Home</span
        >
    </button>
</div>

<div
    style="width: {width}px; height: {height}px;"
    class="relative flex flex-col items-center justify-between py-6 px-4 bg-white/30 backdrop-blur-xl border border-white/60 shadow-2xl rounded-[2.5rem]"
>
    {#if showGameOverModal}
        <div
            class="absolute inset-0 z-50 flex justify-center items-center bg-black/50 rounded-[2.5rem] backdrop-blur-sm transition-all"
        >
            <div
                class="bg-white w-[85%] max-w-xs p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 animate-scale-in"
            >
                <div
                    class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-4xl mb-2 shadow-inner"
                >
                    🏆
                </div>

                <h2 class="retrosans text-2xl text-gray-800">Game Over</h2>

                <div class="text-center">
                    <p
                        class="text-xs text-gray-400 font-bold uppercase tracking-wider"
                    >
                        Final Score
                    </p>
                    <p class="retrosans text-5xl text-[#FF7B9D] drop-shadow-sm">
                        {$score}
                    </p>
                </div>

                <div class="w-full">
                    <input
                        id="nickname"
                        type="text"
                        bind:value={nickname}
                        placeholder="Enter your nickname"
                        class="w-full text-center bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-[#FF7B9D] focus:border-transparent outline-none transition-all font-bold text-gray-700 placeholder-gray-300"
                    />
                </div>

                <div class="flex gap-3 w-full mt-2">
                    <button
                        on:click={closeGame}
                        class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        on:click={submitScore}
                        class="flex-1 py-3 rounded-xl bg-[#FF7B9D] text-white font-bold text-sm shadow-md hover:bg-[#ff5d86] hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <div class="w-full flex justify-between items-center px-2 mb-4">
        <div
            class="flex flex-col items-center bg-white/50 px-4 py-1.5 rounded-2xl shadow-sm backdrop-blur-sm border border-white/60"
        >
            <span class="text-[10px] text-gray-400 font-bold uppercase"
                >Time</span
            >
            <span
                class="retrosans text-xl text-gray-700 min-w-[3rem] text-center"
                >{currentTime}</span
            >
        </div>

        <div
            class="text-xs font-bold text-gray-400 bg-white/30 px-3 py-1 rounded-full border border-white/40"
        >
            Count: <span class="text-gray-600">{stageInterval[stage]}</span>
        </div>

        <div class="flex gap-2">
            <div
                class="flex flex-col items-center bg-white/50 px-4 py-1.5 rounded-2xl shadow-sm backdrop-blur-sm border border-white/60"
            >
                <span class="text-[10px] text-gray-400 font-bold uppercase"
                    >Stage</span
                >
                <span class="retrosans text-xl text-[#FF7B9D]">{stage + 1}</span
                >
            </div>
            <div
                class="flex flex-col items-center bg-white/50 px-4 py-1.5 rounded-2xl shadow-sm backdrop-blur-sm border border-white/60"
            >
                <span class="text-[10px] text-gray-400 font-bold uppercase"
                    >Score</span
                >
                <span class="retrosans text-xl text-gray-700">{$score}</span>
            </div>
        </div>
    </div>

    <div
        class="flex-1 w-full flex flex-col items-center justify-center relative"
    >
        <div
            class="absolute -top-3 z-10 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100"
        >
            <span
                class="text-xs {statusMessage.color} uppercase tracking-widest transition-colors duration-300"
            >
                {statusMessage.text}
            </span>
        </div>

        <div
            style="width: {innerWidth}px; height: {innerHeight}px;"
            class="bg-white rounded-3xl flex items-center justify-center transition-all duration-300 border-2
                   {getScreenStyle(!!intervalID, isReviewing)}"
        >
            <p
                id="number"
                class="retrosans text-center text-7xl text-gray-800 drop-shadow-sm select-none"
            >
                {currentNumber === 0 ? "" : currentNumber}
            </p>
        </div>
    </div>

    <div class="w-full mt-6 flex flex-col items-center gap-3">
        <div class="relative w-full max-w-[200px]">
            <input
                type="text"
                on:input={handleInput}
                bind:value={inputValue}
                disabled={intervalID || showGameOverModal ? true : false}
                bind:this={inputElement}
                id="number-input"
                placeholder="?"
                class="w-full h-14 bg-white/60 border-b-4 border-gray-200 rounded-t-xl text-center text-3xl font-bold text-gray-800 focus:border-[#FF7B9D] focus:bg-white outline-none transition-all placeholder-gray-300 disabled:bg-transparent disabled:border-transparent disabled:text-transparent"
            />
            <div
                class="absolute bottom-0 left-0 w-full h-1 bg-[#FF7B9D] transform scale-x-0 transition-transform duration-300 peer-focus:scale-x-100"
            ></div>
        </div>

        <button
            on:click={reviewingNumbers}
            disabled={!!intervalID}
            class="text-xs font-bold text-gray-400 hover:text-[#FF7B9D] disabled:opacity-0 transition-colors py-2 px-4 flex items-center gap-1"
            class:text-blue-500={isReviewing}
        >
            {#if isReviewing}
                <span>👀 Reviewing...</span>
            {:else}
                <span>🔍 Review Numbers</span>
            {/if}
        </button>
    </div>
</div>

<style>
    /* 애니메이션 정의 */
    @keyframes scale-in {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }
    .animate-scale-in {
        animation: scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
</style>
