<script lang="ts">
    import "@/app.css";
    import { time, showToast } from "@/store";
    import { get } from "svelte/store";

    let showLeaderBoard = false;
    let isLoading = false;
    let leaderboard = [];
    $: topTen = leaderboard.slice(0, 10);

    let currentTab = get(time);
    async function getLeaderBoard() {
        currentTab = get(time);
        showLeaderBoard = true;
        isLoading = true;

        try {
            const res = await fetch("/api/leaderboard?limitTime=" + currentTab);

            const data = await res.json();
            // console.log(data);
            leaderboard = data;
        } catch (error) {
            console.error(error);
            showToast("랭킹 조회에 실패했습니다.", "error");
        } finally {
            isLoading = false;
        }
    }

    function getRankBadge(idx) {
        const rank = idx + 1;
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return rank;
    }

    // 3. 1~3등 텍스트 스타일 강조
    function getRankStyle(idx) {
        if (idx < 3) return "font-bold text-black scale-110";
        return "text-gray-500 font-medium";
    }

    
    function onChangeTab(tab: number) {
        currentTab = tab;
        $time = tab;
        getLeaderBoard();
    }

    const tabs = [120, 180, 240];
</script>

{#if !showLeaderBoard}
<div class="absolute top-4 right-4 z-10">
    <button
        on:click={getLeaderBoard}
        class="
            group flex items-center gap-2 px-4 py-2 
            bg-white/80 backdrop-blur-md border border-white/50 
            rounded-full shadow-sm hover:shadow-md hover:cursor-pointer
            transition-all duration-300 hover:-translate-y-0.5
        "
    >
        <span class="text-xl filter drop-shadow-sm group-hover:scale-110 transition-transform">
            🏆
        </span>
        
        <span class="retrosans text-base font-bold text-gray-700 group-hover:text-[#FF7B9D] transition-colors">
            Ranking
        </span>
    </button>
</div>
{/if}

{#if showLeaderBoard}
    <div
        class="absolute top-0 left-0 w-screen h-screen bg-[#000000]/50 flex justify-center items-center"
    >
        <div
            class="bg-[#F7F6F5] w-96 h-200 rounded-lg p-5 flex flex-col justify-start items-center relative"
        >
            <h1 class="absolute top-1 left-2 retrosans text-2xl text-gray-700 font-bold">Ranking</h1>
            <button
                class="absolute top-1 right-1 px-2 py-1 text-sm font-bold text-[#1b0007] hover:shadow-sm scale-100 rounded-lg hover:cursor-pointer"
                on:click={() => (showLeaderBoard = false)}>Close</button
            >
            <div class="mt-5 inline-flex bg-gray-100 p-1 rounded-xl">
                {#each tabs as tab}
                    <button
                        on:click={() => onChangeTab(tab)}
                        class="
                      px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 hover:cursor-pointer
                      {currentTab === tab
                            ? 'bg-white text-[#FF7B9D] shadow-sm scale-100' /* 활성 상태: 흰 배경 + 그림자 + 핑크 텍스트 */
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                    "
                    >
                        {tab}초
                    </button>
                {/each}
            </div>
            <div class="mt-3 w-[90%]">
                {#if isLoading}
                    {#each Array(6) as _}
                        <div class="flex items-center justify-between py-2.5 px-3 bg-white rounded-lg border border-gray-100 shadow-sm">
                            <div class="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                            
                            <div class="flex-1 mx-3 h-5 bg-gray-200 rounded animate-pulse"></div>
                            
                            <div class="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    {/each}
                {:else}
                    {#each topTen as item, idx}
                        <div
                            class="flex items-center justify-between py-2.5 px-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            <div
                                class="w-10 text-center text-lg {getRankStyle(idx)}"
                            >
                                {getRankBadge(idx)}
                            </div>

                            <div
                                class="flex-1 text-left pl-3 text-gray-800 font-semibold truncate"
                            >
                                {item.nickname}
                            </div>

                            <div
                                class="w-16 text-right font-mono font-bold text-[#FF7B9D]"
                            >
                                {item.score}
                            </div>
                        </div>
                    {/each}

                    {#if topTen.length === 0}
                        <div class="text-center py-20 text-gray-400">
                            기록이 없습니다.
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/if}
