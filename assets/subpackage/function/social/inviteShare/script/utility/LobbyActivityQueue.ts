type ActivityStep = () => void | Promise<void>;

const queue: ActivityStep[] = [];

export function enqueueLobbyActivity(step: ActivityStep): void {
    queue.push(step);
}

export function runNextLobbyActivity(): void {
    const next = queue.shift();
    if (next) {
        void Promise.resolve(next()).catch(() => undefined);
    }
}

export function preloadSharePopBundle(): void {
    void import("../CommShareModule").then((m) => m.preloadCommShare());
}
