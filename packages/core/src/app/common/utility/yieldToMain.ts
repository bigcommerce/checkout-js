export function yieldToMain () {
    if (window.scheduler?.yield) {
        return window.scheduler.yield();
    }

    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}
