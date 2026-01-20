import { writable } from "svelte/store";

const time = writable<number>(120);
const isStart = writable<Boolean>(false);
const score = writable<number>(0);

score.subscribe((value) => {
    localStorage.setItem("score", value.toString());
})

export const toast = writable({
    message: "",
    type: "success",
    visible: false
})

let toastTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

export function showToast(message: string, type = "success") {
    toast.set({
        message: message,
        type: type,
        visible: true
    })

    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.update(t => ({...t, visible: false}));
    }, 3000);
}

export { time, isStart, score };