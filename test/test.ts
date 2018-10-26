class Dispatchers {

    private flag = {
        isRecursion: false,
        isConcurrent: false,
        isFail: false
    }

    private handle = {
        result: {},
        arguments: {},
        stopRecursion: false,
        recursion: () => {
            
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

    public execute () {
        this.handle.recursion();
    }

}

let a = new Dispatchers();

a.execute();