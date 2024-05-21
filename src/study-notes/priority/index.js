import * as Scheduler from "scheduler";

const tasks = [
  1, 1, 2, 2, 3, 3, 4, 4, 1, 2, 3, 4, 1, 2, 3, 4, 3, 2, 1, 1, 1, 1, 1,
];

tasks.forEach((priority, i) => {
  Scheduler.unstable_scheduleCallback(
  priority,
    () => {
      console.log(priority, `第${i}任务`);
    });
});

console.log("script!");

Promise.resolve().then(() => console.log("script屁股后的微任务"));
