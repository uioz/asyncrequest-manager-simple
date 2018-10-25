import { RunningDiagram, RequestManger, keyType, Stragegy, StragegyInf, StragegyHandle, Diagram } from "./types";
import { Tool } from "./tool";

/**
 * 该接口用于描述一个用于记号判断的对象
 */
interface exceptionMod {
    [key: string]: boolean;
    isRecursion: boolean;
    isConcurrent: boolean;
    isFail: boolean;
};

/**
 * 执行器类,他的作用是将传入的可执行策略图
 */
export class Dispatchers {

    private tools: Tool;

    constructor(tools: Tool) {
        this.tools = tools;
    }

    private flag:exceptionMod = {
        isRecursion: false,
        isConcurrent: false,
        isFail: false
    }

    private handle: StragegyHandle = {
        result: {},
        arguments: {},
        stopRecursion: false,
        recursion: () => {
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

    private async groupProcess(){

    }

    private async failProcess(){

    }

    private async concurrentProcess(){

    }

    private async recursiveProcess(){

    }
    
    /**
     * 异步执行器
     */
    public async execute(runningDiagramName: keyType) {

    }

}
