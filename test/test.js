class Dispatchers {
    constructor() {
        this.flag = {
            isRecursion: false,
            isConcurrent: false,
            isFail: false
        };
        this.handle = {
            result: {},
            arguments: {},
            stopRecursion: false,
            recursion: function () {
                console.log(this);
                if (this.flag.isFail || this.flag.isRecursion) {
                    return;
                }
                this.flag.isRecursion = true;
            },
            concurrency: () => {
                if (this.flag.isFail || this.flag.isConcurrent) {
                    return;
                }
                this.flag.isConcurrent = true;
            },
            fail: () => {
                this.flag.isConcurrent = this.flag.isRecursion = false;
                this.flag.isFail = true;
            }
        };
    }
    execute() {
        this.handle.recursion();
    }
}
let a = new Dispatchers();
a.execute();
