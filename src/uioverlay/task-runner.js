// Copyright 2023 LG Electronics, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// SPDX-License-Identifier: Apache-2.0

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

    static tasks = []; // jshint ignore:line

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
