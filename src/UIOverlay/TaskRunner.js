// Copyright (c) 2023 LG Electronics, Inc.
// SPDX-License-Identifier: LicenseRef-EnactBrowser-Evaluation
//
// You may not use this content except in compliance with the License.
// You may obtain a copy of the License at
//
// https://github.com/webosose/com.webos.app.enactbrowser/blob/master/LICENSE

class Task {
    constructor(promiseFunc) {
        this.done = false;
        this.started = false;
        this.promiseFunc = promiseFunc;
    }

    run() {
        this.started = true;
        return this.promiseFunc().then(() => {
            this.done = true;
        });
    }
}

class TaskRunner {

    static tasks = [];

    // Create and push a task with provided promisified function. Then execute tasks.
    addFunc(func) {
        TaskRunner.tasks.push(new Task(func));
        setTimeout(() => this.run(), 0);
    }

    run() {
        const result = TaskRunner.tasks.reduce((lastPromise, task) => {
            return lastPromise.then(() => task.started ? null : task.run());
        }, Promise.resolve());

        TaskRunner.tasks = [new Task(() => result), ...TaskRunner.tasks.filter(t => !t.done)];
    }
}

if (typeof window !== 'undefined') {
    window.tasks = TaskRunner.tasks;
}

export {Task, TaskRunner};
