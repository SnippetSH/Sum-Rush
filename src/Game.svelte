<script lang="ts">
    import { onMount } from "svelte";
    import { time, isStart, score } from "./store";
    import { get } from "svelte/store";

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

    // 각 스테이지에서 몇 개의 숫자를 표시할지 설정
    const stageInterval = [3, 5, 8, 8, 4, 4, 4, 5, 5, 6, 6, 4];
    const currentStageNumbers: number[] = [];

    // 현재 표시 중인 숫자
    let currentNumber = Math.floor(Math.random() * maxNum) + 1;
    let reviewingNumber = 0;
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

    // 컴포넌트가 마운트되면 게임 시작
    onMount(() => {
        currentTime = get(time);
        previousTime = currentTime;

        setTimeout(() => {}, 1000);
        const timeoutInterval = setInterval(() => {
            currentTime -= 1;
            // 시간이 다 되면 게임 종료
            if (currentTime <= 0) {
                clearInterval(timeoutInterval);
                clearInterval(intervalID ? intervalID : 0);
                isStart.set(false);
            }
        }, 1000);

        // 첫 스테이지 시작
        startStage();
    });

    /**
     * 스테이지를 시작하는 함수
     */
    function startStage() {
        // 스테이지 범위를 넘어가면 (게임 클리어)
        if (stage >= stageInterval.length) {
            return;
        }

        // 스테이지 초기화
        countCurrentStage = 1;
        currentNumber = Math.floor(Math.random() * maxNum) + 1;
        currentStageNumbers.push(currentNumber);
        correctAnswer = currentNumber;
        inputValue = "";

        // 0.8초마다 숫자 표시
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

            // 이번 스테이지에서 필요한 숫자를 다 표시했으면
            if (countCurrentStage === stageInterval[stage]) {
                console.log("정답: ", correctAnswer);
                // 인터벌 정지
                clearInterval(intervalID!);
                intervalID = null;
                // 여기서부터는 유저가 답을 입력하길 기다림

                if (stage === 4) {
                    maxNum = 18;
                } else if (stage === 7) {
                    maxNum = 27;
                } else if (stage === 10) {
                    maxNum = 36;
                }
            }
        }, 1000);
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
                clearInterval(reviewInterval);
                currentNumber = temp;
                isReviewing = false;
                currentStageNumbers.length = 0;
            }
        }, 1000);
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

    $: if (!intervalID) {
        inputElement?.focus();
    }
</script>

<!-- 간단한 UI -->
<div
    style="width: {width}px; height: {height}px;"
    class="bg-[#FFAAA1]/50 relative flex flex-col justify-center items-center rounded-2xl"
>
    <!-- 남은 시간 표시 -->
    <div
        class="retrosans text-center absolute top-2 left-2 w-16 h-10 flex justify-center bg-[#404352]/70 items-center rounded-lg"
    >
        <h1 class="text-2xl text-center pt-1.5 text-white">{currentTime}</h1>
    </div>

    <!-- 현재 스테이지 표시 -->
    <div
        class="retrosans absolute top-2 right-2 w-24 h-10 flex justify-center bg-[#404352]/70 items-center rounded-lg"
    >
        <h1 class="text-lg pt-1 text-white">stage: {stage + 1}</h1>
    </div>
    <div>
        <h1 class="text-lg pt-1 text-white">score: {$score}</h1>
    </div>

    <!-- 숫자 표시 영역 -->
    <div
        style="width: {innerWidth}px; height: {innerHeight}px;"
        class="border-2 flex justify-center items-center rounded-2xl mb-10"
        class:red-block={intervalID ? false : true}
        class:blue-block={isReviewing}
    >
        <p
            id="number"
            class="text-center text-5xl font-bold text-black opacity-100"
        >
            {currentNumber === 0 ? "" : currentNumber}
        </p>
    </div>

    <!-- 정답 입력 & 확인 버튼 -->
    {#if !intervalID}
        <div class="h-8 text-white">답을 입력하세요</div>
    {:else}
        <div class="h-8 text-white">정답을 계산하세요</div>
    {/if}
    <input
        type="text"
        on:input={handleInput}
        bind:value={inputValue}
        disabled={intervalID ? true : false}
        bind:this={inputElement}
        class="w-1/2 h-10 border-2 rounded-lg text-center text-white bg-transparent"
    />
    <button
        on:click={reviewingNumbers}
        class="mt-2 px-4 py-2 bg-[#FF7B9D] text-white review-button rounded-lg"
        class:review-button={isReviewing}
    >
        다시 보기
    </button>
</div>

<style>
    .red-block {
        background-color: #F4A460;
    }

    .blue-block {
        background-color: #6e7d95;
    }

    .review-button {
        background-color: #FF7B9D;
    }

    .review-button:hover {
        cursor: pointer;
        scale: 1.05;
    }
</style>
