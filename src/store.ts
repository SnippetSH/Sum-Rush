import { writable } from "svelte/store";

const time = writable<number>(120);
const isStart = writable<Boolean>(false);
const score = writable<number>(0);

score.subscribe((value) => {
    localStorage.setItem("score", value.toString());
})

export { time, isStart, score };